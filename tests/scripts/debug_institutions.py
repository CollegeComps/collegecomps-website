#!/usr/bin/env python3
"""
Debug institutions data loading more deeply
"""

import pandas as pd
from pathlib import Path

data_dir = Path("../college-scrapper/data/comprehensive_data").resolve()
directory_file = data_dir / "directory_2023.csv"

print("🔍 DEBUGGING INSTITUTIONS LOADING")
print("=" * 50)

# Load the raw file
print(f"📂 Loading: {directory_file.name}")
df = pd.read_csv(directory_file, low_memory=False, encoding='utf-8-sig', nrows=5)

print(f"📊 Raw columns: {list(df.columns)}")
print(f"📊 Raw UNITID values: {df.get('UNITID', 'NOT FOUND')}")

# Check if UNITID exists as-is
if 'UNITID' in df.columns:
    print("✅ UNITID column found!")
    print(f"📊 UNITID sample values: {df['UNITID'].tolist()}")
    print(f"📊 UNITID data type: {df['UNITID'].dtype}")
else:
    print("❌ UNITID column not found")
    print("Available columns:")
    for col in df.columns:
        print(f"  - '{col}'")

# Try the mapping we're using
column_mapping = {
    'UNITID': 'unitid',
    'INSTNM': 'name',
    'CITY': 'city',
    'STABBR': 'state',
}

available_columns = {}
for ipeds_col, db_col in column_mapping.items():
    if ipeds_col in df.columns:
        available_columns[ipeds_col] = db_col
        print(f"✅ Found: {ipeds_col} -> {db_col}")
    else:
        print(f"❌ Missing: {ipeds_col}")

if available_columns:
    df_mapped = df[list(available_columns.keys())].rename(columns=available_columns)
    print(f"📊 Mapped data sample:")
    print(df_mapped.head().to_string())
    
    # Check numeric conversion
    if 'unitid' in df_mapped.columns:
        print(f"📊 Before numeric conversion: {df_mapped['unitid'].tolist()}")
        df_mapped['unitid'] = pd.to_numeric(df_mapped['unitid'], errors='coerce')
        print(f"📊 After numeric conversion: {df_mapped['unitid'].tolist()}")
        print(f"📊 Any NaN values? {df_mapped['unitid'].isna().sum()}")
else:
    print("❌ No columns could be mapped!")