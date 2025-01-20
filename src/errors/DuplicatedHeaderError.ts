import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'

export class DuplicatedHeaderError extends HolySheetsError {
  constructor(sheetName: string, header: string) {
    super(
      `The header "${header}" is duplicated in the sheet named "${sheetName}".`,
      ErrorCodes.DUPLICATE_HEADER
    )
    this.name = 'DuplicatedHeaderError'
  }
}
