/**
 * Representa um registro de uma planilha do Google Sheets.
 *
 * @typeparam RecordType - O tipo dos campos no registro.
 */
export interface SheetRecord<RecordType extends Record<string, any>> {
  range: string
  row: number
  fields: Partial<RecordType>
}
