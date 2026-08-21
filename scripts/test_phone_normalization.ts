import { normalizeNigerianPhone } from '../lib/validations/phone';

const testCases = [
  { input: '08012345678', expected: '+2348012345678', shouldPass: true },
  { input: '8012345678', expected: '+2348012345678', shouldPass: true },
  { input: '2348012345678', expected: '+2348012345678', shouldPass: true },
  { input: '+2348012345678', expected: '+2348012345678', shouldPass: true },
  { input: '+234 801 234 5678', expected: '+2348012345678', shouldPass: true },
  { input: '0801 234 5678', expected: '+2348012345678', shouldPass: true },
  { input: '0801-234-5678', expected: '+2348012345678', shouldPass: true },
  { input: '(0801) 234 5678', expected: '+2348012345678', shouldPass: true },
  { input: '07012345678', expected: '+2347012345678', shouldPass: true },
  { input: '09012345678', expected: '+2349012345678', shouldPass: true },
  { input: '09112345678', expected: '+2349112345678', shouldPass: true },
  { input: '08112345678', expected: '+2348112345678', shouldPass: true },
  { input: '12345', expected: null, shouldPass: false },
  { input: 'invalid text', expected: null, shouldPass: false },
  { input: '080123456', expected: null, shouldPass: false },
  { input: '06012345678', expected: null, shouldPass: false }, // 060 is not a valid NG mobile prefix
];

console.log('=== RUNNING NIGERIAN PHONE NORMALIZATION TEST SUITE ===');
let allPassed = true;

for (const tc of testCases) {
  const res = normalizeNigerianPhone(tc.input);
  const passed = res.isValid === tc.shouldPass && res.canonicalPhone === tc.expected;
  if (passed) {
    console.log(`[PASS] "${tc.input}" -> "${res.canonicalPhone}" (error: ${res.error})`);
  } else {
    console.error(`[FAIL] "${tc.input}" -> got "${res.canonicalPhone}", expected "${tc.expected}"`);
    allPassed = false;
  }
}

if (!allPassed) {
  console.error('\n❌ SOME TESTS FAILED');
  process.exit(1);
} else {
  console.log('\n✅ ALL TEST CASES PASSED PERFECTLY');
}
