import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'

export class FetchingColumnsError extends HolySheetsError {
  constructor(sheetName: string) {
    super(
      `An error occurred while fetching columns for the sheet named "${sheetName}".`,
      ErrorCodes.FETCH_COLUMNS_ERROR
    )
    this.name = 'FetchingColumnsError'
  }
}
