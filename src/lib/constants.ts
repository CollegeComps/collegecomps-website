/**
 * Valid US state codes (50 states + DC)
 * Excludes territories like PR, GU, VI, AS, MP, etc.
 */
export const VALID_US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC' // District of Columbia
];

/**
 * Helper to generate SQL IN clause with placeholders
 * @example
 * const { clause, params } = getStatesInClause();
 * // clause: "state IN (?,?,?,...)"
 * // params: ['AL', 'AK', 'AZ', ...]
 */
export function getStatesInClause() {
  return {
    clause: `state IN (${VALID_US_STATES.map(() => '?').join(',')})`,
    params: VALID_US_STATES
  };
}

/**
 * Check if a state code is valid
 */
export function isValidState(stateCode: string | null | undefined): boolean {
  if (!stateCode) return false;
  return VALID_US_STATES.includes(stateCode.toUpperCase());
}
