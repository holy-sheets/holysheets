import { RecordSchema } from '@/services/base-schema/BaseSchema.types'
import { HolySheetsCredentials } from '@/services/google-sheets/types/credentials.type'
import { HeaderColumn } from '@/services/header/HeaderService.types'
import { WhereClause } from '@/services/where/types/where'
import { SheetsAdapterService } from '@/types/SheetsAdapterService'

export type OperationConfigs = {
  includeMetadata: boolean
}

/**
 * Interface representing the parameters required for an operation.
 *
 * @template RecordType - The type of the records being processed.
 *
 * @property {SheetsAdapterService} sheets - The service used to interact with Google Sheets.
 * @property {string} sheet - The name of the sheet to operate on.
 * @property {number} [headerRow] - The row number of the header in the sheet. Optional.
 * @property {HolySheetsCredentials} credentials - The credentials used for authentication.
 * @property {HeaderColumn[]} headers - The headers of the columns in the sheet.
 * @property {RecordSchema<RecordType>} [schema] - The schema defining the structure of the records. Optional.
 */
export interface OperationParams<RecordType> {
  sheets: SheetsAdapterService
  sheet: string
  headerRow?: number
  credentials: HolySheetsCredentials
  headers: HeaderColumn[]
  schema?: RecordSchema<RecordType>
}

/**
 * Options for configuring an operation.
 *
 * @property {WhereClause<RecordType>} [where] - A filter object to specify conditions for the operation.
 * @property {string[]} [select] - An array of strings specifying which fields to include in the operation.
 * @property {string[]} [omit] - An array of strings specifying which fields to exclude from the operation.
 */
export interface OperationOptions<RecordType> {
  where?: WhereClause<RecordType>
  select?: (keyof RecordType)[]
  omit?: (keyof RecordType)[]
}
