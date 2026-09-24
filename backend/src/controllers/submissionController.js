const fs = require('fs');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');
const { getLifecycleStage, LIFECYCLE } = require('../utils/competitionState');
const { ApiError } = require('../middleware/errorHandler');

/**
 * POST /api/competitions/:id/submissions
 * multipart/form-data, field name "file" (handled by multer in the route).
 * In production, `req.file` would be streamed to S3/Cloud Storage and
 * `fileUrl` would be the resulting CDN URL; multer's local disk storage
 * here is a stand-in so the assignment runs without cloud credentials.
 */
async function uploadSubmission(req, res, next) {
  const competitionId = req.params.id;
  const userId = req.user._id;

  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded (expected multipart field "file")');
    }

    const competition = await Competition.findById(competitionId).lean();
    if (!competition) throw new ApiError(404, 'Competition not found');

    const stage = getLifecycleStage(competition);
    if (stage !== LIFECYCLE.SUBMISSION_OPEN) {
      throw new ApiError(400, `Submissions are not open (current stage: ${stage})`);
    }

    const registration = await Registration.findOne({
      competition: competitionId,
      user: userId,
      status: 'REGISTERED',
    }).lean();

    if (!registration) {
      throw new ApiError(403, 'Only registered participants can submit an entry');
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    // Upsert: re-uploading before the deadline replaces the previous entry
    // instead of creating duplicates (matches the unique index on the model).
    const submission = await Submission.findOneAndUpdate(
      { competition: competitionId, user: userId },
      {
        competition: competitionId,
        user: userId,
        registration: registration._id,
        fileUrl,
        fileType: req.file.mimetype,
        status: 'UPLOADED',
        submittedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      submission: {
        id: submission._id,
        fileUrl: submission.fileUrl,
        status: submission.status,
        submittedAt: submission.submittedAt,
      },
    });
  } catch (err) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {});
    }
    next(err);
  }
}

module.exports = { uploadSubmission };
