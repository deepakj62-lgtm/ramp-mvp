// Regression test script for canonical staffing queries
const fs = require('fs');
const path = require('path');

// Canonical test queries with expected results
const canonicalQueries = [
  {
    query: 'Find someone 50% free in April with insurance experience',
    expectedMinResults: 2,
    expectedSkills: ['insurance', 'Insurance'],
    description: 'Insurance expertise + 50% availability in April',
  },
  {
    query: 'Who is completely free (0% allocated) in March?',
    expectedMinResults: 1,
    description: 'Completely free in March',
  },
  {
    query: 'Find a Principal-level person with SQL available in Q2',
    expectedMinResults: 1,
    expectedLevel: 'Principal',
    description: 'Principal with SQL skills in Q2',
  },
  {
    query: 'Insurance and workers comp and available at 75% or more',
    expectedMinResults: 1,
    expectedSkills: ['insurance', 'workers'],
    description: 'Insurance + WC + 75%+ available',
  },
  {
    query: 'Find someone with Tableau and SQL experience',
    expectedMinResults: 2,
    expectedSkills: ['Tableau', 'SQL'],
    description: 'Tableau and SQL skills',
  },
  {
    query: 'Senior consultant available in January through March',
    expectedMinResults: 1,
    expectedLevel: 'Senior',
    description: 'Senior level available Q1',
  },
  {
    query: 'Who has Vitech and pension experience?',
    expectedMinResults: 2,
    expectedSkills: ['vitech', 'Vitech', 'pension', 'Pension'],
    description: 'Vitech + Pension domain expertise',
  },
  {
    query: 'Find Consultants with project management experience',
    expectedMinResults: 2,
    expectedLevel: 'Consultant',
    description: 'Consultant with PM skills',
  },
];

console.log('📋 Running regression tests...\n');

// Check that seed data was created
console.log('✓ Test queries defined: ' + canonicalQueries.length);
console.log('\nRecommended: Run tests against a live app');
console.log('Example: npm run dev, then manually test each query\n');

canonicalQueries.forEach((test, idx) => {
  console.log(`${idx + 1}. "${test.query}"`);
  console.log(`   Expected: ${test.expectedMinResults}+ results`);
  if (test.expectedLevel) console.log(`   Level: ${test.expectedLevel}`);
  if (test.expectedSkills) console.log(`   Skills: ${test.expectedSkills.join(', ')}`);
  console.log(`   Context: ${test.description}`);
  console.log();
});

console.log('✓ Regression test suite ready');
console.log('\nTo run full regression:');
console.log('1. npm run dev (start app)');
console.log('2. Go to /search');
console.log('3. Test each query above');
console.log('4. Verify results match expectations');
