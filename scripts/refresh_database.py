#!/usr/bin/env python3
"""
Database Refresh Script
Rebuilds the SQLite database with the latest comprehensive data from CSV files.
"""

import sqlite3
import pandas as pd
import json
import os
from pathlib import Path
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DatabaseRefresher:
    def __init__(self, db_path="../college-scrapper/data/college_data.db"):
        self.db_path = Path(db_path).resolve()
        self.data_dir = Path("../college-scrapper/data/comprehensive_data").resolve()
        self.conn = None
        
        logger.info(f"Database path: {self.db_path}")
        logger.info(f"Data directory: {self.data_dir}")
        
    def connect(self):
        """Connect to SQLite database"""
        self.conn = sqlite3.connect(self.db_path)
        # Disable foreign keys during import for better performance
        self.conn.execute("PRAGMA foreign_keys = OFF")
        return self.conn
        
    def create_fresh_schema(self):
        """Create fresh database schema, dropping existing tables"""
        
        logger.info("🗃️  Creating fresh database schema...")
        
        # Drop existing tables
        tables_to_drop = [
            'earnings_outcomes', 'financial_data', 'admissions_data', 
            'academic_programs', 'institutions', 'cip_codes_ref'
        ]
        
        for table in tables_to_drop:
            self.conn.execute(f"DROP TABLE IF EXISTS {table}")
            
        # Institutions master table
        self.conn.execute("""
            CREATE TABLE institutions (
                id INTEGER PRIMARY KEY,
                unitid INTEGER UNIQUE,
                opeid TEXT,
                name TEXT NOT NULL,
                city TEXT,
                state TEXT,
                zip_code TEXT,
                region TEXT,
                latitude REAL,
                longitude REAL,
                website TEXT,
                ownership INTEGER,
                control_public_private INTEGER,
                historically_black INTEGER,
                predominately_black INTEGER,
                hispanic_serving INTEGER,
                tribal INTEGER,
                asian_american_native_american_pacific_islander INTEGER,
                women_only INTEGER,
                men_only INTEGER,
                religious_affiliation INTEGER,
                level_undergraduate INTEGER,
                level_graduate INTEGER,
                size_category INTEGER,
                carnegie_basic INTEGER,
                carnegie_undergraduate INTEGER,
                carnegie_size INTEGER,
                locale INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Academic programs table
        self.conn.execute("""
            CREATE TABLE academic_programs (
                id INTEGER PRIMARY KEY,
                unitid INTEGER,
                cipcode TEXT,
                cipcode_int INTEGER,
                cip_title TEXT,
                credential_level INTEGER,
                distance_education INTEGER,
                completions INTEGER,
                completions_men INTEGER, 
                completions_women INTEGER,
                year INTEGER,
                FOREIGN KEY (unitid) REFERENCES institutions (unitid)
            )
        """)
        
        # Financial data table
        self.conn.execute("""
            CREATE TABLE financial_data (
                id INTEGER PRIMARY KEY,
                unitid INTEGER,
                year INTEGER,
                tuition_in_state REAL,
                tuition_out_state REAL,
                tuition_program REAL,
                fees REAL,
                books_supplies REAL,
                room_board_on_campus REAL,
                room_board_off_campus REAL,
                room_board_family REAL,
                other_expenses REAL,
                aid_federal_loan REAL,
                aid_federal_pell REAL,
                aid_institutional REAL,
                aid_state_local REAL,
                net_price REAL,
                FOREIGN KEY (unitid) REFERENCES institutions (unitid)
            )
        """)
        
        # Earnings and outcomes table  
        self.conn.execute("""
            CREATE TABLE earnings_outcomes (
                id INTEGER PRIMARY KEY,
                unitid INTEGER,
                opeid TEXT,
                earnings_6_years_after_entry REAL,
                earnings_10_years_after_entry REAL,
                median_debt REAL,
                repayment_rate REAL,
                completion_rate REAL,
                retention_rate REAL,
                student_count INTEGER,
                pct_white REAL,
                pct_black REAL, 
                pct_hispanic REAL,
                pct_asian REAL,
                pct_american_indian REAL,
                pct_pacific_islander REAL,
                pct_biracial REAL,
                pct_nonresident_alien REAL,
                pct_unknown_race REAL,
                pct_part_time REAL,
                age_entry REAL,
                FOREIGN KEY (unitid) REFERENCES institutions (unitid)
            )
        """)
        
        # Admissions data table
        self.conn.execute("""
            CREATE TABLE admissions_data (
                id INTEGER PRIMARY KEY,
                unitid INTEGER,
                year INTEGER,
                admissions_total INTEGER,
                applicants_total INTEGER,
                applicants_men INTEGER,
                applicants_women INTEGER,
                admissions_men INTEGER,
                admissions_women INTEGER,
                enrolled_total INTEGER,
                enrolled_men INTEGER,
                enrolled_women INTEGER,
                enrolled_full_time INTEGER,
                enrolled_part_time INTEGER,
                sat_math_25th REAL,
                sat_math_75th REAL,
                sat_verbal_25th REAL,
                sat_verbal_75th REAL,
                act_composite_25th REAL,
                act_composite_75th REAL,
                FOREIGN KEY (unitid) REFERENCES institutions (unitid)
            )
        """)
        
        # CIP codes reference table
        self.conn.execute("""
            CREATE TABLE cip_codes_ref (
                cip_code TEXT PRIMARY KEY,
                cip_code_int INTEGER,
                cip_title TEXT,
                cip_definition TEXT,
                cip_family TEXT
            )
        """)
        
        # Create indexes for better performance
        indexes = [
            "CREATE INDEX idx_institutions_unitid ON institutions(unitid)",
            "CREATE INDEX idx_institutions_state ON institutions(state)",
            "CREATE INDEX idx_institutions_control ON institutions(control_public_private)",
            "CREATE INDEX idx_programs_unitid ON academic_programs(unitid)",
            "CREATE INDEX idx_programs_cip ON academic_programs(cipcode)",
            "CREATE INDEX idx_financial_unitid ON financial_data(unitid)",
            "CREATE INDEX idx_earnings_unitid ON earnings_outcomes(unitid)",
            "CREATE INDEX idx_admissions_unitid ON admissions_data(unitid)",
        ]
        
        for index in indexes:
            self.conn.execute(index)
            
        self.conn.commit()
        logger.info("   ✅ Database schema created successfully")
        
    def load_institutions_data(self):
        """Load institutions data from directory CSV files"""
        
        logger.info("🏫 Loading institutions data...")
        
        # Try to load the most recent directory file
        directory_files = [
            self.data_dir / "directory_2023.csv",
            self.data_dir / "directory_2022.csv"
        ]
        
        directory_file = None
        for file in directory_files:
            if file.exists():
                directory_file = file
                break
                
        if not directory_file:
            logger.warning("❌ No directory file found")
            return
            
        logger.info(f"📂 Loading from: {directory_file.name}")
        df = pd.read_csv(directory_file, low_memory=False, encoding='utf-8-sig')
        
        # Map the columns based on IPEDS structure (handle BOM in first column)
        column_mapping = {
            'ï»¿UNITID': 'unitid',  # Handle BOM character
            'UNITID': 'unitid',      # Fallback if BOM is not present
            'OPEID': 'opeid', 
            'INSTNM': 'name',
            'CITY': 'city',
            'STABBR': 'state',
            'ZIP': 'zip_code',
            'OBEREG': 'region',
            'LONGITUD': 'longitude',
            'LATITUDE': 'latitude',
            'WEBADDR': 'website',
            'CONTROL': 'control_public_private',
            'HBCU': 'historically_black',
            'PBI': 'predominately_black',
            'HSI': 'hispanic_serving',
            'TRIBAL': 'tribal',
            'AANAPII': 'asian_american_native_american_pacific_islander',
            'WOMENONLY': 'women_only',
            'MENONLY': 'men_only',
            'RELAFFIL': 'religious_affiliation',
            'ICLEVEL': 'level_undergraduate',
            'LOCALE': 'locale'
        }
        
        # Select and rename columns that exist in the DataFrame
        available_columns = {}
        for ipeds_col, db_col in column_mapping.items():
            if ipeds_col in df.columns:
                available_columns[ipeds_col] = db_col
                
        df_mapped = df[list(available_columns.keys())].rename(columns=available_columns)
        
        # Convert data types and clean data
        numeric_cols = ['unitid', 'region', 'longitude', 'latitude', 'control_public_private',
                       'historically_black', 'predominately_black', 'hispanic_serving', 'tribal',
                       'asian_american_native_american_pacific_islander', 'women_only', 'men_only',
                       'religious_affiliation', 'level_undergraduate', 'locale']
        
        for col in numeric_cols:
            if col in df_mapped.columns:
                df_mapped[col] = pd.to_numeric(df_mapped[col], errors='coerce')
        
        # Insert data
        df_mapped.to_sql('institutions', self.conn, if_exists='append', index=False)
        
        institution_count = len(df_mapped)
        logger.info(f"   ✅ Loaded {institution_count:,} institutions")
        
    def load_financial_data(self):
        """Load tuition and financial data"""
        
        logger.info("💰 Loading financial data...")
        
        # Try to load the most recent tuition file
        tuition_files = [
            self.data_dir / "tuition_fees_2023.csv",
            self.data_dir / "tuition_fees_2022.csv"
        ]
        
        tuition_file = None
        for file in tuition_files:
            if file.exists():
                tuition_file = file
                break
                
        if not tuition_file:
            logger.warning("❌ No tuition file found")
            return
            
        logger.info(f"📂 Loading from: {tuition_file.name}")
        df = pd.read_csv(tuition_file, low_memory=False)
        
        # Extract year from filename
        year = 2023 if "2023" in tuition_file.name else 2022
        
        # Map columns based on IPEDS structure
        column_mapping = {
            'UNITID': 'unitid',
            'TUITION1': 'tuition_in_state',
            'TUITION2': 'tuition_out_state', 
            'TUITION3': 'tuition_program',
            'FEE1': 'fees',
            'CHG1AY0': 'room_board_on_campus',
            'CHG2AY0': 'room_board_off_campus',
            'CHG3AY0': 'room_board_family'
        }
        
        # Select and rename columns that exist
        available_columns = {}
        for ipeds_col, db_col in column_mapping.items():
            if ipeds_col in df.columns:
                available_columns[ipeds_col] = db_col
                
        df_mapped = df[list(available_columns.keys())].rename(columns=available_columns)
        df_mapped['year'] = year
        
        # Convert to numeric
        numeric_cols = [col for col in df_mapped.columns if col not in ['year']]
        for col in numeric_cols:
            df_mapped[col] = pd.to_numeric(df_mapped[col], errors='coerce')
        
        # Only keep records where unitid exists in institutions table
        cursor = self.conn.cursor()
        cursor.execute("SELECT unitid FROM institutions")
        valid_unitids = set(row[0] for row in cursor.fetchall())
        
        df_mapped = df_mapped[df_mapped['unitid'].isin(valid_unitids)]
        df_mapped = df_mapped.dropna(subset=['unitid'])
        
        # Insert data
        df_mapped.to_sql('financial_data', self.conn, if_exists='append', index=False)
        
        financial_count = len(df_mapped)
        logger.info(f"   ✅ Loaded {financial_count:,} financial records")
        
    def load_programs_data(self):
        """Load academic programs and completions data"""
        
        logger.info("📚 Loading programs data...")
        
        # Try to load the standardized completions file first, then regular
        completion_files = [
            self.data_dir / "completions_2022_cip_standardized_20250925_204646.csv",
            self.data_dir / "completions_2022.csv"
        ]
        
        completion_file = None
        for file in completion_files:
            if file.exists():
                completion_file = file
                break
                
        if not completion_file:
            logger.warning("❌ No completions file found")
            return
            
        logger.info(f"📂 Loading from: {completion_file.name}")
        
        # Load in chunks due to large file size
        chunk_size = 10000
        total_records = 0
        
        for chunk in pd.read_csv(completion_file, low_memory=False, chunksize=chunk_size):
            # Map columns
            column_mapping = {
                'UNITID': 'unitid',
                'CIPCODE': 'cipcode',
                'AWLEVEL': 'credential_level',
                'CTOTALT': 'completions',
                'CTOTALM': 'completions_men',
                'CTOTALW': 'completions_women'
            }
            
            # Use available columns
            available_columns = {}
            for ipeds_col, db_col in column_mapping.items():
                if ipeds_col in chunk.columns:
                    available_columns[ipeds_col] = db_col
                    
            if not available_columns:
                logger.warning("❌ No recognizable columns found in completions file")
                continue
                
            chunk_mapped = chunk[list(available_columns.keys())].rename(columns=available_columns)
            chunk_mapped['year'] = 2022
            
            # Convert to numeric where appropriate
            numeric_cols = ['unitid', 'credential_level', 'completions', 'completions_men', 'completions_women', 'year']
            for col in numeric_cols:
                if col in chunk_mapped.columns:
                    chunk_mapped[col] = pd.to_numeric(chunk_mapped[col], errors='coerce')
            
            # Only keep records where unitid exists in institutions table
            cursor = self.conn.cursor()
            cursor.execute("SELECT unitid FROM institutions")
            valid_unitids = set(row[0] for row in cursor.fetchall())
            
            chunk_mapped = chunk_mapped[chunk_mapped['unitid'].isin(valid_unitids)]
            chunk_mapped = chunk_mapped.dropna(subset=['unitid'])
            
            if len(chunk_mapped) == 0:
                continue
            
            # Insert chunk
            chunk_mapped.to_sql('academic_programs', self.conn, if_exists='append', index=False)
            total_records += len(chunk_mapped)
            
            if total_records % 50000 == 0:
                logger.info(f"   📊 Processed {total_records:,} program records...")
        
        logger.info(f"   ✅ Loaded {total_records:,} program completion records")
        
    def load_roi_analysis_data(self):
        """Load ROI analysis dataset if available"""
        
        logger.info("📈 Loading ROI analysis data...")
        
        roi_file = self.data_dir / "roi_analysis_dataset.csv"
        if not roi_file.exists():
            logger.warning("❌ ROI analysis file not found")
            return
            
        df = pd.read_csv(roi_file, low_memory=False)
        
        # Map to earnings_outcomes table
        column_mapping = {
            'unitid': 'unitid',
            'opeid': 'opeid',
            'earnings_6_yrs_after_entry': 'earnings_6_years_after_entry',
            'earnings_10_yrs_after_entry': 'earnings_10_years_after_entry',
            'median_debt': 'median_debt',
            'repayment_rate': 'repayment_rate',
            'completion_rate': 'completion_rate',
            'retention_rate': 'retention_rate',
            'student_count': 'student_count'
        }
        
        # Use available columns
        available_columns = {}
        for roi_col, db_col in column_mapping.items():
            if roi_col in df.columns:
                available_columns[roi_col] = db_col
                
        if available_columns:
            df_mapped = df[list(available_columns.keys())].rename(columns=available_columns)
            
            # Convert to numeric
            numeric_cols = [col for col in df_mapped.columns if col != 'opeid']
            for col in numeric_cols:
                if col in df_mapped.columns:
                    df_mapped[col] = pd.to_numeric(df_mapped[col], errors='coerce')
            
            # Only keep records where unitid exists in institutions table
            cursor = self.conn.cursor()
            cursor.execute("SELECT unitid FROM institutions")
            valid_unitids = set(row[0] for row in cursor.fetchall())
            
            df_mapped = df_mapped[df_mapped['unitid'].isin(valid_unitids)]
            df_mapped = df_mapped.dropna(subset=['unitid'])
            
            # Insert data
            df_mapped.to_sql('earnings_outcomes', self.conn, if_exists='append', index=False)
            
            roi_count = len(df_mapped)
            logger.info(f"   ✅ Loaded {roi_count:,} ROI/earnings records")
        
    def refresh_database(self):
        """Complete database refresh process"""
        
        logger.info("🔄 Starting database refresh...")
        logger.info(f"Database location: {self.db_path}")
        
        # Connect to database
        self.connect()
        
        # Create fresh schema
        self.create_fresh_schema()
        
        # Load all data
        self.load_institutions_data()
        self.load_financial_data() 
        self.load_programs_data()
        self.load_roi_analysis_data()
        
        # Final commit and close
        self.conn.commit()
        
        # Get final counts
        cursor = self.conn.cursor()
        
        tables = ['institutions', 'financial_data', 'academic_programs', 'earnings_outcomes']
        logger.info("\n📊 Final database statistics:")
        
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            logger.info(f"   • {table}: {count:,} records")
        
        self.conn.close()
        
        # Calculate database size
        db_size = self.db_path.stat().st_size / (1024 * 1024)  # MB
        logger.info(f"   • Database size: {db_size:.1f} MB")
        
        logger.info("✅ Database refresh completed successfully!")

if __name__ == "__main__":
    refresher = DatabaseRefresher()
    refresher.refresh_database()