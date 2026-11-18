const http = require('http');

/**
 * End-to-End System Integration Test
 * Verifies User Registration, Login, Task Submission, Asynchronous Python Worker Execution,
 * Redis Streams Consumer Groups, Log Persistence, and Results.
 */

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 8080,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    };
    const req = http.request(options, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(resData) }); }
        catch (e) { resolve({ status: res.statusCode, raw: resData }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path,
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    };
    const req = http.request(options, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(resData) }); }
        catch (e) { resolve({ status: res.statusCode, raw: resData }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runE2E() {
  console.log('==================================================');
  console.log('AI Task Processing Platform — End-to-End Test');
  console.log('==================================================');

  // Step 1: Register User
  console.log('\n[1/6] Registering new user account...');
  const userPayload = {
    name: 'Integration Test User',
    email: `integration_${Date.now()}@example.com`,
    password: 'Password123!',
    confirmPassword: 'Password123!'
  };
  const reg = await post('/api/auth/register', userPayload);
  if (reg.status !== 201) {
    throw new Error(`Registration failed with status ${reg.status}: ${JSON.stringify(reg.body)}`);
  }
  const token = reg.body.data.token;
  console.log(`✓ User registered: ${reg.body.data.user.email} (Token acquired)`);

  // Step 2: Submit 4 Tasks
  console.log('\n[2/6] Submitting 4 text-processing tasks to Redis Stream...');
  const t1 = await post('/api/tasks', {
    title: 'Uppercase String Transformation',
    inputText: 'Hello Dolly, Welcome to AI Platform!',
    operation: 'UPPERCASE'
  }, token);

  const t2 = await post('/api/tasks', {
    title: 'Lowercase String Transformation',
    inputText: 'HELLO WORLD LOWERCASE TEST',
    operation: 'LOWERCASE'
  }, token);

  const t3 = await post('/api/tasks', {
    title: 'Reverse String Transformation',
    inputText: 'Hello World',
    operation: 'REVERSE STRING'
  }, token);

  const t4 = await post('/api/tasks', {
    title: 'Word Count Calculation',
    inputText: 'I am learning MERN stack development.',
    operation: 'WORD COUNT'
  }, token);

  console.log(`✓ Task 1 (UPPERCASE): ${t1.body.data.taskId} [${t1.body.data.status}]`);
  console.log(`✓ Task 2 (LOWERCASE): ${t2.body.data.taskId} [${t2.body.data.status}]`);
  console.log(`✓ Task 3 (REVERSE STRING): ${t3.body.data.taskId} [${t3.body.data.status}]`);
  console.log(`✓ Task 4 (WORD COUNT): ${t4.body.data.taskId} [${t4.body.data.status}]`);

  // Step 3: Wait for Python Worker
  console.log('\n[3/6] Waiting 2 seconds for Python worker async execution...');
  await new Promise(r => setTimeout(r, 2000));

  // Step 4: Verify Results
  console.log('\n[4/6] Verifying asynchronous results and statuses...');
  const res1 = await get(`/api/tasks/${t1.body.data.taskId}`, token);
  const res2 = await get(`/api/tasks/${t2.body.data.taskId}`, token);
  const res3 = await get(`/api/tasks/${t3.body.data.taskId}`, token);
  const res4 = await get(`/api/tasks/${t4.body.data.taskId}`, token);

  console.log(`  Task 1 Result: "${res1.body.data.result}" [Status: ${res1.body.data.status}]`);
  console.log(`  Task 2 Result: "${res2.body.data.result}" [Status: ${res2.body.data.status}]`);
  console.log(`  Task 3 Result: "${res3.body.data.result}" [Status: ${res3.body.data.status}]`);
  console.log(`  Task 4 Result: ${res4.body.data.result} [Status: ${res4.body.data.status}]`);

  // Assertions
  if (res1.body.data.result !== 'HELLO DOLLY, WELCOME TO AI PLATFORM!') throw new Error('Uppercase mismatch');
  if (res2.body.data.result !== 'hello world lowercase test') throw new Error('Lowercase mismatch');
  if (res3.body.data.result !== 'dlroW olleH') throw new Error('Reverse string mismatch');
  if (res4.body.data.result !== 6) throw new Error('Word count mismatch');
  console.log('✓ All 4 algorithmic transformations validated successfully!');

  // Step 5: Verify Structured Execution Logs
  console.log('\n[5/6] Inspecting worker execution telemetry logs for Task 1:');
  const logsRes = await get(`/api/tasks/${t1.body.data.taskId}/logs`, token);
  logsRes.body.data.logs.forEach(l => {
    console.log(`  [${new Date(l.timestamp).toLocaleTimeString()}] [${l.level}] ${l.message}`);
  });
  console.log(`✓ ${logsRes.body.data.logs.length} structured events verified.`);

  // Step 6: Verify User Stats Aggregation
  console.log('\n[6/6] Fetching user task metrics:');
  const statsRes = await get('/api/tasks/stats', token);
  console.log('  Aggregated Stats:', statsRes.body.data);
  if (statsRes.body.data.success < 4) throw new Error('Stats count unexpected');

  console.log('\n==================================================');
  console.log('SUCCESS: All end-to-end integration checks passed!');
  console.log('==================================================\n');
}

runE2E().catch(err => {
  console.error('\nE2E Test Failed:', err.message);
  process.exit(1);
});
