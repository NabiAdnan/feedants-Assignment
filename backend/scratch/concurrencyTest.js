const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const connectDB = require('../src/config/db');
const Competition = require('../src/models/Competition');
const User = require('../src/models/User');
const Registration = require('../src/models/Registration');
const app = require('../src/app');

async function testConcurrency() {
  console.log('=== STARTING REGISTRATION CONCURRENCY TEST ===');

  await connectDB();

  // Start Express server on temporary port 5001 for testing
  const server = app.listen(5001);
  const baseUrl = 'http://localhost:5001/api';

  try {
    // 1. Setup a test competition with totalSpots = 20, bookedCount = 19 (1 spot left)
    const testCompId = new mongoose.Types.ObjectId();
    const now = new Date();
    const days = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

    const comp = await Competition.create({
      _id: testCompId,
      title: 'Concurrency Test Dance Competition',
      tags: ['Test'],
      prizePool: 1000,
      entryFee: 50,
      totalSpots: 20,
      bookedCount: 19, // 1 spot remaining!
      registrationOpenAt: days(-1),
      registrationCloseAt: days(2),
      submissionStartAt: days(3),
      submissionEndAt: days(5),
      resultDate: days(7),
      status: 'PUBLISHED',
    });

    console.log(`Created test competition ${testCompId}: 19/20 spots booked (1 spot remaining).`);

    // 2. Create 10 distinct test users with JWT tokens
    const numUsers = 10;
    const testUsers = [];

    for (let i = 1; i <= numUsers; i++) {
      const email = `testuser_${Date.now()}_${i}@test.com`;
      const passHash = await User.hashPassword('password123');
      const user = await User.create({
        name: `Test User ${i}`,
        email,
        passwordHash: passHash,
      });

      const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      testUsers.push({ user, token });
    }

    console.log(`Created ${numUsers} distinct test users.`);

    // 3. Fire 10 simultaneous registration requests
    console.log(`Firing ${numUsers} simultaneous registration requests against 1 remaining spot...`);

    const requests = testUsers.map(({ token }, index) =>
      fetch(`${baseUrl}/competitions/${testCompId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amountPaid: 50 }),
      })
        .then(async (res) => {
          const body = await res.json().catch(() => ({}));
          return { index, status: res.status, data: body };
        })
        .catch((err) => ({
          index,
          status: 500,
          message: err.message,
        }))
    );

    const results = await Promise.all(requests);

    // 4. Analyze results
    const successes = results.filter((r) => r.status === 201);
    const conflicts = results.filter((r) => r.status === 409);
    const errors = results.filter((r) => r.status !== 201 && r.status !== 409);

    console.log('\n--- RESULTS SUMMARY ---');
    console.log(`Successful Registrations (201): ${successes.length}`);
    console.log(`Rejected Overbooking Attempts (409): ${conflicts.length}`);
    console.log(`Unexpected Errors: ${errors.length}`);

    // 5. Check database consistency
    const updatedComp = await Competition.findById(testCompId);
    const regCount = await Registration.countDocuments({
      competition: testCompId,
      status: 'REGISTERED',
    });

    console.log(`Final bookedCount in DB: ${updatedComp.bookedCount}`);
    console.log(`Total Registration Documents in DB: ${regCount}`);

    // Clean up test data
    await Competition.deleteOne({ _id: testCompId });
    await Registration.deleteMany({ competition: testCompId });
    await User.deleteMany({ _id: { $in: testUsers.map((u) => u.user._id) } });

    // Assertions
    if (successes.length === 1 && conflicts.length === numUsers - 1 && updatedComp.bookedCount === 20) {
      console.log('\n✅ CONCURRENCY TEST PASSED! Exactly 1 spot was claimed, 9 were safely rejected, and database remained consistent.');
    } else {
      console.error('\n❌ CONCURRENCY TEST FAILED! Spot overbooking or inconsistency detected.');
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

testConcurrency();
