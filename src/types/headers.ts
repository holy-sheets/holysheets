/**
 * Represents the columns of a spreadsheet.
 *
 * This type includes columns from 'A' to 'Z' and extends to double-letter columns
 * from 'AA' to 'AZ'.
 *
 * @example
 * // Valid values
 * let column: SheetColumn;
 * column = 'A';
 * column = 'Z';
 * column = 'AA';
 * column = 'AZ';
 *
 * @remarks
 * This type is useful for defining the columns in a spreadsheet where the columns
 * are labeled alphabetically.
 */
export type SheetColumn = // @TODO: Check if this variable is used in the codebase.

    | 'A'
    | 'B'
    | 'C'
    | 'D'
    | 'E'
    | 'F'
    | 'G'
    | 'H'
    | 'I'
    | 'J'
    | 'K'
    | 'L'
    | 'M'
    | 'N'
    | 'O'
    | 'P'
    | 'Q'
    | 'R'
    | 'S'
    | 'T'
    | 'U'
    | 'V'
    | 'W'
    | 'X'
    | 'Y'
    | 'Z'
    | 'AA'
    | 'AB'
    | 'AC'
    | 'AD'
    | 'AE'
    | 'AF'
    | 'AG'
    | 'AH'
    | 'AI'
    | 'AJ'
    | 'AK'
    | 'AL'
    | 'AM'
    | 'AN'
    | 'AO'
    | 'AP'
    | 'AQ'
    | 'AR'
    | 'AS'
    | 'AT'
    | 'AU'
    | 'AV'
    | 'AW'
    | 'AX'
    | 'AY'
    | 'AZ'

/**
 * Represents the headers of a sheet.
 *
 * @interface SheetHeaders
 *
 * @property {SheetColumn} column - The column information of the sheet.
 * @property {string} name - The name of the header.
 * @property {number} index - The index of the header.
 */
export interface SheetHeaders {
  column: SheetColumn
  name: string
  index: number
}
