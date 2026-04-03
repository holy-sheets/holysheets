import { RecordSchema } from '@/types/RecordSchema.types'
import { WhereClause } from '@/services/where/types/where.types'

export type CliSource = 'google-sheets'

export type ReadOperation = 'find-many' | 'find-first' | 'describe'

export type OutputFormat = 'json' | 'csv' | 'ndjson'

export type CliRecordValue = string | number | boolean | Date | null

export type CliRecord = Record<string, CliRecordValue>

export interface ParsedSchemaFlagBlock {
  field: string
  type?: string
  nullable?: boolean
  alias?: string
}

export interface ParsedWhereFlagBlock {
  field: string
  op?: string
  values: string[]
}

export interface ParsedReadFlags {
  config?: string
  spreadsheetId?: string
  sheet?: string
  headerRow?: string
  format?: string
  output?: string
  pretty: boolean
  select: string[]
  schemaFile?: string
  schemaJson?: string
  schemaBlocks: ParsedSchemaFlagBlock[]
  whereBlocks: ParsedWhereFlagBlock[]
}

export interface CliConfigDefaults {
  spreadsheetId?: string
  sheet?: string
  headerRow?: number
  format?: OutputFormat
  pretty?: boolean
}

export interface CliConfigFile {
  defaults?: CliConfigDefaults
}

export interface NormalizedReadCommand {
  source: CliSource
  operation: ReadOperation
  spreadsheetId: string
  sheet: string
  headerRow: number
  format: OutputFormat
  output?: string
  pretty: boolean
  select: string[]
  where: WhereClause<CliRecord>
  schema?: RecordSchema<CliRecord>
}

export interface ReadDescribeOutput {
  source: CliSource
  spreadsheetId: string
  sheet: string
  headerRow: number
  columns: Array<{
    index: number
    name: string
  }>
  schema: RecordSchema<CliRecord>
}
