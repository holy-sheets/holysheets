import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'

export class SelectOmitConflictError extends HolySheetsError {
  constructor() {
    super(
      'Cannot use both select and omit options',
      ErrorCodes.SELECT_OMIT_CONFLICT
    )
    this.name = 'SelectOmitConflictError'
  }
}
