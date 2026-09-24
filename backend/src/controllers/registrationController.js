const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const { getLifecycleStage, LIFECYCLE } = require('../utils/competitionState');
const { ApiError } = require('../middleware/errorHandler');

/**
 * POST /api/competitions/:id/register
 *
 * This is the endpoint that has to survive "thousands of concurrent
 * users" hitting register on the last spot at the same time. Strategy:
 *
 * 1. Reserve the spot FIRST with a single atomic, conditional update:
 *      findOneAndUpdate(
 *        { _id, bookedCount: { $lt: totalSpots } },
 *        { $inc: { bookedCount: 1 } }
 *      )
 *    MongoDB executes this as one atomic document operation. If two
 *    requests race for the last spot, the storage engine serialises them
 *    - only one `$inc` can observe bookedCount still < totalSpots and
 *    succeed; the loser's query simply matches nothing and we return 409.
 *    This avoids the classic read-then-write race (GET count, check,
 *    THEN write) which is NOT safe under concurrency.
 *
 * 2. Only after the spot is reserved do we create the Registration
 *    document. Its unique index (competition+user, status=REGISTERED)
 *    stops the same user double-registering (e.g. a retried request from
 *    a flaky connection).
 *
 * 3. If step 2 fails (duplicate registration), we roll back the spot we
 *    reserved in step 1 so bookedCount stays accurate.
 */
async function registerForCompetition(req, res, next) {
  const competitionId = req.params.id;
  const userId = req.user._id;

  let spotReserved = false;

  try {
    const competition = await Competition.findById(competitionId).lean();
    if (!competition || competition.status !== 'PUBLISHED') {
      throw new ApiError(404, 'Competition not found');
    }

    const stage = getLifecycleStage(competition);
    if (stage !== LIFECYCLE.REGISTRATION_OPEN) {
      throw new ApiError(400, `Registration is not open (current stage: ${stage})`);
    }

    // Fast pre-check to fail fast with a friendly message for the common
    // case; the real safety net is the atomic update below.
    const alreadyRegistered = await Registration.findOne({
      competition: competitionId,
      user: userId,
      status: 'REGISTERED',
    }).lean();
    if (alreadyRegistered) {
      throw new ApiError(409, 'You are already registered for this competition');
    }

    // --- Step 1: atomically reserve a spot ---
    const reserved = await Competition.findOneAndUpdate(
      { _id: competitionId, $expr: { $lt: ['$bookedCount', '$totalSpots'] } },
      { $inc: { bookedCount: 1 } },
      { new: true }
    );

    if (!reserved) {
      throw new ApiError(409, 'No spots left for this competition');
    }
    spotReserved = true;

    // --- Step 2: create the registration record ---
    // In production, payment capture (Razorpay order verification) happens
    // here before/atomically with this write. Simplified for this assignment.
    const { paymentRef, amountPaid } = req.body;

    const registration = await Registration.create({
      competition: competitionId,
      user: userId,
      amountPaid: amountPaid ?? reserved.entryFee,
      paymentRef,
      status: 'REGISTERED',
    });

    res.status(201).json({
      registration: { id: registration._id, registeredAt: registration.registeredAt },
      spotsLeft: Math.max(reserved.totalSpots - reserved.bookedCount, 0),
    });
  } catch (err) {
    // --- Step 3: rollback the reserved spot if registration creation failed ---
    if (spotReserved && err.code !== 11000) {
      await Competition.updateOne(
        { _id: competitionId, bookedCount: { $gt: 0 } },
        { $inc: { bookedCount: -1 } }
      ).catch((rollbackErr) =>
        console.error('[registration] rollback failed - manual reconciliation needed:', rollbackErr)
      );
    }

    // Duplicate key from the unique index = the race we described above.
    // The user's spot reservation succeeded (step 1) but their own
    // duplicate registration attempt is rejected - roll back the extra
    // spot we took for this redundant request.
    if (err.code === 11000) {
      if (spotReserved) {
        await Competition.updateOne(
          { _id: competitionId, bookedCount: { $gt: 0 } },
          { $inc: { bookedCount: -1 } }
        ).catch((rollbackErr) =>
          console.error('[registration] rollback failed - manual reconciliation needed:', rollbackErr)
        );
      }
      return res.status(409).json({ message: 'You are already registered for this competition' });
    }

    next(err);
  }
}

/**
 * POST /api/competitions/:id/unregister
 * Releases the spot atomically. Not shown in the provided design, but
 * required for a real product (refund policy is referenced in the UI).
 */
async function cancelRegistration(req, res, next) {
  const competitionId = req.params.id;
  const userId = req.user._id;

  try {
    const competition = await Competition.findById(competitionId).lean();
    if (!competition || competition.status !== 'PUBLISHED') {
      throw new ApiError(404, 'Competition not found');
    }

    const stage = getLifecycleStage(competition);
    if (stage !== LIFECYCLE.REGISTRATION_OPEN) {
      throw new ApiError(400, 'Cannot cancel registration after registration period has closed');
    }

    const registration = await Registration.findOneAndUpdate(
      { competition: competitionId, user: userId, status: 'REGISTERED' },
      { status: 'CANCELLED' }
    );

    if (!registration) {
      throw new ApiError(404, 'Active registration not found');
    }

    await Competition.updateOne(
      { _id: competitionId, bookedCount: { $gt: 0 } },
      { $inc: { bookedCount: -1 } }
    );

    res.json({ message: 'Registration cancelled successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { registerForCompetition, cancelRegistration };
