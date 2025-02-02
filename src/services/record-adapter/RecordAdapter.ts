import { SchemaTypeMismatchError } from '@/errors/SchemaTypeMismatchError'
import { RecordSchema, DataTypes } from '@/types/RecordSchema.types'
import { HeaderColumn } from '@/services/header/HeaderService.types'

interface ToRecordOptions<RecordType> {
  schema?: RecordSchema<RecordType>
  headerColumns: HeaderColumn[]
}

export const RecordAdapter = {
  toRecord<RecordType>(
    data: string[],
    options: ToRecordOptions<RecordType>
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
      const isNullish =
        rawValue === '' || rawValue === null || rawValue === undefined
      if (isNullish && nullable) {
        record[key as keyof RecordType] =
          null as unknown as RecordType[keyof RecordType]
        return
      }
      const parsedValue = parseValue(header, rawValue, type)
      record[key as keyof RecordType] =
        parsedValue as RecordType[keyof RecordType]
    })

    return record as RecordType
  }
}

function parseValue(
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
        const bool = parseBoolean(rawValue)
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

function parseBoolean(rawValue: string): boolean | null {
  const lower = rawValue.toLowerCase()
  if (lower === 'true' || rawValue === '1') return true
  if (lower === 'false' || rawValue === '0') return false
  return null
}
