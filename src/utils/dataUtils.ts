import { SheetHeaders } from '../types/headers'

/**
 * Deconstructs a record object into an array of values based on the provided headers.
 *
 * @template RecordType - The type of the record object.
 * @param {RecordType} record - The record object to deconstruct.
 * @param {SheetHeaders[]} headers - The headers to use for deconstruction.
 * @returns {(string | number)[]} - An array of deconstructed values.
 */
export const decombine = <RecordType extends Record<string, string>>(
  record: RecordType,
  headers: SheetHeaders[]
): string[] => {
  const valuesForRow: string[] = []
  headers.forEach(header => {
    const isValidType =
      typeof record[header.name] === 'string' ||
      typeof record[header.name] === 'number' ||
      typeof record[header.name] === 'boolean'
    valuesForRow.push(isValidType ? record[header.name] : '')
  })
  return valuesForRow
}

export const combine = <RecordType extends Record<string, string>>(
  data: string[],
  headers: SheetHeaders[]
): RecordType => {
  return headers.reduce((acc: RecordType, header) => {
    const headerByIndex = headers.find(h => h.index === header.index)
    const key = headerByIndex?.name as keyof RecordType
    acc[key] = data[header.index] as RecordType[keyof RecordType]
    return acc
  }, {} as RecordType)
}
