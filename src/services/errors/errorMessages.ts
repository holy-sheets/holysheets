export enum ErrorCode {
  NoRecordFound = 'NO_RECORD_FOUND',
  UnknownError = 'UNKNOWN_ERROR'
}

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.NoRecordFound]: 'No records found matching the criteria.',
  [ErrorCode.UnknownError]: 'An unknown error occurred.'
}
