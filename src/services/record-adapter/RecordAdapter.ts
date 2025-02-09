import { SchemaTypeMismatchError } from '@/errors/SchemaTypeMismatchError'
import { RecordSchema, DataTypes } from '@/types/RecordSchema.types'
import { HeaderColumn } from '@/services/header/HeaderService.types'
import { setValue } from './helpers/setValue'
import { FieldRequiredNoDefaultError } from '@/errors/FieldRequiredNoDefaultError'
import { NullableError } from '@/errors/NullableError'
import { NullableRequiredError } from '@/errors/NullableRequiredError'
import { InvalidBooleanValueError } from '@/errors/InvalidBooleanValueError'

interface RecordAdapterOptions<RecordType> {
  schema?: RecordSchema<RecordType> | null
  headerColumns: HeaderColumn[]
}

export const RecordAdapter = {
  toRecord<RecordType>(
    data: string[],
    options: RecordAdapterOptions<RecordType>
  ): RecordType {
    const { schema, headerColumns } = options
    const record = {} as Partial<RecordType>

    headerColumns.forEach(headerColumn => {
      const { header, column } = headerColumn
      const rawValue = data[column]
      const currentSchema = schema?.find(s => s.key === header)
      const type = currentSchema?.type ?? DataTypes.STRING
      const key = currentSchema?.as ?? header
      const nullable = currentSchema?.nullable ?? false

      // Basic checks for nullish values
      const isNullish =
        rawValue === '' || rawValue === null || rawValue === undefined
      if (isNullish && nullable) {
        record[key as keyof RecordType] =
          null as unknown as RecordType[keyof RecordType]
        return
      }

      // Convert the string to the correct type (existing logic)
      const parsedValue = stringToValue(header, rawValue, type)
      record[key as keyof RecordType] =
        parsedValue as RecordType[keyof RecordType]
    })

    return record as RecordType
  },

  fromRecord<RecordType>(
    record: RecordType,
    options: RecordAdapterOptions<RecordType>
  ): (string | null)[] {
    const { schema, headerColumns } = options
    if (headerColumns.length === 0) {
      return []
    }

    const maxColumn = Math.max(...headerColumns.map(hc => hc.column))
    const data: (string | null)[] = new Array(maxColumn + 1).fill('')

    headerColumns.forEach(headerColumn => {
      const { header, column } = headerColumn
      const schemaEntry = schema?.find(s => s.key === header)

      // figure out the final property key
      const key = header
      const type = schemaEntry?.type ?? DataTypes.STRING
      const nullable = schemaEntry?.nullable ?? false
      const required = schemaEntry?.required ?? false
      const defaultValue = schemaEntry?.default

      // Grab the current value from the record
      const rawValue = record[key as keyof RecordType]

      // 1. Use setValue() to respect nullable, required, and default constraints
      let finalValue: unknown
      try {
        finalValue = setValue({
          value: rawValue,
          nullable,
          required,
          defaultValue
        })
      } catch (err) {
        if (
          err instanceof FieldRequiredNoDefaultError ||
          err instanceof NullableError ||
          err instanceof NullableRequiredError
        ) {
          throw err
        }
        throw new SchemaTypeMismatchError(header, String(rawValue), type)
      }

      // 2. Convert finalValue (T | null) to a string for export
      let stringValue: string | null
      if (finalValue === null) {
        stringValue = null
      } else {
        switch (type) {
          case DataTypes.BOOLEAN:
            stringValue = booleanToString(key, finalValue as boolean)
            break
          case DataTypes.DATE:
            stringValue = (finalValue as Date).toISOString()
            break
          case DataTypes.NUMBER:
            stringValue = String(finalValue)
            break
          case DataTypes.STRING:
          default:
            stringValue = String(finalValue)
            break
        }
      }

      data[column] = stringValue
    })

    return data
  }
}

function stringToValue(
  header: string,
  rawValue: string,
  type: DataTypes
): unknown {
  try {
    switch (type) {
      case DataTypes.NUMBER: {
        const num = parseFloat(rawValue)
        if (Number.isNaN(num)) {
          throw new Error(`Invalid number: "${rawValue}"`)
        }
        return num
      }
      case DataTypes.BOOLEAN: {
        const bool = stringToBoolean(rawValue)
        if (bool === null) {
          throw new Error(`Invalid boolean: "${rawValue}"`)
        }
        return bool
      }
      case DataTypes.DATE: {
        const date = new Date(rawValue)
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date: "${rawValue}"`)
        }
        return date
      }
      case DataTypes.STRING:
      default:
        return rawValue
    }
  } catch {
    throw new SchemaTypeMismatchError(header, rawValue, type)
  }
}

function stringToBoolean(rawValue: string): boolean | null {
  const lower = rawValue.toLowerCase()
  if (lower === 'true' || rawValue === '1') return true
  if (lower === 'false' || rawValue === '0') return false
  return null
}

function booleanToString(key: string, value: boolean): string {
  const stringified = String(value).trim().toLowerCase()
  if (!['true', 'false'].includes(stringified)) {
    throw new InvalidBooleanValueError(key, String(value))
  }
  return stringified.toUpperCase()
}
