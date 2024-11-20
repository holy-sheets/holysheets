import { SheetColumn } from '@/types/headers'

export const alphabet: SheetColumn[] = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  'AA',
  'AB',
  'AC',
  'AD',
  'AE',
  'AF',
  'AG',
  'AH',
  'AI',
  'AJ',
  'AK',
  'AL',
  'AM',
  'AN',
  'AO',
  'AP',
  'AQ',
  'AR',
  'AS',
  'AT',
  'AU',
  'AV',
  'AW',
  'AX',
  'AY',
  'AZ'
]

/**
 * Converts a zero-based index to a corresponding column label.
 *
 * @param index - The zero-based index of the column.
 * @returns The corresponding column label as a `SheetColumn`.
 *
 * @example
 * ```typescript
 * const columnLabel = indexToColumn(0);
 * console.log(columnLabel); // Outputs: 'A'
 * ```
 */
export const indexToColumn = (index: number): SheetColumn => alphabet[index]
