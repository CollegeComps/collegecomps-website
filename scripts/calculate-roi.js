#!/usr/bin/env node
/**
 * Calculate and Update Implied ROI for All Institutions
 * =====================================================
 * 
 * Calculates implied ROI based on:
 * - 10-year median earnings (from earnings_outcomes)
 * - 4-year total cost (from financial_data)
 * 
 * Formula: ((median_earnings_10yr * 10) - (4_yr_total_cost)) / (4_yr_total_cost) * 100
 * 
 * Usage: node scripts/calculate-roi.js
 */

const { createClient } = require('@libsql/client');
require('dotenv/config');

// National median earnings baseline (used for comparison)
const NATIONAL_MEDIAN_EARNINGS = 40000;

async function calculateROI() {
  console.log('💰 Calculating Implied ROI for All Institutions');
  console.log('================================================\n');

  // Initialize Turso client
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoToken) {
    console.error('❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
    process.exit(1);
  }

  const client = createClient({
    url: tursoUrl,
    authToken: tursoToken
  });

  console.log('✅ Connected to Turso database\n');

  // Step 1: Get all institutions with earnings and cost data
  console.log('📊 Step 1: Fetching institutions with earnings and cost data...');
  
  const query = `
    SELECT 
      i.unitid,
      i.name,
      i.state,
      e.earnings_10_years_after_entry,
      e.completion_rate,
      f.tuition_in_state,
      f.tuition_out_state,
      f.room_board_on_campus,
      f.books_supplies,
      f.net_price
    FROM institutions i
    LEFT JOIN earnings_outcomes e ON i.unitid = e.unitid
    LEFT JOIN financial_data f ON i.unitid = f.unitid
    WHERE e.earnings_10_years_after_entry IS NOT NULL
      AND (f.net_price IS NOT NULL OR f.tuition_in_state IS NOT NULL)
  `;

  const result = await client.execute(query);
  const institutions = result.rows;

  console.log(`   Found ${institutions.length} institutions with complete data\n`);

  if (institutions.length === 0) {
    console.error('❌ No institutions found with required data.');
    console.error('   Make sure to run: npm run populate-scorecard first');
    process.exit(1);
  }

  // Step 2: Calculate ROI for each institution
  console.log('📈 Step 2: Calculating ROI for each institution...\n');

  let updated = 0;
  let skipped = 0;
  const roiDistribution = {
    negative: 0,
    low: 0,      // 0-50%
    medium: 0,   // 50-100%
    high: 0,     // 100-200%
    veryHigh: 0  // 200%+
  };

  for (const inst of institutions) {
    try {
      // Calculate 4-year total cost
      // Prefer net_price if available, otherwise calculate from components
      let fourYearCost;
      
      if (inst.net_price && inst.net_price > 0) {
        fourYearCost = inst.net_price * 4;
      } else {
        // Estimate from tuition + room & board + books
        const tuition = inst.tuition_in_state || inst.tuition_out_state || 0;
        const roomBoard = inst.room_board_on_campus || 0;
        const books = inst.books_supplies || 0;
        fourYearCost = (tuition + roomBoard + books) * 4;
      }

      // Skip if cost is too low (likely data quality issue)
      if (fourYearCost < 5000) {
        skipped++;
        continue;
      }

      const earnings10yr = inst.earnings_10_years_after_entry;
      
      // Calculate total earnings over 10 years
      const totalEarnings10yr = earnings10yr * 10;
      
      // Calculate net gain
      const netGain = totalEarnings10yr - fourYearCost;
      
      // Calculate ROI as percentage
      const impliedROI = (netGain / fourYearCost) * 100;

      // Track distribution
      if (impliedROI < 0) {
        roiDistribution.negative++;
      } else if (impliedROI < 50) {
        roiDistribution.low++;
      } else if (impliedROI < 100) {
        roiDistribution.medium++;
      } else if (impliedROI < 200) {
        roiDistribution.high++;
      } else {
        roiDistribution.veryHigh++;
      }

      // Update institution
      await client.execute({
        sql: `UPDATE institutions 
              SET implied_roi = ?,
                  last_roi_calculation = CURRENT_TIMESTAMP
              WHERE unitid = ?`,
        args: [impliedROI, inst.unitid]
      });

      updated++;

      // Show progress every 100 institutions
      if (updated % 100 === 0) {
        console.log(`   Processed ${updated}/${institutions.length} institutions...`);
      }

      // Show top 10 ROI examples
      if (updated <= 10) {
        console.log(`   ${inst.name} (${inst.state}): ${impliedROI.toFixed(1)}% ROI`);
        console.log(`      Cost: $${fourYearCost.toLocaleString()}, Earnings: $${earnings10yr.toLocaleString()}/yr`);
      }

    } catch (error) {
      console.error(`   Error calculating ROI for ${inst.name}:`, error.message);
      skipped++;
    }
  }

  // Step 3: Update acceptance rates and test scores from admissions_data
  console.log('\n📊 Step 3: Updating acceptance rates and test scores...');
  
  const admissionsQuery = `
    SELECT 
      i.unitid,
      a.applicants_total,
      a.admissions_total,
      a.sat_math_25th,
      a.sat_math_75th,
      a.sat_verbal_25th,
      a.sat_verbal_75th,
      a.act_composite_25th,
      a.act_composite_75th
    FROM institutions i
    JOIN admissions_data a ON i.unitid = a.unitid
    WHERE a.applicants_total IS NOT NULL 
      AND a.admissions_total IS NOT NULL
  `;

  const admissionsResult = await client.execute(admissionsQuery);
  let admissionsUpdated = 0;

  for (const inst of admissionsResult.rows) {
    try {
      // Calculate acceptance rate
      const acceptanceRate = inst.applicants_total > 0 
        ? inst.admissions_total / inst.applicants_total 
        : null;

      // Calculate average SAT (if available)
      let avgSAT = null;
      if (inst.sat_math_25th && inst.sat_verbal_25th) {
        const satMathMid = (inst.sat_math_25th + (inst.sat_math_75th || inst.sat_math_25th)) / 2;
        const satVerbalMid = (inst.sat_verbal_25th + (inst.sat_verbal_75th || inst.sat_verbal_25th)) / 2;
        avgSAT = Math.round(satMathMid + satVerbalMid);
      }

      // Calculate average ACT (if available)
      let avgACT = null;
      if (inst.act_composite_25th) {
        avgACT = Math.round((inst.act_composite_25th + (inst.act_composite_75th || inst.act_composite_25th)) / 2);
      }

      await client.execute({
        sql: `UPDATE institutions 
              SET acceptance_rate = ?,
                  average_sat = ?,
                  average_act = ?
              WHERE unitid = ?`,
        args: [acceptanceRate, avgSAT, avgACT, inst.unitid]
      });

      admissionsUpdated++;
    } catch (error) {
      console.error(`   Error updating admissions for unitid ${inst.unitid}:`, error.message);
    }
  }

  console.log(`   Updated ${admissionsUpdated} institutions with admissions data\n`);

  // Summary
  console.log('\n✅ ROI Calculation Complete!');
  console.log('============================');
  console.log(`📊 Institutions processed: ${updated}`);
  console.log(`⚠️  Skipped (insufficient data): ${skipped}`);
  console.log(`\n📈 ROI Distribution:`);
  console.log(`   Negative ROI: ${roiDistribution.negative}`);
  console.log(`   0-50%: ${roiDistribution.low}`);
  console.log(`   50-100%: ${roiDistribution.medium}`);
  console.log(`   100-200%: ${roiDistribution.high}`);
  console.log(`   200%+: ${roiDistribution.veryHigh}`);

  console.log('\n🎯 Next steps:');
  console.log('1. Verify data: SELECT name, implied_roi, state FROM institutions WHERE implied_roi IS NOT NULL ORDER BY implied_roi DESC LIMIT 10;');
  console.log('2. Test API: /api/institutions?sortBy=implied_roi');
  console.log('3. Proceed with ENG-18 (landing page ROI sorting)');
}

if (require.main === module) {
  calculateROI().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { calculateROI };
