import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'

export class RecordNotFoundError extends HolySheetsError {
  constructor() {
    super('Record not found.', ErrorCodes.RECORD_NOT_FOUND)
    this.name = 'RecordNotFoundError'
  }
}
