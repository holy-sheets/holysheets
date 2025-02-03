import { RecordAdapter } from '@/services/record-adapter/RecordAdapter'
import type { RecordSchema } from '@/types/RecordSchema.types'
import type { HeaderColumn } from '@/services/header/HeaderService.types'

/**
 * Converts an array of rows (string[][]) into records of type RecordType,
 * using the header information and schema.
 *
 * @param rows - The array of rows returned from the spreadsheet.
 * @param headers - The already processed headers.
 * @param schema - The schema defined for the record (optional).
 * @returns An array of records of type RecordType.
 */
export function parseRecords<RecordType extends object>(
  rows: string[][] = [[]],
  headers: HeaderColumn[],
  schema: RecordSchema<RecordType> = []
): RecordType[] {
  return rows.map(row =>
    RecordAdapter.toRecord<RecordType>(row, {
      headerColumns: headers,
      schema
    })
  )
}
