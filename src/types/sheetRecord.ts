/**
 * Represents a record from a Google Sheets spreadsheet.
 *
 * @typeparam RecordType - The type of the fields in the record.
 */
export interface SheetRecord<RecordType extends Record<string, any>> {
  row: number
  range: string
  fields: Partial<RecordType>
}
