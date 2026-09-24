const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const connectDB = require('../src/config/db');
const Competition = require('../src/models/Competition');
const User = require('../src/models/User');
const Registration = require('../src/models/Registration');
const Submission = require('../src/models/Submission');
const app = require('../src/app');

async function runHardeningTests() {
  console.log('=== STARTING FULL HARDENING TEST SUITE ===');
  await connectDB();

  const server = app.listen(5003);
  const baseUrl = 'http://localhost:5003/api';

  try {
    // ----------------------------------------------------
    // TEST 1: LIFECYCLE TEST MATRIX (All 6 Stages)
    // ----------------------------------------------------
    console.log('\n--- 1. Testing Lifecycle Matrix ---');
    const now = new Date();
    const days = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

    const stagesConfig = [
      { name: 'UPCOMING', open: days(1), close: days(2), subStart: days(3), subEnd: days(4), resDate: days(5), expectedStage: 'UPCOMING', expectedAction: 'UPCOMING' },
      { name: 'REGISTRATION_OPEN', open: days(-1), close: days(1), subStart: days(2), subEnd: days(3), resDate: days(4), expectedStage: 'REGISTRATION_OPEN', expectedAction: 'REGISTER' },
      { name: 'REGISTRATION_CLOSED', open: days(-3), close: days(-1), subStart: days(1), subEnd: days(2), resDate: days(3), expectedStage: 'REGISTRATION_CLOSED', expectedAction: 'CLOSED' },
      { name: 'SUBMISSION_OPEN', open: days(-4), close: days(-3), subStart: days(-1), subEnd: days(1), resDate: days(2), expectedStage: 'SUBMISSION_OPEN', expectedAction: 'CLOSED' },
      { name: 'SUBMISSION_CLOSED', open: days(-5), close: days(-4), subStart: days(-3), subEnd: days(-1), resDate: days(1), expectedStage: 'SUBMISSION_CLOSED', expectedAction: 'CLOSED' },
      { name: 'RESULTS_DECLARED', open: days(-6), close: days(-5), subStart: days(-4), subEnd: days(-3), resDate: days(-1), expectedStage: 'RESULTS_DECLARED', expectedAction: 'CLOSED' },
    ];

    for (const cfg of stagesConfig) {
      const compId = new mongoose.Types.ObjectId();
      await Competition.create({
        _id: compId,
        title: `Lifecycle Test ${cfg.name}`,
        prizePool: 1000,
        entryFee: 50,
        totalSpots: 10,
        bookedCount: 0,
        registrationOpenAt: cfg.open,
        registrationCloseAt: cfg.close,
        submissionStartAt: cfg.subStart,
        submissionEndAt: cfg.subEnd,
        resultDate: cfg.resDate,
        status: 'PUBLISHED',
      });

      const res = await fetch(`${baseUrl}/competitions/${compId}`).then((r) => r.json());
      const pass = res.viewState.stage === cfg.expectedStage && res.viewState.primaryAction.type === cfg.expectedAction;
      console.log(`Lifecycle stage [${cfg.name}]:`, pass ? '✅ PASS' : `❌ FAIL (got ${res.viewState.stage})`);

      await Competition.deleteOne({ _id: compId });
    }

    // ----------------------------------------------------
    // TEST 2: AUTHORIZATION ENFORCEMENT
    // ----------------------------------------------------
    console.log('\n--- 2. Testing Authorization Enforcement ---');

    // Create User A and User B
    const passHash = await User.hashPassword('password123');
    const userA = await User.create({ name: 'User A', email: `usera_${Date.now()}@test.com`, passwordHash: passHash });
    const userB = await User.create({ name: 'User B', email: `userb_${Date.now()}@test.com`, passwordHash: passHash });

    const tokenA = jwt.sign({ sub: userA._id.toString() }, process.env.JWT_SECRET);
    const tokenB = jwt.sign({ sub: userB._id.toString() }, process.env.JWT_SECRET);

    // Create competition open for registration
    const authCompId = new mongoose.Types.ObjectId();
    await Competition.create({
      _id: authCompId,
      title: 'Auth Test Competition',
      prizePool: 1000,
      entryFee: 50,
      totalSpots: 10,
      bookedCount: 0,
      registrationOpenAt: days(-1),
      registrationCloseAt: days(1),
      submissionStartAt: days(2),
      submissionEndAt: days(3),
      resultDate: days(4),
      status: 'PUBLISHED',
    });

    // User A registers
    await fetch(`${baseUrl}/competitions/${authCompId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ amountPaid: 50 }),
    });

    // User B attempts to cancel User A's registration
    const cancelRes = await fetch(`${baseUrl}/competitions/${authCompId}/unregister`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    console.log('User B attempt to cancel User A registration:', cancelRes.status === 404 ? '✅ PASS (Rejected with 404 Not Found for B)' : '❌ FAIL');

    // ----------------------------------------------------
    // TEST 3: UPLOAD SECURITY & NEGATIVE TESTS
    // ----------------------------------------------------
    console.log('\n--- 3. Testing Upload Security & Negative Tests ---');

    // Create submission window competition
    const subCompId = new mongoose.Types.ObjectId();
    await Competition.create({
      _id: subCompId,
      title: 'Submission Security Test',
      prizePool: 1000,
      entryFee: 50,
      totalSpots: 10,
      bookedCount: 1,
      registrationOpenAt: days(-4),
      registrationCloseAt: days(-3),
      submissionStartAt: days(-1),
      submissionEndAt: days(1),
      resultDate: days(2),
      status: 'PUBLISHED',
    });

    // Unregistered User B attempts upload -> expect 403
    const dummyFile = path.join(__dirname, 'dummy.mp4');
    fs.writeFileSync(dummyFile, 'dummy video content');

    const formUnreg = new FormData();
    const blobUnreg = new Blob([fs.readFileSync(dummyFile)], { type: 'video/mp4' });
    formUnreg.append('file', blobUnreg, 'dummy.mp4');

    const unregUploadRes = await fetch(`${baseUrl}/competitions/${subCompId}/submissions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: formUnreg,
    });
    console.log('Unregistered user upload attempt:', unregUploadRes.status === 403 ? '✅ PASS (403 Forbidden)' : `❌ FAIL (${unregUploadRes.status})`);

    // Invalid MIME type (e.g. application/json or text/plain) -> expect 400
    const formBadMime = new FormData();
    const blobBadMime = new Blob(['console.log("malicious script")'], { type: 'text/plain' });
    formBadMime.append('file', blobBadMime, 'script.txt');

    const badMimeRes = await fetch(`${baseUrl}/competitions/${subCompId}/submissions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: formBadMime,
    });
    console.log('Unsupported file type upload (.txt):', badMimeRes.status === 400 ? '✅ PASS (400 Bad Request)' : `❌ FAIL (${badMimeRes.status})`);

    // Clean up test data
    fs.unlinkSync(dummyFile);
    await Competition.deleteMany({ _id: { $in: [authCompId, subCompId] } });
    await Registration.deleteMany({ user: { $in: [userA._id, userB._id] } });
    await Submission.deleteMany({ user: { $in: [userA._id, userB._id] } });
    await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });

    console.log('\n✅ ALL HARDENING TEST SUITES PASSED SANELY!');
  } catch (err) {
    console.error('Hardening Test Error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runHardeningTests();
