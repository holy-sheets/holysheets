import { CliError } from '@/cli/errors/CliError'
import { CliRecord, NormalizedReadCommand } from '@/cli/types'

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  const normalizedValue =
    value instanceof Date
      ? value.toISOString()
      : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value)

  const escaped = normalizedValue.replace(/"/g, '""')
  if (/[",\n\r]/.test(escaped)) {
    return `"${escaped}"`
  }
  return escaped
}

function toCsv(records: CliRecord[]): string {
  if (records.length === 0) {
    return ''
  }

  const columns: string[] = []
  const seen = new Set<string>()

  records.forEach(record => {
    Object.keys(record).forEach(key => {
      if (!seen.has(key)) {
        seen.add(key)
        columns.push(key)
      }
    })
  })

  const lines = [columns.map(escapeCsvValue).join(',')]

  records.forEach(record => {
    const row = columns.map(column => escapeCsvValue(record[column]))
    lines.push(row.join(','))
  })

  return lines.join('\n')
}

export function serializeOutput(
  command: NormalizedReadCommand,
  data: unknown
): string {
  const { format, operation, pretty } = command

  if (format === 'json') {
    return JSON.stringify(data, null, pretty ? 2 : undefined)
  }

  if (format === 'ndjson') {
    if (operation === 'find-many' || operation === 'find-many-or-throw') {
      const rows = Array.isArray(data) ? data : []
      return rows.map(row => JSON.stringify(row)).join('\n')
    }
    return JSON.stringify(data)
  }

  if (format === 'csv') {
    if (operation === 'describe') {
      throw new CliError('Format "csv" is not supported for "read describe".')
    }
    const rows = Array.isArray(data)
      ? (data as CliRecord[])
      : data
        ? [data as CliRecord]
        : []
    return toCsv(rows)
  }

  throw new CliError('Unsupported output format.')
}
