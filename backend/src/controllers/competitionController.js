const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');
const { buildCompetitionView } = require('../utils/competitionState');
const { ApiError } = require('../middleware/errorHandler');

/**
 * GET /api/competitions
 * Lightweight list for a home/explore feed. Only fields needed for a card.
 */
async function listCompetitions(req, res, next) {
  try {
    const { status = 'PUBLISHED', page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Competition.find({ status })
        .select('title tags prizePool entryFee totalSpots bookedCount registrationCloseAt')
        .sort({ registrationCloseAt: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Competition.countDocuments({ status }),
    ]);

    res.json({
      items: items.map((c) => ({
        ...c,
        spotsLeft: Math.max(c.totalSpots - c.bookedCount, 0),
      })),
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/competitions/:id
 * Returns everything the Competition Details screen needs in one call:
 * static competition content + this user's personalised state
 * (registered? submitted? what can they do right now?).
 * Auth is optional here so a logged-out user can still browse the screen.
 */
async function getCompetition(req, res, next) {
  try {
    const competition = await Competition.findById(req.params.id).lean();
    if (!competition || competition.status === 'DRAFT') {
      throw new ApiError(404, 'Competition not found');
    }

    let registration = null;
    let submission = null;

    if (req.user) {
      [registration, submission] = await Promise.all([
        Registration.findOne({
          competition: competition._id,
          user: req.user._id,
          status: 'REGISTERED',
        }).lean(),
        Submission.findOne({ competition: competition._id, user: req.user._id }).lean(),
      ]);
    }

    const view = buildCompetitionView(competition, { registration, submission });

    res.json({
      competition: {
        id: competition._id,
        title: competition.title,
        tags: competition.tags,
        hasCertificate: competition.hasCertificate,
        prizePool: competition.prizePool,
        entryFee: competition.entryFee,
        totalSpots: competition.totalSpots,
        bookedCount: competition.bookedCount,
        judge: competition.judge,
        registrationOpenAt: competition.registrationOpenAt,
        registrationCloseAt: competition.registrationCloseAt,
        submissionStartAt: competition.submissionStartAt,
        submissionEndAt: competition.submissionEndAt,
        resultDate: competition.resultDate,
        aboutShort: competition.aboutShort,
        aboutFull: competition.aboutFull,
        judgingParameters: competition.judgingParameters,
        rulesAndEligibility: competition.rulesAndEligibility,
        rewards: competition.rewards,
        previousWinners: competition.previousWinners,
        disclaimer: competition.disclaimer,
        refundPolicyUrl: competition.refundPolicyUrl,
        prizeMoneyInfoVideoUrl: competition.prizeMoneyInfoVideoUrl,
        referralDiscountAmount: competition.referralDiscountAmount,
        referralEarnAmount: competition.referralEarnAmount,
      },
      // Server-computed - the frontend renders this directly rather than
      // re-deriving business rules on-device.
      viewState: view,
      // Present only when authenticated + relevant
      registration: registration
        ? { id: registration._id, registeredAt: registration.registeredAt }
        : null,
      submission: submission
        ? { id: submission._id, fileUrl: submission.fileUrl, status: submission.status, submittedAt: submission.submittedAt }
        : null,
      serverTime: new Date().toISOString(), // client syncs its countdown to this, not device clock
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCompetitions, getCompetition };
