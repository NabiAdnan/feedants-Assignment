const mongoose = require('mongoose');

/**
 * Competition is the single source of truth rendered by the Competition
 * Details screen. Nothing about dates, spots, or rewards is hardcoded on
 * the client - it all comes from this document.
 *
 * Spot booking concurrency:
 *  - We do NOT compute "spots left" by counting Registration documents on
 *    every read (expensive under load, and racy between the count-read and
 *    the write that follows it).
 *  - Instead `bookedCount` is a counter on the Competition document itself,
 *    incremented atomically (see registrationController) using
 *    findOneAndUpdate with a guard condition (bookedCount < totalSpots).
 *    MongoDB guarantees that single-document update is atomic, so two
 *    concurrent registrations can never both succeed past capacity.
 */
const rewardSchema = new mongoose.Schema(
  {
    position: { type: Number, required: true }, // 1,2,3...
    label: { type: String, required: true }, // "1st Winner"
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const previousWinnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String, required: true }, // "1st Winner"
    imageUrl: { type: String },
    videoUrl: { type: String },
  },
  { _id: false }
);

const judgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String },
    experienceLabel: { type: String }, // "12+ Years of Experience"
    photoUrl: { type: String },
    introVideoUrl: { type: String },
  },
  { _id: false }
);

const competitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    tags: [{ type: String }], // ["Dance", "Multi-Win"]
    hasCertificate: { type: Boolean, default: false },

    prizePool: { type: Number, required: true },
    entryFee: { type: Number, required: true },

    totalSpots: { type: Number, required: true },
    bookedCount: { type: Number, default: 0, min: 0 },

    judge: judgeSchema,

    registrationOpenAt: { type: Date, required: true },
    registrationCloseAt: { type: Date, required: true },
    submissionStartAt: { type: Date, required: true },
    submissionEndAt: { type: Date, required: true },
    resultDate: { type: Date, required: true },

    aboutShort: { type: String },
    aboutFull: { type: String },
    judgingParameters: [{ criterion: String, description: String, weightage: Number }],
    rulesAndEligibility: [{ type: String }],

    rewards: [rewardSchema],
    previousWinners: [previousWinnerSchema],

    disclaimer: { type: String },
    refundPolicyUrl: { type: String },
    prizeMoneyInfoVideoUrl: { type: String },

    referralDiscountAmount: { type: Number, default: 0 },
    referralEarnAmount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'CANCELLED'],
      default: 'PUBLISHED',
    },
  },
  { timestamps: true }
);

competitionSchema.index({ status: 1, registrationCloseAt: 1 });

module.exports = mongoose.model('Competition', competitionSchema);
