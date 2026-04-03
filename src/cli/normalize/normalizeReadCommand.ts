import fs from 'node:fs'
import path from 'node:path'

import { CliError } from '@/cli/errors/CliError'
import {
  CliConfigFile,
  CliRecord,
  NormalizedReadCommand,
  OutputFormat,
  ParsedReadFlags,
  ReadOperation
} from '@/cli/types'
import { DataTypes, RecordSchema } from '@/types/RecordSchema.types'
import { WhereClause, WhereCondition } from '@/services/where/types/where.types'

const SUPPORTED_FORMATS: OutputFormat[] = ['json', 'csv', 'ndjson']
const SUPPORTED_SCHEMA_TYPES = new Set<string>(Object.values(DataTypes))

const SUPPORTED_WHERE_OPS = new Set([
  'equals',
  'not',
  'in',
  'notIn',
  'lt',
  'lte',
  'gt',
  'gte',
  'contains',
  'startsWith',
  'endsWith',
  'search'
])

const NUMERIC_WHERE_OPS = new Set(['lt', 'lte', 'gt', 'gte'])
const ARRAY_WHERE_OPS = new Set(['in', 'notIn'])

type NormalizationInput = {
  operation: ReadOperation
  flags: ParsedReadFlags
  config: CliConfigFile
}

function parseHeaderRow(rawValue: string | number | undefined): number {
  if (rawValue === undefined) {
    return 1
  }

  const parsed =
    typeof rawValue === 'number'
      ? rawValue
      : Number.parseInt(String(rawValue), 10)

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new CliError(
      `Invalid value for "--header-row": "${rawValue}". Use an integer >= 1.`
    )
  }

  return parsed
}

function parseFormat(rawFormat: string | undefined): OutputFormat {
  const format = (rawFormat ?? 'json') as OutputFormat
  if (!SUPPORTED_FORMATS.includes(format)) {
    throw new CliError(
      `Invalid value for "--format": "${rawFormat}". Allowed values: ${SUPPORTED_FORMATS.join(', ')}.`
    )
  }
  return format
}

function parseSchemaType(schemaType: string): DataTypes {
  if (!SUPPORTED_SCHEMA_TYPES.has(schemaType)) {
    throw new CliError(
      `Invalid schema type "${schemaType}". Allowed values: string, number, boolean, date.`
    )
  }
  return schemaType as DataTypes
}

function parseSchemaItem(item: unknown, source: string, index: number) {
  if (typeof item !== 'object' || item === null || Array.isArray(item)) {
    throw new CliError(`Invalid schema item at index ${index} from ${source}.`)
  }

  const record = item as Record<string, unknown>
  const key = record.key
  const type = record.type
  const as = record.as
  const nullable = record.nullable

  if (typeof key !== 'string' || key.length === 0) {
    throw new CliError(
      `Schema item at index ${index} from ${source} must contain a non-empty "key".`
    )
  }

  if (typeof type !== 'string') {
    throw new CliError(
      `Schema item "${key}" from ${source} must contain a valid "type".`
    )
  }

  const parsedType = parseSchemaType(type)
  const normalized: Record<string, unknown> = {
    key,
    type: parsedType
  }

  if (as !== undefined) {
    if (typeof as !== 'string' || as.length === 0) {
      throw new CliError(
        `Schema item "${key}" from ${source} has an invalid "as" value.`
      )
    }
    normalized.as = as
  }

  if (nullable !== undefined) {
    if (typeof nullable !== 'boolean') {
      throw new CliError(
        `Schema item "${key}" from ${source} has an invalid "nullable" value.`
      )
    }
    normalized.nullable = nullable
  }

  return normalized
}

function parseSchemaArray(
  rawSchema: unknown,
  source: string
): RecordSchema<CliRecord> {
  if (!Array.isArray(rawSchema)) {
    throw new CliError(`Schema from ${source} must be a JSON array.`)
  }

  return rawSchema.map((item, index) =>
    parseSchemaItem(item, source, index)
  ) as RecordSchema<CliRecord>
}

function parseSchemaFromJson(json: string): RecordSchema<CliRecord> {
  try {
    const parsed = JSON.parse(json)
    return parseSchemaArray(parsed, '--schema-json')
  } catch (error) {
    throw new CliError(
      `Invalid JSON in "--schema-json": ${(error as Error).message}`
    )
  }
}

function parseSchemaFromFile(schemaPath: string): RecordSchema<CliRecord> {
  const resolvedPath = path.resolve(process.cwd(), schemaPath)
  if (!fs.existsSync(resolvedPath)) {
    throw new CliError(`Schema file not found: ${resolvedPath}`)
  }

  let fileContent: string
  try {
    fileContent = fs.readFileSync(resolvedPath, 'utf8')
  } catch (error) {
    throw new CliError(
      `Could not read schema file "${resolvedPath}": ${(error as Error).message}`
    )
  }

  try {
    const parsed = JSON.parse(fileContent)
    return parseSchemaArray(parsed, `schema file "${resolvedPath}"`)
  } catch (error) {
    throw new CliError(
      `Invalid JSON in schema file "${resolvedPath}": ${(error as Error).message}`
    )
  }
}

function parseSchemaFromBlocks(
  flags: ParsedReadFlags
): RecordSchema<CliRecord> {
  return flags.schemaBlocks.map(block => {
    if (!block.type) {
      throw new CliError(
        `Schema field "${block.field}" is incomplete. Missing "--schema-type".`
      )
    }

    const normalized: Record<string, unknown> = {
      key: block.field,
      type: parseSchemaType(block.type)
    }

    if (block.alias) {
      normalized.as = block.alias
    }
    if (block.nullable) {
      normalized.nullable = true
    }
    return normalized
  }) as RecordSchema<CliRecord>
}

function resolveSchema(
  flags: ParsedReadFlags
): RecordSchema<CliRecord> | undefined {
  const sourceCount = [
    Boolean(flags.schemaFile),
    Boolean(flags.schemaJson),
    flags.schemaBlocks.length > 0
  ].filter(Boolean).length

  if (sourceCount > 1) {
    throw new CliError(
      'Use only one schema source at a time: --schema-file OR --schema-json OR --schema-field/... flags.'
    )
  }

  if (flags.schemaFile) {
    return parseSchemaFromFile(flags.schemaFile)
  }
  if (flags.schemaJson) {
    return parseSchemaFromJson(flags.schemaJson)
  }
  if (flags.schemaBlocks.length > 0) {
    return parseSchemaFromBlocks(flags)
  }
  return undefined
}

function parseWhereValue(
  op: string,
  values: string[]
): string | string[] | number {
  if (ARRAY_WHERE_OPS.has(op)) {
    if (values.length === 0) {
      throw new CliError(
        `Filter operator "${op}" requires at least one "--where-value".`
      )
    }
    return values
  }

  if (values.length !== 1) {
    throw new CliError(
      `Filter operator "${op}" requires exactly one "--where-value".`
    )
  }

  const [value] = values
  if (NUMERIC_WHERE_OPS.has(op)) {
    const parsed = Number(value)
    if (Number.isNaN(parsed)) {
      throw new CliError(
        `Filter operator "${op}" requires a numeric "--where-value". Received "${value}".`
      )
    }
    return parsed
  }

  return value
}

function mergeWhereCondition(
  where: WhereClause<CliRecord>,
  field: string,
  op: string,
  parsedValue: string | string[] | number
) {
  const key: keyof CliRecord = field
  const existingCondition = where[key]
  if (!existingCondition) {
    where[key] = {
      [op]: parsedValue
    } as WhereCondition
    return
  }

  const conditionObject = existingCondition as WhereCondition

  const alreadyDefined = conditionObject[op as keyof WhereCondition]
  if (alreadyDefined !== undefined) {
    if (ARRAY_WHERE_OPS.has(op)) {
      const merged = [
        ...(alreadyDefined as string[]),
        ...(parsedValue as string[])
      ]
      conditionObject[op as keyof WhereCondition] = merged
      where[key] = conditionObject
      return
    }
    throw new CliError(
      `Duplicate filter for field "${field}" with operator "${op}".`
    )
  }

  conditionObject[op as keyof WhereCondition] = parsedValue
  where[key] = conditionObject
}

function resolveWhere(flags: ParsedReadFlags): WhereClause<CliRecord> {
  const where: WhereClause<CliRecord> = Object.create(null)

  for (const block of flags.whereBlocks) {
    if (!block.op) {
      throw new CliError(
        `Filter for field "${block.field}" is incomplete. Missing "--where-op".`
      )
    }

    if (!SUPPORTED_WHERE_OPS.has(block.op)) {
      throw new CliError(
        `Invalid "--where-op" value "${block.op}". Allowed values: ${Array.from(
          SUPPORTED_WHERE_OPS
        ).join(', ')}.`
      )
    }

    const parsedValue = parseWhereValue(block.op, block.values)
    mergeWhereCondition(where, block.field, block.op, parsedValue)
  }

  return where
}

export function normalizeReadCommand({
  operation,
  flags,
  config
}: NormalizationInput): NormalizedReadCommand {
  const defaults = config.defaults ?? {}

  const spreadsheetId = flags.spreadsheetId ?? defaults.spreadsheetId
  const sheet = flags.sheet ?? defaults.sheet
  const headerRow = parseHeaderRow(flags.headerRow ?? defaults.headerRow)
  const skipSheetValidation = flags.skipSheetValidation
    ? true
    : Boolean(defaults.skipSheetValidation ?? false)
  const format = parseFormat(flags.format ?? defaults.format)
  const pretty = flags.pretty ? true : Boolean(defaults.pretty ?? false)

  if (!spreadsheetId) {
    throw new CliError(
      'Missing required option "--spreadsheet-id" (or provide it in config.defaults.spreadsheetId).'
    )
  }

  if (!sheet) {
    throw new CliError(
      'Missing required option "--sheet" (or provide it in config.defaults.sheet).'
    )
  }

  const schema = resolveSchema(flags)
  const where = resolveWhere(flags)

  if (operation === 'describe' && Object.keys(where).length > 0) {
    throw new CliError('Command "read describe" does not accept where filters.')
  }

  if (operation === 'describe' && flags.select.length > 0) {
    throw new CliError('Command "read describe" does not accept "--select".')
  }

  if (operation === 'describe' && flags.omit.length > 0) {
    throw new CliError('Command "read describe" does not accept "--omit".')
  }

  if (flags.select.length > 0 && flags.omit.length > 0) {
    throw new CliError(
      'Options "--select" and "--omit" cannot be used together in the same command.'
    )
  }

  if (format === 'csv' && operation === 'describe') {
    throw new CliError('Format "csv" is not supported for "read describe".')
  }

  return {
    source: 'google-sheets',
    operation,
    spreadsheetId,
    sheet,
    headerRow,
    skipSheetValidation,
    format,
    output: flags.output,
    pretty,
    select: flags.select,
    omit: flags.omit,
    where,
    schema
  }
}
