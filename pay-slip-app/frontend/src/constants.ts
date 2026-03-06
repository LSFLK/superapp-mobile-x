/**
 * Application-wide constants for pay-slip app
 */

// API Configuration
export const API_CONFIG = {
  /** Maximum number of retry attempts for failed API requests */
  MAX_RETRY_ATTEMPTS: 3,
  /** Delay between retry attempts in milliseconds */
  RETRY_DELAY_MS: 5000,
  /** Default API base URL for development */
  DEV_API_BASE: "http://localhost:3001/api",
} as const;

// Bridge Configuration
export const BRIDGE_CONFIG = {
  /** Maximum number of retry attempts for token fetching */
  MAX_TOKEN_RETRIES: 3,
  /** Delay between token retry attempts in milliseconds */
  TOKEN_RETRY_DELAY_MS: 500,
  /** Default development token fallback */
  DEFAULT_DEV_TOKEN: "dev-token-123",
} as const;

// Upload Configuration
export const UPLOAD_CONFIG = {
  /** Maximum file size in bytes (10MB) */
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  /** Maximum file size in MB (for display) */
  MAX_FILE_SIZE_MB: 10,
  /** Accepted file type */
  ACCEPTED_FILE_TYPE: "application/pdf",
} as const;

// Date/Time Configuration
export const DATE_CONFIG = {
  /** Number of years to show in year dropdown */
  YEAR_DROPDOWN_RANGE: 5,
  /** Total number of months in a year */
  MONTHS_IN_YEAR: 12,
} as const;

// Month names for display
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

// Month options for filter dropdown
export const MONTH_OPTIONS = [
  { value: "all" as const, label: "All Months" },
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
] as const;

/**
 * Generate an array of years for the year dropdown
 * @param count Number of years to generate (default from DATE_CONFIG)
 * @param fromYear Starting year (defaults to current year)
 * @returns Array of years in descending order
 */
export const generateYearRange = (
  count: number = DATE_CONFIG.YEAR_DROPDOWN_RANGE,
  fromYear: number = new Date().getFullYear(),
): number[] => {
  return Array.from({ length: count }, (_, i) => fromYear - i);
};
