#!/usr/bin/env node
/**
 * College Scorecard Data Population Script
 * ========================================
 * 
 * Populates Turso database with:
 * - Median earnings (10 years after entry)
 * - Acceptance rates
 * - SAT/ACT scores
 * - Other admission statistics
 * 
 * Usage: node scripts/populate-scorecard-data.js
 *        or: npm run populate-scorecard
 */

const { createClient } = require('@libsql/client');
require('dotenv/config');

const SCORECARD_API_KEY = 'qMPhgvbADolJIk2BFZKXW2B1g7gt0MDpah01DeXm';
const SCORECARD_API_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools';
const PAGE_SIZE = 100;
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchScorecardPage(page) {
  const fields = [
    'id',
    'school.name',
    'latest.admissions.admission_rate.overall',
    'latest.admissions.sat_scores.average.overall',
    'latest.admissions.act_scores.midpoint.cumulative',
    'latest.admissions.sat_scores.25th_percentile.math',
    'latest.admissions.sat_scores.75th_percentile.math',
    'latest.admissions.sat_scores.25th_percentile.critical_reading',
    'latest.admissions.sat_scores.75th_percentile.critical_reading',
    'latest.admissions.act_scores.25th_percentile.cumulative',
    'latest.admissions.act_scores.75th_percentile.cumulative',
    'latest.earnings.10_yrs_after_entry.median',
    'latest.student.size',
    'latest.completion.completion_rate_4yr_150nt'
  ].join(',');

  const url = new URL(SCORECARD_API_URL);
  url.searchParams.set('api_key', SCORECARD_API_KEY);
  url.searchParams.set('_page', page.toString());
  url.searchParams.set('_per_page', PAGE_SIZE.toString());
  url.searchParams.set('fields', fields);
  url.searchParams.set('school.operating', '1'); // Only operating schools

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error fetching page ${page}:`, error.message);
    return [];
  }
}

async function getTotalPages() {
  const url = new URL(SCORECARD_API_URL);
  url.searchParams.set('api_key', SCORECARD_API_KEY);
  url.searchParams.set('_page', '0');
  url.searchParams.set('_per_page', '1');
  url.searchParams.set('fields', 'id');
  url.searchParams.set('school.operating', '1');

  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    const total = data.metadata?.total || 0;
    return Math.ceil(total / PAGE_SIZE);
  } catch (error) {
    console.error('Error getting total count:', error.message);
    return 0;
  }
}

async function populateEarningsData(client, institutions) {
  let updated = 0;
  let inserted = 0;

  for (const inst of institutions) {
    const unitid = inst.id;
    const earnings10yr = inst['latest.earnings.10_yrs_after_entry.median'];
    const completionRate = inst['latest.completion.completion_rate_4yr_150nt'];
    const studentCount = inst['latest.student.size'];

    if (!earnings10yr && !completionRate && !studentCount) {
      continue; // Skip if no earnings data
    }

    try {
      // Check if record exists
      const existing = await client.execute({
        sql: 'SELECT id FROM earnings_outcomes WHERE unitid = ?',
        args: [unitid]
      });

      if (existing.rows.length > 0) {
        // Update existing record
        await client.execute({
          sql: `UPDATE earnings_outcomes 
                SET earnings_10_years_after_entry = ?,
                    completion_rate = ?,
                    student_count = ?
                WHERE unitid = ?`,
          args: [earnings10yr || null, completionRate || null, studentCount || null, unitid]
        });
        updated++;
      } else {
        // Insert new record
        await client.execute({
          sql: `INSERT INTO earnings_outcomes 
                (unitid, earnings_10_years_after_entry, completion_rate, student_count)
                VALUES (?, ?, ?, ?)`,
          args: [unitid, earnings10yr || null, completionRate || null, studentCount || null]
        });
        inserted++;
      }
    } catch (error) {
      console.error(`Error updating earnings for unitid ${unitid}:`, error.message);
    }
  }

  return { updated, inserted };
}

async function populateAdmissionsData(client, institutions) {
  let updated = 0;
  let inserted = 0;

  for (const inst of institutions) {
    const unitid = inst.id;
    const admissionRate = inst['latest.admissions.admission_rate.overall'];
    const satMath25 = inst['latest.admissions.sat_scores.25th_percentile.math'];
    const satMath75 = inst['latest.admissions.sat_scores.75th_percentile.math'];
    const satVerbal25 = inst['latest.admissions.sat_scores.25th_percentile.critical_reading'];
    const satVerbal75 = inst['latest.admissions.sat_scores.75th_percentile.critical_reading'];
    const actComp25 = inst['latest.admissions.act_scores.25th_percentile.cumulative'];
    const actComp75 = inst['latest.admissions.act_scores.75th_percentile.cumulative'];

    // Skip if no admissions data at all
    if (!admissionRate && !satMath25 && !actComp25) {
      continue;
    }

    try {
      // Check if record exists for current year
      const currentYear = new Date().getFullYear();
      const existing = await client.execute({
        sql: 'SELECT id FROM admissions_data WHERE unitid = ? AND year = ?',
        args: [unitid, currentYear]
      });

      // Calculate derived values
      // Acceptance rate is decimal (0.0 to 1.0), store as ratio using base of 1000
      const applicantsTotal = admissionRate ? 1000 : null;
      const admissionsTotal = admissionRate ? Math.round(admissionRate * 1000) : null;

      if (existing.rows.length > 0) {
        // Update existing record  
        await client.execute({
          sql: `UPDATE admissions_data 
                SET applicants_total = ?,
                    admissions_total = ?,
                    sat_math_25th = ?,
                    sat_math_75th = ?,
                    sat_verbal_25th = ?,
                    sat_verbal_75th = ?,
                    act_composite_25th = ?,
                    act_composite_75th = ?
                WHERE unitid = ? AND year = ?`,
          args: [
            applicantsTotal,
            admissionsTotal,
            satMath25 || null,
            satMath75 || null,
            satVerbal25 || null,
            satVerbal75 || null,
            actComp25 || null,
            actComp75 || null,
            unitid,
            currentYear
          ]
        });
        updated++;
      } else {
        // Insert new record
        await client.execute({
          sql: `INSERT INTO admissions_data 
                (unitid, year, applicants_total, admissions_total, sat_math_25th, sat_math_75th, sat_verbal_25th, sat_verbal_75th,
                 act_composite_25th, act_composite_75th)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            unitid,
            currentYear,
            applicantsTotal,
            admissionsTotal,
            satMath25 || null,
            satMath75 || null,
            satVerbal25 || null,
            satVerbal75 || null,
            actComp25 || null,
            actComp75 || null
          ]
        });
        inserted++;
      }
    } catch (error) {
      console.error(`Error updating admissions for unitid ${unitid}:`, error.message);
    }
  }

  return { updated, inserted };
}

async function main() {
  console.log('🎓 College Scorecard Data Population Script');
  console.log('==========================================\n');

  // Initialize Turso client
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoToken) {
    console.error('❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
    console.error('   Please set them in your .env.local file');
    process.exit(1);
  }

  const client = createClient({
    url: tursoUrl,
    authToken: tursoToken
  });

  console.log('✅ Connected to Turso database\n');

  // Get total pages
  console.log('📊 Fetching total institution count...');
  const totalPages = await getTotalPages();
  console.log(`   Found approximately ${totalPages * PAGE_SIZE} institutions\n`);

  if (totalPages === 0) {
    console.error('❌ Could not determine total pages. Check API key and connection.');
    process.exit(1);
  }

  let totalEarningsUpdated = 0;
  let totalEarningsInserted = 0;
  let totalAdmissionsUpdated = 0;
  let totalAdmissionsInserted = 0;

  // Fetch and process each page
  for (let page = 0; page < totalPages; page++) {
    const progress = ((page + 1) / totalPages * 100).toFixed(1);
    console.log(`[${progress}%] Processing page ${page + 1}/${totalPages}...`);

    const institutions = await fetchScorecardPage(page);
    
    if (institutions.length === 0) {
      console.log('   No more institutions found, stopping.');
      break;
    }

    console.log(`   Retrieved ${institutions.length} institutions`);

    // Populate earnings data
    const earningsResults = await populateEarningsData(client, institutions);
    totalEarningsUpdated += earningsResults.updated;
    totalEarningsInserted += earningsResults.inserted;

    // Populate admissions data
    const admissionsResults = await populateAdmissionsData(client, institutions);
    totalAdmissionsUpdated += admissionsResults.updated;
    totalAdmissionsInserted += admissionsResults.inserted;

    console.log(`   Earnings: ${earningsResults.updated} updated, ${earningsResults.inserted} inserted`);
    console.log(`   Admissions: ${admissionsResults.updated} updated, ${admissionsResults.inserted} inserted\n`);

    // Save checkpoint every 10 pages
    if ((page + 1) % 10 === 0) {
      console.log(`📝 Checkpoint: Processed ${page + 1} pages`);
      console.log(`   Total Earnings: ${totalEarningsUpdated} updated, ${totalEarningsInserted} inserted`);
      console.log(`   Total Admissions: ${totalAdmissionsUpdated} updated, ${totalAdmissionsInserted} inserted\n`);
    }

    // Rate limiting
    await sleep(DELAY_BETWEEN_REQUESTS);
  }

  console.log('\n✅ Data population complete!');
  console.log('==========================');
  console.log(`📊 Earnings Data:`);
  console.log(`   Updated: ${totalEarningsUpdated}`);
  console.log(`   Inserted: ${totalEarningsInserted}`);
  console.log(`\n📊 Admissions Data:`);
  console.log(`   Updated: ${totalAdmissionsUpdated}`);
  console.log(`   Inserted: ${totalAdmissionsInserted}`);
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main };
