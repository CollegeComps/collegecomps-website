#!/usr/bin/env python3
"""
Simple debug script to check data loading
"""

import pandas as pd
import sqlite3
from pathlib import Path

# Paths
db_path = Path("../college-scrapper/data/college_data.db").resolve()
data_dir = Path("../college-scrapper/data/comprehensive_data").resolve()

print("🔍 DEBUGGING DATABASE LOADING")
print("=" * 50)

# Connect to database and get some institution unitids
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT unitid FROM institutions LIMIT 5")
sample_unitids = [row[0] for row in cursor.fetchall()]
print(f"📋 Sample institution UNITIDs from DB: {sample_unitids}")

cursor.execute("SELECT COUNT(*) FROM institutions")
institution_count = cursor.fetchone()[0]
print(f"📊 Total institutions in DB: {institution_count}")

# Check tuition file
tuition_file = data_dir / "tuition_fees_2023.csv"
print(f"\n💰 CHECKING: {tuition_file.name}")
df = pd.read_csv(tuition_file, low_memory=False, nrows=5)
print(f"📂 Columns available: {list(df.columns)}")
print(f"📊 Sample UNITIDs from tuition file: {df['UNITID'].tolist()}")
print(f"📊 Sample TUITION1 values: {df['TUITION1'].tolist()}")

# Map and filter
column_mapping = {
    'UNITID': 'unitid',
    'TUITION1': 'tuition_in_state',
    'TUITION2': 'tuition_out_state', 
    'FEE1': 'fees',
}

available_columns = {}
for ipeds_col, db_col in column_mapping.items():
    if ipeds_col in df.columns:
        available_columns[ipeds_col] = db_col

df_mapped = df[list(available_columns.keys())].rename(columns=available_columns)
print(f"📊 Mapped columns: {list(df_mapped.columns)}")
print(f"📊 Before filtering: {len(df_mapped)} records")

# Get valid unitids from database
cursor.execute("SELECT unitid FROM institutions")
valid_unitids = set(row[0] for row in cursor.fetchall())
print(f"📊 Valid UNITIDs in institutions: {len(valid_unitids)}")

# Check overlap
tuition_unitids = set(df_mapped['unitid'].tolist())
overlap = tuition_unitids.intersection(valid_unitids)
print(f"📊 UNITIDs in both: {len(overlap)}")
print(f"📊 Sample overlap: {list(overlap)[:5]}")

df_filtered = df_mapped[df_mapped['unitid'].isin(valid_unitids)]
df_filtered = df_filtered.dropna(subset=['unitid'])
print(f"📊 After filtering: {len(df_filtered)} records")

conn.close()