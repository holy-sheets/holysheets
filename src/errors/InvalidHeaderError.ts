import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'

export class InvalidHeaderError extends HolySheetsError {
  constructor(sheetName: string) {
    super(
      `The sheet named "${sheetName}" has invalid headers.`,
      ErrorCodes.INVALID_HEADER
    )
    this.name = 'InvalidHeaderError'
  }
}
