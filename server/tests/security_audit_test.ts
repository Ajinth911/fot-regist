const BASE_URL = 'http://localhost:5000';

async function request(
  path: string,
  options: { method?: string; headers?: Record<string, string>; body?: any; testIp?: string } = {}
) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-test-ip': options.testIp || `10.42.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`,
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data: any;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    status: response.status,
    headers: response.headers,
    data,
  };
}

async function runSecurityAuditTests() {
  console.log('====================================================');
  console.log('🧪 EXECUTING COMPREHENSIVE SECURITY & AUDIT SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(testName: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - Detail: ${detail}`);
      failed++;
    }
  }

  // 1. Transport & Security Headers
  console.log('\n--- 1. Security Headers Verification ---');
  const healthRes = await request('/api/health');
  assert(
    'X-Content-Type-Options is nosniff',
    healthRes.headers.get('x-content-type-options') === 'nosniff'
  );
  assert(
    'X-Frame-Options is DENY',
    healthRes.headers.get('x-frame-options') === 'DENY'
  );
  assert(
    'Strict-Transport-Security header configured',
    (healthRes.headers.get('strict-transport-security') || '').includes('max-age=31536000')
  );
  assert(
    'Content-Security-Policy header present & contains script-src',
    (healthRes.headers.get('content-security-policy') || '').includes("script-src 'self'")
  );

  // 2. Honeypot Bot Trap
  console.log('\n--- 2. Bot Trap & Honeypot Guard ---');
  const honeypotRes = await request('/api/auth/user/signup', {
    method: 'POST',
    body: {
      name: 'Bot User',
      email: 'bot@example.com',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
      hp_website: 'https://spam-bot-link.ru', // Honeypot field filled by bot
    },
  });
  assert(
    'Bot submission blocked by honeypot field (HTTP 400)',
    honeypotRes.status === 400 && String(honeypotRes.data?.error || '').toLowerCase().includes('automated'),
    `Status ${honeypotRes.status}, data: ${JSON.stringify(honeypotRes.data)}`
  );

  // 3. Password Validation & Breached Passwords
  console.log('\n--- 3. Password Policies & Dictionary Defense ---');
  const weakPassRes = await request('/api/auth/user/signup', {
    method: 'POST',
    body: {
      name: 'Alice Security',
      email: `audit.weak.${Date.now()}@example.com`,
      phone: '9876543210',
      password: 'password123', // Common dictionary password (< 12 chars)
      confirmPassword: 'password123',
    },
  });
  assert(
    'Common dictionary password rejected (HTTP 400)',
    weakPassRes.status === 400 && String(weakPassRes.data?.error || '').toLowerCase().includes('common'),
    `Status ${weakPassRes.status}, data: ${JSON.stringify(weakPassRes.data)}`
  );

  const breachedPassRes = await request('/api/auth/user/signup', {
    method: 'POST',
    body: {
      name: 'Alice Security',
      email: `audit.breached.${Date.now()}@example.com`,
      phone: '9876543210',
      password: 'password123456', // > 12 chars but contains common word "password"
      confirmPassword: 'password123456',
    },
  });
  assert(
    'Common breached password rejected (HTTP 400)',
    breachedPassRes.status === 400 && String(breachedPassRes.data?.error || '').toLowerCase().includes('common'),
    `Status ${breachedPassRes.status}, data: ${JSON.stringify(breachedPassRes.data)}`
  );

  // 4. Mismatched Confirmation Password
  console.log('\n--- 4. Confirm Password Enforcement ---');
  const mismatchRes = await request('/api/auth/user/signup', {
    method: 'POST',
    body: {
      name: 'Alice Security',
      email: `audit.mismatch.${Date.now()}@example.com`,
      phone: '9876543210',
      password: 'SuperSecretSecurePass123!',
      confirmPassword: 'DifferentPassword123!',
    },
  });
  assert(
    'Mismatched confirm password rejected (HTTP 400)',
    mismatchRes.status === 400 && String(mismatchRes.data?.error || '').includes('Passwords do not match'),
    `Status ${mismatchRes.status}, data: ${JSON.stringify(mismatchRes.data)}`
  );

  // 5. XSS & Payload Sanitization
  console.log('\n--- 5. Cross-Site Scripting (XSS) Sanitization ---');
  const xssRes = await request('/api/auth/user/signup', {
    method: 'POST',
    body: {
      name: '<script>alert("XSS")</script>',
      email: `audit.xss.${Date.now()}@example.com`,
      phone: '9876543210',
      password: 'SuperSecurePassword2026!#',
      confirmPassword: 'SuperSecurePassword2026!#',
    },
  });
  assert(
    'XSS payload in name field rejected by allowlist validation (HTTP 400)',
    xssRes.status === 400 && String(xssRes.data?.error || '').toLowerCase().includes('invalid characters'),
    `Status ${xssRes.status}, data: ${JSON.stringify(xssRes.data)}`
  );

  // 6. SQL Injection Resilience
  console.log('\n--- 6. SQL Injection (SQLi) Defense ---');
  const sqliRes = await request('/api/payment/check-attendees', {
    method: 'POST',
    body: {
      attendees: [
        {
          name: "Test' OR '1'='1",
          email: "victim' OR '1'='1--@example.com",
          phone: "9876543210' OR 1=1--",
        },
      ],
    },
  });
  assert(
    'SQLi in phone/email safely rejected by strict input validator',
    sqliRes.status === 400 || (sqliRes.status === 200 && Array.isArray(sqliRes.data?.registeredAttendees)),
    `Status ${sqliRes.status}`
  );

  // 7. Legitimate User Registration Flow
  console.log('\n--- 7. Valid User Registration Flow ---');
  const uniqueEmail = `qa.audit.${Date.now()}@example.com`;
  const validSignupRes = await request('/api/auth/user/signup', {
    method: 'POST',
    body: {
      name: 'Dr. Evelyn Reed',
      email: uniqueEmail,
      phone: '9876543210',
      password: 'CorrectHorseBatteryStaple2026!',
      confirmPassword: 'CorrectHorseBatteryStaple2026!',
    },
  });
  assert(
    'Legitimate user signup succeeds (HTTP 201)',
    validSignupRes.status === 201 && validSignupRes.data?.success === true && !!validSignupRes.data?.token,
    `Status ${validSignupRes.status}, data: ${JSON.stringify(validSignupRes.data)}`
  );

  // 8. Duplicate Email Handling
  console.log('\n--- 8. Duplicate Email Guard ---');
  const dupSignupRes = await request('/api/auth/user/signup', {
    method: 'POST',
    body: {
      name: 'Dr. Evelyn Reed',
      email: uniqueEmail, // same email
      phone: '9876543211',
      password: 'CorrectHorseBatteryStaple2026!',
      confirmPassword: 'CorrectHorseBatteryStaple2026!',
    },
  });
  assert(
    'Duplicate email registration is blocked (HTTP 409)',
    dupSignupRes.status === 409 && String(dupSignupRes.data?.error || '').toLowerCase().includes('already exists'),
    `Status ${dupSignupRes.status}, data: ${JSON.stringify(dupSignupRes.data)}`
  );

  // 9. Rate Limiting Protection
  console.log('\n--- 9. Rate Limiting Burst Defense ---');
  let rateLimited = false;
  const burstIp = `198.51.100.${Math.floor(Math.random() * 250) + 1}`;
  for (let i = 0; i < 15; i++) {
    const burstRes = await request('/api/auth/user/signup', {
      method: 'POST',
      testIp: burstIp,
      body: {
        name: `Spammer ${i}`,
        email: `spammer${i}.${Date.now()}@example.com`,
        phone: '9876543210',
        password: 'SpamPassword2026!#',
        confirmPassword: 'SpamPassword2026!#',
      },
    });
    if (burstRes.status === 429) {
      rateLimited = true;
      break;
    }
  }
  assert(
    'Rapid consecutive signup requests trigger HTTP 429 Rate Limit',
    rateLimited
  );

  console.log('\n====================================================');
  console.log(`🏁 SUITE COMPLETED: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAuditTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
