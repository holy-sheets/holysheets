export enum ErrorCodes {
  // 01XX - Integration Errors
  SHEET_NOT_FOUND = '01SHEET_NOT_FOUND',
  AUTHENTICATION_ERROR = '01AUTHENTICATION_ERROR',
  FETCH_COLUMNS_ERROR = '01FETCH_COLUMNS_ERROR',

  // 02XX - Validation Errors
  DUPLICATE_HEADER = '02DUPLICATE_HEADER',
  INVALID_HEADER = '02INVALID_HEADER',
  INVALID_WHERE_KEY = '02INVALID_WHERE_KEY',
  INVALID_WHERE_FILTER = '02INVALID_WHERE_FILTER',
  INVALID_WHERE = '02INVALID_WHERE',
  SELECT_OMIT_CONFLICT = '02SELECT_OMIT_CONFLICT',
  ALL_COLUMNS_OMITTED = '02ALL_COLUMNS_OMITTED',
  NO_HEADERS_FOUND = '02NO_HEADERS_FOUND',

  // 02XX - Schema Errors
  SCHEMA_TYPE_MISMATCH = '02SCHEMA_TYPE_MISMATCH',
  SCHEMA_REQUIRED_FIELD_MISSING = '02SCHEMA_REQUIRED_FIELD_MISSING',
  SCHEMA_NULLABILITY_ERROR = '02SCHEMA_NULLABILITY_ERROR',

  // 03XX - Processing Errors
  PROCESSING_ERROR = '03PROCESSING_ERROR',
  NO_RECORD_FOUND_FOR_UNIQUE = '03NO_RECORD_FOUND_FOR_UNIQUE',
  MULTIPLE_RECORDS_FOUND_FOR_UNIQUE = '03MULTIPLE_RECORDS_FOUND_FOR_UNIQUE',

  // 99XX - General Errors
  UNKNOWN_ERROR = '99UNKNOWN_ERROR'
}
