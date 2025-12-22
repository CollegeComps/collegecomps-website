#!/usr/bin/env node
import 'dotenv/config';
import { createClient } from '@libsql/client';
import fs from 'fs';

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return v;
}

const url = process.env.TURSO_DATABASE_URL || process.env.TURSO_DEV_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.TURSO_DEV_AUTH_TOKEN;

if (!url) {
  console.error('Missing TURSO_DATABASE_URL (or TURSO_DEV_DATABASE_URL)');
  process.exit(1);
}
if (!authToken) {
  console.error('Missing TURSO_AUTH_TOKEN (or TURSO_DEV_AUTH_TOKEN)');
  process.exit(1);
}

const client = createClient({ url, authToken });

const query = `
SELECT 
  p.unitid,
  i.name AS institution_name,
  p.cipcode,
  p.cip_title,
  SUM(CASE WHEN p.credential_level IN (7,23) THEN p.completions ELSE 0 END) AS masters_completions,
  SUM(CASE WHEN p.credential_level IN (5,22,31) THEN p.completions ELSE 0 END) AS bachelors_completions
FROM academic_programs p
JOIN institutions i ON i.unitid = p.unitid
WHERE p.credential_level IN (7,23)
  AND NOT EXISTS (
    SELECT 1 FROM academic_programs pb
    WHERE pb.unitid = p.unitid
      AND pb.cipcode = p.cipcode
      AND pb.credential_level IN (5,22,31)
  )
GROUP BY p.unitid, i.name, p.cipcode, p.cip_title
ORDER BY i.name, p.cipcode;
`;

async function main() {
  try {
    const outPath = process.argv[2] || 'masters_without_bachelors.csv';
    const res = await client.execute(query);
    const rows = res.rows || [];

    const header = [
      'unitid',
      'institution_name',
      'cipcode',
      'cip_title',
      'masters_completions',
      'bachelors_completions'
    ];

    const csvLines = [header.join(',')];
    for (const r of rows) {
      const values = header.map((h) => {
        const v = r[h];
        if (v === null || v === undefined) return '';
        const s = String(v);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      });
      csvLines.push(values.join(','));
    }

    fs.writeFileSync(outPath, csvLines.join('\n'));
    console.log(`Wrote ${rows.length} rows to ${outPath}`);
  } catch (err) {
    console.error('Export failed:', err);
    process.exit(1);
  }
}

main();
