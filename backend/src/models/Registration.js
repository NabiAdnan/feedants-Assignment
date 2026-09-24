const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['REGISTERED', 'CANCELLED'],
      default: 'REGISTERED',
    },
    amountPaid: { type: Number, required: true, default: 0 },
    paymentRef: { type: String }, // Razorpay order/payment id in production
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// A user can only hold ONE active registration per competition.
// This unique index is the real safeguard against double-booking/double
// counting spots for the same user - enforced at the database level, not
// just in application code, so it holds even under concurrent requests.
registrationSchema.index(
  { competition: 1, user: 1 },
  { unique: true, partialFilterExpression: { status: 'REGISTERED' } }
);

module.exports = mongoose.model('Registration', registrationSchema);
