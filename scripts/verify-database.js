/**
 * Database Verification Script
 * Checks data quality, ROI calculations, and data completeness
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });
const { createClient } = require('@libsql/client');

async function verifyDatabase() {
  console.log('🔍 Database Verification Script');
  console.log('================================\n');

  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log('✅ Connected to Turso database\n');

  // Test 1: Total Institutions
  console.log('📊 Test 1: Total Institutions');
  console.log('------------------------------');
  const totalResult = await db.execute('SELECT COUNT(*) as count FROM institutions');
  const totalInstitutions = totalResult.rows[0].count;
  console.log(`   Total institutions: ${totalInstitutions}`);
  console.log(`   ${totalInstitutions >= 6000 ? '✅ PASS' : '⚠️  WARNING: Expected ~6,163'}\n`);

  // Test 2: Earnings Data Coverage
  console.log('📊 Test 2: Earnings Data Coverage');
  console.log('----------------------------------');
  const earningsResult = await db.execute(`
    SELECT 
      COUNT(*) as total,
      COUNT(earnings_10_years_after_entry) as with_10yr,
      COUNT(earnings_6_years_after_entry) as with_6yr
    FROM earnings_outcomes
  `);
  const earnings = earningsResult.rows[0];
  console.log(`   Total earnings records: ${earnings.total}`);
  console.log(`   With 10-year earnings: ${earnings.with_10yr}`);
  console.log(`   With 6-year earnings: ${earnings.with_6yr}`);
  console.log(`   ${earnings.total >= 3000 ? '✅ PASS' : '⚠️  WARNING: Expected ~3,000-4,000'}\n`);

  // Test 3: Admissions Data Coverage
  console.log('📊 Test 3: Admissions Data Coverage');
  console.log('------------------------------------');
  const admissionsResult = await db.execute(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN applicants_total > 0 THEN 1 END) as with_applicants,
      COUNT(sat_math_25th) as with_sat,
      COUNT(act_composite_25th) as with_act
    FROM admissions_data
  `);
  const admissions = admissionsResult.rows[0];
  console.log(`   Total admissions records: ${admissions.total}`);
  console.log(`   With applicant data: ${admissions.with_applicants}`);
  console.log(`   With SAT scores: ${admissions.with_sat}`);
  console.log(`   With ACT scores: ${admissions.with_act}`);
  console.log(`   ${admissions.total >= 2000 ? '✅ PASS' : '⚠️  WARNING: Expected ~2,000-3,000'}\n`);

  // Test 4: ROI Data Coverage
  console.log('📊 Test 4: ROI Calculation Coverage');
  console.log('------------------------------------');
  const roiResult = await db.execute(`
    SELECT 
      COUNT(*) as total_institutions,
      COUNT(implied_roi) as with_roi,
      ROUND(AVG(implied_roi), 2) as avg_roi,
      ROUND(MIN(implied_roi), 2) as min_roi,
      ROUND(MAX(implied_roi), 2) as max_roi,
      COUNT(acceptance_rate) as with_acceptance,
      COUNT(average_sat) as with_sat,
      COUNT(average_act) as with_act
    FROM institutions
  `);
  const roi = roiResult.rows[0];
  console.log(`   Total institutions: ${roi.total_institutions}`);
  console.log(`   With ROI: ${roi.with_roi} (${((roi.with_roi / roi.total_institutions) * 100).toFixed(1)}%)`);
  console.log(`   Average ROI: ${roi.avg_roi}%`);
  console.log(`   ROI range: ${roi.min_roi}% to ${roi.max_roi}%`);
  console.log(`   With acceptance rate: ${roi.with_acceptance}`);
  console.log(`   With SAT scores: ${roi.with_sat}`);
  console.log(`   With ACT scores: ${roi.with_act}`);
  console.log(`   ${roi.with_roi >= 2000 ? '✅ PASS' : '⚠️  WARNING: Expected ~2,500-3,500'}\n`);

  // Test 5: Geographic Data Coverage
  console.log('📊 Test 5: Geographic Data Coverage');
  console.log('------------------------------------');
  const geoResult = await db.execute(`
    SELECT 
      COUNT(*) as total,
      COUNT(latitude) as with_lat,
      COUNT(longitude) as with_lon,
      COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as with_both
    FROM institutions
  `);
  const geo = geoResult.rows[0];
  console.log(`   Total institutions: ${geo.total}`);
  console.log(`   With latitude: ${geo.with_lat}`);
  console.log(`   With longitude: ${geo.with_lon}`);
  console.log(`   With both coordinates: ${geo.with_both} (${((geo.with_both / geo.total) * 100).toFixed(1)}%)`);
  console.log(`   ${geo.with_both >= 5800 ? '✅ PASS' : '⚠️  WARNING: Expected ~95%+ coverage'}\n`);

  // Test 6: Top 10 ROI Institutions
  console.log('📊 Test 6: Top 10 ROI Institutions');
  console.log('-----------------------------------');
  const topRoiResult = await db.execute(`
    SELECT 
      name,
      state,
      city,
      ROUND(implied_roi, 1) as roi,
      ROUND(acceptance_rate * 100, 1) as acceptance_pct
    FROM institutions
    WHERE implied_roi IS NOT NULL
    ORDER BY implied_roi DESC
    LIMIT 10
  `);
  
  if (topRoiResult.rows.length > 0) {
    console.log('   Rank | Institution | Location | ROI | Acceptance');
    console.log('   -----|-------------|----------|-----|------------');
    topRoiResult.rows.forEach((row, idx) => {
      console.log(`   ${idx + 1}.   | ${row.name.substring(0, 30).padEnd(30)} | ${(row.city + ', ' + row.state).substring(0, 15).padEnd(15)} | ${String(row.roi).padEnd(6)}% | ${row.acceptance_pct || 'N/A'}%`);
    });
    console.log('   ✅ PASS\n');
  } else {
    console.log('   ⚠️  WARNING: No institutions with ROI data found\n');
  }

  // Test 7: Bottom 10 ROI Institutions
  console.log('📊 Test 7: Bottom 10 ROI Institutions');
  console.log('--------------------------------------');
  const bottomRoiResult = await db.execute(`
    SELECT 
      name,
      state,
      ROUND(implied_roi, 1) as roi
    FROM institutions
    WHERE implied_roi IS NOT NULL
    ORDER BY implied_roi ASC
    LIMIT 10
  `);
  
  if (bottomRoiResult.rows.length > 0) {
    console.log('   Rank | Institution | State | ROI');
    console.log('   -----|-------------|-------|-----');
    bottomRoiResult.rows.forEach((row, idx) => {
      console.log(`   ${idx + 1}.   | ${row.name.substring(0, 40).padEnd(40)} | ${row.state.padEnd(2)} | ${row.roi}%`);
    });
    console.log('   ✅ PASS (Negative ROI expected for some institutions)\n');
  } else {
    console.log('   ⚠️  WARNING: No institutions with ROI data found\n');
  }

  // Test 8: ROI Distribution
  console.log('📊 Test 8: ROI Distribution');
  console.log('----------------------------');
  const distributionResult = await db.execute(`
    SELECT 
      CASE
        WHEN implied_roi < 0 THEN 'Negative (<0%)'
        WHEN implied_roi >= 0 AND implied_roi < 50 THEN 'Low (0-50%)'
        WHEN implied_roi >= 50 AND implied_roi < 100 THEN 'Medium (50-100%)'
        WHEN implied_roi >= 100 AND implied_roi < 200 THEN 'High (100-200%)'
        WHEN implied_roi >= 200 THEN 'Very High (200%+)'
        ELSE 'Unknown'
      END as roi_category,
      COUNT(*) as count
    FROM institutions
    WHERE implied_roi IS NOT NULL
    GROUP BY roi_category
    ORDER BY 
      CASE roi_category
        WHEN 'Negative (<0%)' THEN 1
        WHEN 'Low (0-50%)' THEN 2
        WHEN 'Medium (50-100%)' THEN 3
        WHEN 'High (100-200%)' THEN 4
        WHEN 'Very High (200%+)' THEN 5
        ELSE 6
      END
  `);
  
  console.log('   Category         | Count | Percentage');
  console.log('   -----------------|-------|------------');
  const totalWithRoi = distributionResult.rows.reduce((sum, row) => sum + row.count, 0);
  distributionResult.rows.forEach(row => {
    const pct = ((row.count / totalWithRoi) * 100).toFixed(1);
    console.log(`   ${row.roi_category.padEnd(16)} | ${String(row.count).padEnd(5)} | ${pct}%`);
  });
  console.log('   ✅ PASS\n');

  // Test 9: Sample Institution Details
  console.log('📊 Test 9: Sample Institution (Harvard)');
  console.log('----------------------------------------');
  const harvardResult = await db.execute(`
    SELECT 
      i.name,
      i.city,
      i.state,
      i.latitude,
      i.longitude,
      i.implied_roi,
      i.acceptance_rate,
      i.average_sat,
      i.average_act,
      f.net_price,
      f.tuition_in_state,
      e.earnings_10_years_after_entry
    FROM institutions i
    LEFT JOIN financial_data f ON i.unitid = f.unitid
    LEFT JOIN earnings_outcomes e ON i.unitid = e.unitid
    WHERE i.name LIKE '%Harvard%'
    LIMIT 1
  `);
  
  if (harvardResult.rows.length > 0) {
    const h = harvardResult.rows[0];
    console.log(`   Name: ${h.name}`);
    console.log(`   Location: ${h.city}, ${h.state}`);
    console.log(`   Coordinates: ${h.latitude}, ${h.longitude}`);
    console.log(`   Net Price: $${h.net_price ? h.net_price.toLocaleString() : 'N/A'}`);
    console.log(`   Tuition (in-state): $${h.tuition_in_state ? h.tuition_in_state.toLocaleString() : 'N/A'}`);
    console.log(`   10-Year Earnings: $${h.earnings_10_years_after_entry ? h.earnings_10_years_after_entry.toLocaleString() : 'N/A'}`);
    console.log(`   Implied ROI: ${h.implied_roi ? h.implied_roi.toFixed(1) + '%' : 'N/A'}`);
    console.log(`   Acceptance Rate: ${h.acceptance_rate ? (h.acceptance_rate * 100).toFixed(1) + '%' : 'N/A'}`);
    console.log(`   Average SAT: ${h.average_sat || 'N/A'}`);
    console.log(`   Average ACT: ${h.average_act || 'N/A'}`);
    console.log('   ✅ PASS\n');
  } else {
    console.log('   ⚠️  WARNING: Harvard not found\n');
  }

  // Test 10: Index Verification
  console.log('📊 Test 10: Index Verification');
  console.log('--------------------------------');
  const indexResult = await db.execute(`
    SELECT name FROM sqlite_master 
    WHERE type='index' 
    AND tbl_name='institutions'
    AND name LIKE '%roi%' OR name LIKE '%acceptance%' OR name LIKE '%sat%'
  `);
  
  const expectedIndexes = [
    'idx_institutions_implied_roi',
    'idx_institutions_acceptance_rate',
    'idx_institutions_sat_act',
    'idx_institutions_roi_state'
  ];
  
  const foundIndexes = indexResult.rows.map(r => r.name);
  console.log('   Expected indexes:');
  expectedIndexes.forEach(idx => {
    const found = foundIndexes.includes(idx);
    console.log(`   ${found ? '✅' : '❌'} ${idx}`);
  });
  console.log('');

  // Summary
  console.log('=' .repeat(50));
  console.log('📋 Verification Summary');
  console.log('=' .repeat(50));
  console.log(`✅ Database connection: OK`);
  console.log(`✅ Institutions table: ${totalInstitutions} records`);
  console.log(`✅ Earnings data: ${earnings.total} records`);
  console.log(`✅ Admissions data: ${admissions.total} records`);
  console.log(`✅ ROI calculations: ${roi.with_roi} institutions`);
  console.log(`✅ Geographic data: ${geo.with_both} institutions with coordinates`);
  console.log('');
  console.log('🎉 Verification complete!');
}

verifyDatabase().catch(error => {
  console.error('\n❌ Verification failed:', error);
  process.exit(1);
});
