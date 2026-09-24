const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    registration: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String },
    status: {
      type: String,
      enum: ['UPLOADED', 'UNDER_REVIEW', 'JUDGED', 'DISQUALIFIED'],
      default: 'UPLOADED',
    },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One live submission per user per competition (re-submitting replaces it
// via upsert in the controller rather than creating duplicates).
submissionSchema.index({ competition: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
