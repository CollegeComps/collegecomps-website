#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const filesToFix = [
  'src/app/api/support/tickets/route.ts',
  'src/app/api/salary-data/route.ts',
  'src/app/api/alerts/preferences/route.ts',
  'src/app/api/exports/share/route.ts',
  'src/app/api/analytics/stats/route.ts',
  'src/app/api/analytics/track/route.ts',
  'src/app/api/user/onboarding/route.ts',
  'src/app/api/exports/comparison/route.ts',
  'src/app/api/user/usage-stats/route.ts',
  'src/app/api/user/salary-submissions/route.ts',
  'src/app/api/comparison-folders/route.ts',
  'src/app/api/saved-comparisons/tags/route.ts',
  'src/app/api/saved-comparisons/move/route.ts',
];

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - not found`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already fixed
  if (content.includes('getUsersDb')) {
    console.log(`Skipping ${file} - already fixed`);
    return;
  }
  
  // Remove Database import if it exists and is only used for users.db
  if (content.match(/import Database from ['"]better-sqlite3['"]/)) {
    content = content.replace(/import Database from ['"]better-sqlite3['"]\s*\n?/, '');
  }
  
  // Add getUsersDb import
  const firstImport = content.indexOf('import');
  if (firstImport !== -1) {
    const endOfImports = content.indexOf('\n\n', firstImport);
    if (endOfImports !== -1 && !content.includes('@/lib/db-helper')) {
      const importLine = "import { getUsersDb } from '@/lib/db-helper'\n";
      content = content.slice(0, endOfImports) + '\n' + importLine + content.slice(endOfImports);
    }
  }
  
  // Replace module-level db initialization with function call
  content = content.replace(
    /^const db = new Database\(['"]data\/users\.db['"]\)[;\s]*$/m,
    ''
  );
  
  // Add db initialization at start of each function
  // Look for GET, POST, PUT, DELETE, PATCH functions
  content = content.replace(
    /export async function (GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*{/g,
    (match, method) => {
      return `${match}\n  const db = getUsersDb();\n  if (!db) {\n    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });\n  }\n`;
    }
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${file}`);
});

console.log('Done!');
