const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const connectDB = require('../src/config/db');
const Competition = require('../src/models/Competition');
const User = require('../src/models/User');
const Registration = require('../src/models/Registration');
const Submission = require('../src/models/Submission');
const app = require('../src/app');

async function runApiTests() {
  console.log('=== STARTING FULL API SUITE TESTS ===');
  await connectDB();

  const server = app.listen(5002);
  const baseUrl = 'http://localhost:5002';

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
    console.log('GET /health:', healthRes.status === 'ok' ? '✅ PASS' : '❌ FAIL');

    // 2. Auth register & login
    const email = `test_api_${Date.now()}@feedants.com`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'API Tester', email, password: 'password123' }),
    });
    const regData = await regRes.json();
    console.log('POST /api/auth/register:', regRes.status === 201 && regData.token ? '✅ PASS' : '❌ FAIL');

    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' }),
    });
    const loginData = await loginRes.json();
    console.log('POST /api/auth/login:', loginRes.status === 200 && loginData.token ? '✅ PASS' : '❌ FAIL');
    const token = loginData.token;

    // 3. List competitions
    const listRes = await fetch(`${baseUrl}/api/competitions`).then((r) => r.json());
    console.log('GET /api/competitions:', Array.isArray(listRes.items) ? '✅ PASS' : '❌ FAIL');

    // 4. Get seeded competition details
    const compId = '6ab42011fb1f883fa9b63a33';
    const compRes = await fetch(`${baseUrl}/api/competitions/${compId}`).then((r) => r.json());
    console.log(
      'GET /api/competitions/:id (Public viewState):',
      compRes.competition && compRes.viewState ? '✅ PASS' : '❌ FAIL'
    );

    // 5. Unauthenticated registration attempt -> expect 401
    const unauthRegRes = await fetch(`${baseUrl}/api/competitions/${compId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    console.log('POST /api/competitions/:id/register (Unauthenticated):', unauthRegRes.status === 401 ? '✅ PASS' : '❌ FAIL');

    // 6. Authenticated registration -> expect 201
    const authRegRes = await fetch(`${baseUrl}/api/competitions/${compId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amountPaid: 99 }),
    });
    const authRegData = await authRegRes.json();
    console.log('POST /api/competitions/:id/register (Authenticated):', authRegRes.status === 201 ? '✅ PASS' : '❌ FAIL');

    // 7. Duplicate registration -> expect 409
    const dupRegRes = await fetch(`${baseUrl}/api/competitions/${compId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amountPaid: 99 }),
    });
    console.log('POST /api/competitions/:id/register (Duplicate):', dupRegRes.status === 409 ? '✅ PASS' : '❌ FAIL');

    // 8. Invalid ObjectId -> expect 400
    const invalidIdRes = await fetch(`${baseUrl}/api/competitions/invalid-id`);
    console.log('GET /api/competitions/invalid-id:', invalidIdRes.status === 400 ? '✅ PASS' : '❌ FAIL');

    // Clean up test user & registration
    await Registration.deleteMany({ user: loginData.user.id });
    await User.deleteOne({ _id: loginData.user.id });

    console.log('\n✅ ALL API TEST SUITES EXECUTED SUCCESSFULLY!');
  } catch (err) {
    console.error('API Test Error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runApiTests();
