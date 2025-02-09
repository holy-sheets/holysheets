import { InvalidColumnIndexError } from '@/errors/InvalidColumnIndexError'

function indexToA1Notation(index: number): string {
  if (index < 0) {
    throw new InvalidColumnIndexError()
  }
  let column = ''
  while (index >= 0) {
    const remainder = index % 26
    column = String.fromCharCode(65 + remainder) + column
    index = Math.floor(index / 26) - 1
    if (index < 0) break
  }
  return column
}

export function getSingleRowNotation(sheet: string, rowNumber: number): string {
  return `${sheet}!${rowNumber}:${rowNumber}`
}

export function getSingleColumnNotation(
  sheet: string,
  columnIndex: number,
  headerRow = 1
): string {
  const column = indexToA1Notation(columnIndex)
  return `${sheet}!${column}${headerRow + 1}:${column}`
}

export function getFirstColumnNotation(sheet: string): string {
  return `${sheet}!A:A`
}
