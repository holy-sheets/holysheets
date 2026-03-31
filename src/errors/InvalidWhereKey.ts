import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'

export class InvalidWhereKeyError extends HolySheetsError {
  constructor(whereKey: string) {
    super(
      `The where key "${whereKey}" is invalid.`,
      ErrorCodes.INVALID_WHERE_KEY
    )
    this.name = 'InvalidWhereError'
  }
}
