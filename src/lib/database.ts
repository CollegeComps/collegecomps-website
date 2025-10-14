import Database from 'better-sqlite3';
import { getCollegeDb } from './db-helper';
import type { TursoAdapter } from './turso-adapter';
import { VALID_US_STATES, getStatesInClause } from './constants';

export function getDatabase() {
  return getCollegeDb();
}

export interface Institution {
  id: number;
  unitid: number;
  opeid?: string;
  name: string;
  institution_name?: string; // For compatibility 
  city?: string;
  state?: string;
  state_postal_code?: string; // For compatibility
  zip_code?: string;
  zipcode?: string; // For compatibility
  region?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  website_url?: string; // For compatibility
  ownership?: number;
  control_public_private?: number;
  control_of_institution?: number; // For compatibility
  level_of_institution?: number;
  highest_level_offering?: number;
  highest_degree_awarded?: number;
  carnegie_basic?: string;
  carnegie_size?: string;
  carnegie_setting?: string;
  locale?: string;
  historically_black?: number;
  predominantly_black?: number;
  tribal_college?: number;
  asian_american_native_american_pacific_islander?: number;
  hispanic_serving?: number;
  open_admission_policy?: number;
  // Financial data (joined)
  tuition_in_state?: number;
  tuition_out_state?: number;
  fees?: number;
  room_board_on_campus?: number;
  net_price?: number;
  earnings_6_years_after_entry?: number;
  mean_earnings_6_years?: number; // For compatibility
  mean_earnings_10_years?: number; // For compatibility
}

export interface FinancialData {
  id: number;
  unitid: number;
  year: number;
  tuition_in_state?: number;
  tuition_out_state?: number;
  tuition_program?: number;
  fees?: number;
  books_supplies?: number;
  room_board_on_campus?: number;
  room_board_off_campus?: number;
  room_board_family?: number;
  other_expenses?: number;
  aid_federal_loan?: number;
  aid_federal_pell?: number;
  aid_institutional?: number;
  aid_state_local?: number;
  net_price?: number;
}

export interface EarningsOutcome {
  id: number;
  unitid: number;
  opeid?: string;
  earnings_6_years_after_entry?: number;
  earnings_10_years_after_entry?: number;
  median_debt?: number;
  repayment_rate?: number;
  completion_rate?: number;
  retention_rate?: number;
  student_count?: number;
}

export interface AcademicProgram {
  id?: number;
  unitid: number;
  cipcode?: string;
  cip_title?: string;
  degree_level?: number;
  credential_level?: number;
  credential_name?: string;
  completions?: number;
  total_completions?: number;
  source_records?: number;
  data_pattern?: string;
  duplication_factor?: number;
  year?: number;
}

export class CollegeDataService {
  private db: Database.Database | TursoAdapter | null;

  constructor() {
    this.db = getDatabase();
  }
  
  private ensureDb(): Database.Database | TursoAdapter {
    if (!this.db) {
      throw new Error('Database not available');
    }
    return this.db;
  }

  // Get all institutions with basic info and financial data (optimized)
  async getInstitutions(limit: number = 100, offset: number = 0, search?: string, sortBy: string = 'name'): Promise<Institution[]> {
    const { clause: statesClause, params: stateParams } = getStatesInClause();
    
    let query = `
      SELECT 
        i.id, i.unitid, i.opeid, i.name, i.city, i.state, i.zip_code, i.region, 
        i.latitude, i.longitude, i.website, i.ownership, i.control_public_private,
        f.tuition_in_state, f.tuition_out_state, f.fees, f.room_board_on_campus,
        f.net_price, e.earnings_6_years_after_entry
      FROM institutions i
      LEFT JOIN financial_data f ON i.unitid = f.unitid 
        AND f.year = (SELECT MAX(year) FROM financial_data WHERE unitid = i.unitid)
      LEFT JOIN earnings_outcomes e ON i.unitid = e.unitid
      WHERE ${statesClause}
    `;
    
    const params: any[] = [...stateParams];
    
    if (search) {
      query += ` AND (i.name LIKE ? OR i.city LIKE ? OR i.state LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    // Add sorting (simplified without GROUP BY for performance)
    switch (sortBy) {
      case 'tuition_low':
        query += ` ORDER BY COALESCE(f.tuition_in_state, f.tuition_out_state, 999999) ASC`;
        break;
      case 'tuition_high':
        query += ` ORDER BY COALESCE(f.tuition_in_state, f.tuition_out_state, 0) DESC`;
        break;
      case 'earnings_high':
        query += ` ORDER BY COALESCE(e.earnings_6_years_after_entry, 0) DESC`;
        break;
      case 'earnings_low':
        query += ` ORDER BY COALESCE(e.earnings_6_years_after_entry, 999999) ASC`;
        break;
      default:
        query += ` ORDER BY i.name ASC`;
    }
    
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const results = await this.ensureDb().prepare(query).all(...params) as any[];
    
    // Map the results to ensure all required fields are present
    return results.map(row => ({
      id: row.id || row.unitid,
      unitid: row.unitid,
      name: row.name,
      institution_name: row.name, // For compatibility
      city: row.city,
      state: row.state,
      state_postal_code: row.state, // Map to postal code field
      zipcode: row.zip_code,
      website_url: row.website_url,
      control_of_institution: row.control_public_private,
      control_public_private: row.control_public_private,
      level_of_institution: undefined, // Will be filled from detailed queries if needed
      highest_level_offering: undefined,
      highest_degree_awarded: undefined,
      carnegie_basic: undefined,
      carnegie_size: undefined,
      carnegie_setting: undefined,
      locale: undefined,
      historically_black: undefined,
      predominantly_black: undefined,
      tribal_college: undefined,
      asian_american_native_american_pacific_islander: undefined,
      hispanic_serving: undefined,
      open_admission_policy: undefined,
      tuition_in_state: row.tuition_in_state,
      tuition_out_state: row.tuition_out_state,
      room_board_on_campus: row.room_board_on_campus,
      mean_earnings_6_years: row.earnings_6_years_after_entry,
      mean_earnings_10_years: undefined, // Not available in this query
      earnings_6_years_after_entry: row.earnings_6_years_after_entry
    }));
  }

  // Get a specific institution by unitid (optimized for detail page)
  async getInstitutionByUnitid(unitid: number): Promise<Institution | null> {
    const { clause: statesClause, params: stateParams } = getStatesInClause();
    
    const query = `
      SELECT 
        i.id, i.unitid, i.opeid, i.name, i.city, i.state, i.zip_code, i.region, 
        i.latitude, i.longitude, i.website, i.ownership, i.control_public_private,
        f.tuition_in_state, f.tuition_out_state, f.fees, f.room_board_on_campus,
        f.net_price, e.earnings_6_years_after_entry
      FROM institutions i
      LEFT JOIN financial_data f ON i.unitid = f.unitid 
        AND f.year = (SELECT MAX(year) FROM financial_data WHERE unitid = i.unitid)
      LEFT JOIN earnings_outcomes e ON i.unitid = e.unitid
      WHERE i.unitid = ? AND ${statesClause}
      LIMIT 1
    `;
    
    const result = await this.ensureDb().prepare(query).get(unitid, ...stateParams) as any;
    
    if (!result) return null;
    
    return {
      id: result.id || result.unitid,
      unitid: result.unitid,
      name: result.name,
      institution_name: result.name,
      city: result.city,
      state: result.state,
      state_postal_code: result.state,
      zipcode: result.zip_code,
      website_url: result.website,
      control_of_institution: result.control_public_private,
      control_public_private: result.control_public_private,
      level_of_institution: undefined,
      highest_level_offering: undefined,
      highest_degree_awarded: undefined,
      carnegie_basic: undefined,
      carnegie_size: undefined,
      carnegie_setting: undefined,
      locale: undefined,
      historically_black: undefined,
      predominantly_black: undefined,
      tribal_college: undefined,
      asian_american_native_american_pacific_islander: undefined,
      hispanic_serving: undefined,
      open_admission_policy: undefined,
      tuition_in_state: result.tuition_in_state,
      tuition_out_state: result.tuition_out_state,
      room_board_on_campus: result.room_board_on_campus,
      mean_earnings_6_years: result.earnings_6_years_after_entry,
      mean_earnings_10_years: undefined,
      earnings_6_years_after_entry: result.earnings_6_years_after_entry
    };
  }

  // Get institution by ID with financial and earnings data
  async getInstitutionDetails(unitid: number): Promise<{
    institution: Institution;
    financialData: FinancialData[];
    earningsData: EarningsOutcome | null;
  } | null> {
    const { clause: statesClause, params: stateParams } = getStatesInClause();
    
    const institutionStmt = this.ensureDb().prepare(`
      SELECT * FROM institutions WHERE unitid = ? AND ${statesClause}
    `);
    const institution = await institutionStmt.get(unitid, ...stateParams) as Institution;
    
    if (!institution) return null;

    const financialStmt = this.ensureDb().prepare(`
      SELECT * FROM financial_data WHERE unitid = ? ORDER BY year DESC
    `);
    const financialData = await financialStmt.all(unitid) as FinancialData[];

    const earningsStmt = this.ensureDb().prepare(`
      SELECT * FROM earnings_outcomes WHERE unitid = ?
    `);
    const earningsData = await earningsStmt.get(unitid) as EarningsOutcome | null;

    return {
      institution,
      financialData,
      earningsData
    };
  }

  // Get programs for an institution (deduplicated and safe)
  async getInstitutionPrograms(unitid: number): Promise<AcademicProgram[]> {
    const stmt = this.ensureDb().prepare(`
      SELECT 
        unitid,
        cipcode,
        cip_title,
        credential_level,
        credential_name,
        total_completions,
        source_records,
        data_pattern,
        duplication_factor,
        year
      FROM programs_safe_view 
      WHERE unitid = ? AND cip_title IS NOT NULL
      ORDER BY total_completions DESC, cip_title ASC
    `);
    return await stmt.all(unitid) as AcademicProgram[];
  }

  // Get financial data for an institution
  async getInstitutionFinancialData(unitid: number): Promise<FinancialData | null> {
    const stmt = this.ensureDb().prepare(`
      SELECT * FROM financial_data WHERE unitid = ? ORDER BY year DESC LIMIT 1
    `);
    const result = await stmt.get(unitid) as FinancialData | undefined;
    return result || null;
  }

  // Get earnings data for an institution  
  async getInstitutionEarningsData(unitid: number): Promise<EarningsOutcome | null> {
    const stmt = this.ensureDb().prepare(`
      SELECT * FROM earnings_outcomes WHERE unitid = ? LIMIT 1
    `);
    const result = await stmt.get(unitid) as EarningsOutcome | undefined;
    return result || null;
  }

  // Get program count for a specific institution (separate query for performance)
  async getInstitutionProgramCount(unitid: number): Promise<number> {
    const stmt = this.ensureDb().prepare('SELECT COUNT(DISTINCT cipcode) as count FROM programs_safe_view WHERE unitid = ?');
    const result = await stmt.get(unitid) as { count: number } | undefined;
    return result?.count || 0;
  }

  // Search institutions by various criteria (optimized)
  async searchInstitutions(filters: {
    name?: string;
    state?: string;
    city?: string;
    zipCode?: string;
    control?: number;
    maxTuition?: number;
    minEarnings?: number;
    sortBy?: string;
  }): Promise<Institution[]> {
    const { clause: statesClause, params: stateParams } = getStatesInClause();
    
    let query = `
      SELECT i.*, f.tuition_in_state, f.tuition_out_state, f.room_board_on_campus,
             e.earnings_6_years_after_entry, e.earnings_10_years_after_entry
      FROM institutions i
      LEFT JOIN financial_data f ON i.unitid = f.unitid 
        AND f.year = (SELECT MAX(year) FROM financial_data WHERE unitid = i.unitid)
      LEFT JOIN earnings_outcomes e ON i.unitid = e.unitid
      WHERE ${statesClause}
    `;
    
    const params: any[] = [...stateParams];
    
    if (filters.name) {
      query += ` AND i.name LIKE ?`;
      params.push(`%${filters.name}%`);
    }
    
    if (filters.state) {
      query += ` AND i.state = ?`;
      params.push(filters.state);
    }
    
    if (filters.city) {
      query += ` AND i.city LIKE ?`;
      params.push(`%${filters.city}%`);
    }
    
    if (filters.zipCode) {
      query += ` AND i.zip_code LIKE ?`;
      params.push(`${filters.zipCode}%`);
    }
    
    if (filters.control !== undefined) {
      query += ` AND i.control_public_private = ?`;
      params.push(filters.control);
    }
    
    if (filters.maxTuition) {
      query += ` AND (f.tuition_in_state <= ? OR f.tuition_out_state <= ?)`;
      params.push(filters.maxTuition, filters.maxTuition);
    }
    
    if (filters.minEarnings) {
      query += ` AND e.earnings_6_years_after_entry >= ?`;
      params.push(filters.minEarnings);
    }
    
    // Add sorting
    switch (filters.sortBy) {
      case 'tuition_asc':
        query += ` ORDER BY COALESCE(f.tuition_in_state, f.tuition_out_state) ASC NULLS LAST`;
        break;
      case 'tuition_desc':
        query += ` ORDER BY COALESCE(f.tuition_in_state, f.tuition_out_state) DESC NULLS LAST`;
        break;
      case 'earnings_asc':
        query += ` ORDER BY e.earnings_6_years_after_entry ASC NULLS LAST`;
        break;
      case 'earnings_desc':
        query += ` ORDER BY e.earnings_6_years_after_entry DESC NULLS LAST`;
        break;
      case 'name':
      default:
        query += ` ORDER BY i.name ASC`;
    }
    
    query += ` LIMIT 1000`; // Add reasonable limit for search results
    
    const results = await this.ensureDb().prepare(query).all(...params) as any[];
    
    return results.map(row => ({
      id: row.unitid,
      unitid: row.unitid,
      name: row.name,
      institution_name: row.name,
      city: row.city,
      state: row.state,
      state_postal_code: row.state,
      zipcode: row.zip_code,
      website_url: row.website_url,
      control_of_institution: row.control_public_private,
      level_of_institution: row.level_of_institution,
      highest_level_offering: row.highest_level_offering,
      highest_degree_awarded: row.highest_degree_awarded,
      carnegie_basic: row.carnegie_basic,
      carnegie_size: row.carnegie_size,
      carnegie_setting: row.carnegie_setting,
      locale: row.locale,
      historically_black: row.historically_black,
      predominantly_black: row.predominantly_black,
      tribal_college: row.tribal_college,
      asian_american_native_american_pacific_islander: row.asian_american_native_american_pacific_islander,
      hispanic_serving: row.hispanic_serving,
      open_admission_policy: row.open_admission_policy,
      tuition_in_state: row.tuition_in_state,
      tuition_out_state: row.tuition_out_state,
      room_board_on_campus: row.room_board_on_campus,
      mean_earnings_6_years: row.earnings_6_years_after_entry,
      mean_earnings_10_years: row.earnings_10_years_after_entry
    }));
  }

  // Get summary statistics
  async getDatabaseStats() {
    // Import at top of file: import { VALID_US_STATES, getStatesInClause } from './constants';
    const { clause: statesClause, params: stateParams } = getStatesInClause();
    
    // Only count institutions in the 50 US states + DC, excluding territories
    const institutionsCount = await this.ensureDb().prepare(
      `SELECT COUNT(*) as count FROM institutions WHERE ${statesClause}`
    ).all(...stateParams) as any;
    
    // Only count programs from institutions in the 50 US states + DC
    const programsCount = await this.ensureDb().prepare(
      `SELECT COUNT(*) as count FROM academic_programs ap 
       WHERE ap.unitid IN (SELECT unitid FROM institutions WHERE ${statesClause})`
    ).all(...stateParams) as any;
    
    // Count distinct states (excluding DC from count since it's a district, not a state)
    // But we still include DC institutions in the other counts above
    const statesCount = await this.ensureDb().prepare(
      `SELECT COUNT(DISTINCT state) as count FROM institutions WHERE ${statesClause} AND state != 'DC'`
    ).all(...stateParams) as any;
    
    return {
      totalInstitutions: (institutionsCount as any)[0]?.count || 0,
      totalPrograms: (programsCount as any)[0]?.count || 0,
      statesCovered: (statesCount as any)[0]?.count || 0
    };
  }

  // Close database connection
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export default CollegeDataService;