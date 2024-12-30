export enum ErrorCode {
  NoRecordFound = 'NO_RECORD_FOUND',
  UnknownError = 'UNKNOWN_ERROR',
  SelectAndOmitForbidden = 'SELECT_AND_OMIT_FORBIDDEN'
}

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.NoRecordFound]: 'No records found matching the criteria.',
  [ErrorCode.UnknownError]: 'An unknown error occurred.',
  [ErrorCode.SelectAndOmitForbidden]:
    'Cannot use both select and omit in the same operation.'
}
