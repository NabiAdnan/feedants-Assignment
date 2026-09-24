/**
 * Seeds one competition that matches the provided design exactly, plus a
 * demo user, so the frontend renders pixel-for-pixel identical content
 * to the reference screen on first run.
 *
 * Usage: npm run seed  (reads MONGO_URI from .env)
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Competition = require('../src/models/Competition');
const User = require('../src/models/User');

async function run() {
  await connectDB();

  await Competition.deleteMany({});
  await User.deleteMany({ email: 'demo@feedants.com' });

  const passwordHash = await User.hashPassword('password123');
  const demoUser = await User.create({
    name: 'Demo Participant',
    email: 'demo@feedants.com',
    passwordHash,
    referralCode: 'referral123',
  });

  const now = new Date();
  const days = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  await Competition.create({
    _id: '6ab42011fb1f883fa9b63a33',
    title: 'Feedants Classical Dance',
    tags: ['Dance', 'Multi-Win'],
    hasCertificate: true,

    prizePool: 1500,
    entryFee: 99,

    totalSpots: 20,
    bookedCount: 1, // "1 / 20 Booked" as shown in the design

    judge: {
      name: 'Manju Dubey',
      title: 'Judge',
      experienceLabel: '12+ Years of Experience',
      photoUrl: '/uploads/judges/manju-dubey.png',
      introVideoUrl: 'https://example-cdn.feedants.com/judges/manju-dubey-intro.mp4',
    },

    // Registration closes ~1d 6h from now to reproduce the "01d:06h:28m:32s" countdown
    registrationOpenAt: days(-5),
    registrationCloseAt: new Date(now.getTime() + (1 * 24 + 6) * 60 * 60 * 1000 + 28 * 60 * 1000),
    submissionStartAt: days(4),
    submissionEndAt: days(8),
    resultDate: days(10),

    aboutShort:
      'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.',
    aboutFull:
      'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance. Entries are judged on technique, expression, costume and choreography by a panel of professional classical dancers. Multiple winners are recognised across positions, and every participant who submits a valid entry receives a certificate of participation.',
    judgingParameters: [
      { criterion: 'Technique', description: 'Precision of classical form and footwork', weightage: 30 },
      { criterion: 'Expression', description: 'Emotive storytelling (abhinaya)', weightage: 25 },
      { criterion: 'Choreography', description: 'Composition and use of space', weightage: 25 },
      { criterion: 'Costume & Presentation', description: 'Authenticity and stage presence', weightage: 20 },
    ],
    rulesAndEligibility: [
      'Open to all age groups; solo entries only.',
      'Performance must be in a recognised Indian classical dance style.',
      'Video submissions must be a single, uncut take between 2-5 minutes.',
      'Only contributions from paid participants will be considered for judging.',
      'Feedants reserves the right to disqualify entries violating community guidelines.',
    ],

    rewards: [
      { position: 1, label: '1st Winner', amount: 550 },
      { position: 2, label: '2nd Winner', amount: 300 },
      { position: 3, label: '3rd Winner', amount: 240 },
      { position: 4, label: '4th Winner', amount: 200 },
      { position: 5, label: '5th Winner', amount: 130 },
      { position: 6, label: '6th Winner', amount: 80 },
    ],

    previousWinners: [
      {
    name: 'Riya Shah',
    position: '1st Winner',
    imageUrl: '/uploads/winners/riya-shah.png',
  },
  {
    name: 'Aarav Mehta',
    position: '1st Winner',
    imageUrl: '/uploads/winners/aarav-mehta.png',
  },
  {
    name: 'Neha Verma',
    position: '2nd Winner',
    imageUrl: '/uploads/winners/neha-verma.png',
  },
  {
    name: 'Ishita Chopra',
    position: '3rd Winner',
    imageUrl: '/uploads/winners/ishita-chopra.png',
  },
    ],

    disclaimer: 'Only contributions from paid participants will be considered for judging.',
    refundPolicyUrl: 'https://feedants.com/refund-policy',
    prizeMoneyInfoVideoUrl: 'https://example-cdn.feedants.com/info/how-you-receive-prize-money.mp4',

    referralDiscountAmount: 10,
    referralEarnAmount: 10,

    status: 'PUBLISHED',
  });

  console.log('[seed] done. Demo user: demo@feedants.com / password123');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
