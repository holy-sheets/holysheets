import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'

export class InvalidColumnIndexError extends HolySheetsError {
  constructor() {
    super(
      'Invalid column index error. Column index must be bigger than zero',
      ErrorCodes.INVALID_COLUMN_INDEX
    )
    this.name = 'InvalidColumnIndexError'
  }
}
