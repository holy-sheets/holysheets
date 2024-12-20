import { indexToColumn } from '@/utils/columnUtils/columnUtils'

interface A1Notation {
  sheet: string
  startColumn?: string
  endColumn?: string
  startRow: number
  endRow?: number
}

function createA1Notation(params: A1Notation): string {
  const {
    sheet,
    startColumn = '',
    endColumn = '',
    startRow,
    endRow = ''
  } = params
  return `${sheet}!${startColumn}${startRow}:${endColumn}${endRow}`
}

/**
 * Parameters for creating a single column range.
 */
interface SingleColumnRangeParams {
  sheet: string
  column: string
}

/**
 * Creates a range for a single column in the specified sheet.
 *
 * @param params - The parameters for creating the range.
 * @returns The range in the format "Sheet!Column:Column".
 *
 * @example
 * ```typescript
 * const range = createSingleColumnRange({ sheet: 'Sheet1', column: 'A' });
 * // "Sheet1!A:A"
 * ```
 */
export function createSingleColumnRange(
  params: SingleColumnRangeParams
): string {
  const { sheet, column } = params

  if (!sheet) {
    throw new Error('Sheet name is required.')
  }

  if (!column) {
    throw new Error('Column name is required.')
  }

  return `${sheet}!${column}:${column}`
}

/**
 * Parameters for creating a single row range.
 */
interface SingleRowRangeParams {
  sheet: string
  row: number
  lastColumnIndex: number
}

/**
 * Creates a range for a single row in the specified sheet.
 *
 * @param params - The parameters for creating the range.
 * @returns The range in the format "Sheet!A{row}:Z{row}".
 *
 * @example
 * ```typescript
 * const range = createSingleRowRange({ sheet: 'Sheet1', row: 5, lastColumnIndex: 25 });
 * // "Sheet1!A5:Z5" (Assuming the last column is Z)
 * ```
 */
export function createSingleRowRange(params: SingleRowRangeParams): string {
  const { sheet, row, lastColumnIndex } = params

  if (!sheet) {
    throw new Error('Sheet name is required.')
  }

  if (row <= 0) {
    throw new Error('Row number must be positive.')
  }

  if (lastColumnIndex < 0) {
    throw new Error('Last column index must be non-negative.')
  }

  const lastColumn = indexToColumn(lastColumnIndex)
  return createA1Notation({
    sheet,
    startColumn: indexToColumn(0),
    endColumn: lastColumn,
    startRow: row,
    endRow: row
  })
}

/**
 * Parameters for creating a multiple rows range.
 */
interface MultipleRowsRangeParams {
  sheet: string
  startRow: number
  endRow: number
  lastColumnIndex: number
}

/**
 * Creates a range for multiple rows in the specified sheet.
 *
 * @param params - The parameters for creating the range.
 * @returns The range in the format "Sheet!A{startRow}:Z{endRow}".
 *
 * @example
 * ```typescript
 * const range = createMultipleRowsRange({ sheet: 'Sheet1', startRow: 2, endRow: 5, lastColumnIndex: 25 });
 * // "Sheet1!A2:Z5" (Assuming the last column is Z, which is index 25)
 * ```
 */
export function createMultipleRowsRange(
  params: MultipleRowsRangeParams
): string {
  const { sheet, startRow, endRow, lastColumnIndex } = params

  if (!sheet) {
    throw new Error('Sheet name is required.')
  }

  if (startRow <= 0 || endRow < startRow) {
    throw new Error('Invalid row range.')
  }

  if (lastColumnIndex < 0) {
    throw new Error('Last column index must be non-negative.')
  }

  const lastColumn = indexToColumn(lastColumnIndex)
  return createA1Notation({
    sheet,
    startColumn: indexToColumn(0),
    endColumn: lastColumn,
    startRow,
    endRow
  })
}

/**
 * Parameters for creating a full range with specified columns and rows.
 */
interface FullRangeParams {
  sheet: string
  startColumn: string
  endColumn: string
  startRow: number
  endRow: number
}

/**
 * Creates a complete range with specified columns and rows.
 *
 * @param params - The parameters for creating the range.
 * @returns The range in the format "Sheet!A1:Z10".
 *
 * @example
 * ```typescript
 * const range = createFullRange({ sheet: 'Sheet1', startColumn: 'A', endColumn: 'Z', startRow: 1, endRow: 10 });
 * // "Sheet1!A1:Z10"
 * ```
 */
export function createFullRange(params: FullRangeParams): string {
  const { sheet, startColumn, endColumn, startRow, endRow } = params

  if (!sheet) {
    throw new Error('Sheet name is required.')
  }

  if (!startColumn || !endColumn) {
    throw new Error('Start and end columns are required.')
  }

  if (startRow <= 0 || endRow < startRow) {
    throw new Error('Invalid row range.')
  }

  return createA1Notation({
    sheet,
    startColumn,
    endColumn,
    startRow,
    endRow
  })
}

/**
 * Parameters for adding a sheet name to an existing range.
 */
interface AddSheetToRangeParams {
  sheet: string
  range: string
}

/**
 * Adds the sheet name to an existing range.
 *
 * @param params - The parameters for adding the sheet to the range.
 * @returns The complete range in the format "Sheet!A1:Z10".
 *
 * @example
 * ```typescript
 * const rangeWithSheet = addSheetToRange({ sheet: 'Sheet1', range: 'A1:Z10' });
 * // "Sheet1!A1:Z10"
 * ```
 */
export function addSheetToRange(params: AddSheetToRangeParams): string {
  const { sheet, range } = params

  if (!sheet) {
    throw new Error('Sheet name is required.')
  }

  if (!range) {
    throw new Error('Range is required.')
  }

  return `${sheet}!${range}`
}

/**
 * Returns the range string for the first row of the specified sheet.
 *
 * @param sheet - The name of the sheet.
 * @returns The range string for the first row in the format `${sheet}!1:1`.
 *
 * @example
 * ```typescript
 * const range = createFirstRowRange("Sheet1");
 * console.log(range); // Output: "Sheet1!1:1"
 * ```
 */
export function createFirstRowRange(sheet: string): string {
  return addSheetToRange({ sheet, range: '1:1' })
}

/**
 * Cria um range para uma linha específica na folha.
 *
 * @param params - Os parâmetros para criar o range.
 * @returns O range no formato "Sheet!A2:E2".
 */
export function createFullRowRange(params: SingleRowRangeParams): string {
  const { sheet, row, lastColumnIndex } = params

  if (!sheet) {
    throw new Error('Nome da folha é obrigatório.')
  }

  if (row <= 0) {
    throw new Error('Número da linha deve ser positivo.')
  }

  if (lastColumnIndex < 0) {
    throw new Error('Índice da última coluna deve ser não negativo.')
  }

  const lastColumn = indexToColumn(lastColumnIndex)

  return createA1Notation({
    sheet,
    startColumn: indexToColumn(0),
    endColumn: lastColumn,
    startRow: row,
    endRow: row
  })
}
