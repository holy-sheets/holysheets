import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'

export class SheetNotFoundError extends HolySheetsError {
  constructor(sheetName: string) {
    super(
      `The sheet named "${sheetName}" was not found.`,
      ErrorCodes.SHEET_NOT_FOUND
    )
    this.name = 'SheetNotFoundError'
  }
}
