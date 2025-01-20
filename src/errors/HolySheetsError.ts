import { ErrorCodes } from '@/errors/ErrorCodes'

export class HolySheetsError extends Error {
  public name: string
  public readonly code: ErrorCodes

  constructor(message: string, code: ErrorCodes) {
    super(message)
    this.name = 'HolySheetsError'
    this.code = code

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
