import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'

export class NoHeadersError extends HolySheetsError {
  constructor(sheetName: string) {
    super(
      `The sheet named "${sheetName}" does not have headers.`,
      ErrorCodes.NO_HEADERS_FOUND
    )
    this.name = 'NoHeadersError'
  }
}
