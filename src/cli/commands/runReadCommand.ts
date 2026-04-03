import HolySheets from '@/index'
import {
  CliRecord,
  NormalizedReadCommand,
  ReadDescribeOutput
} from '@/cli/types'
import { RecordSchema } from '@/types/RecordSchema.types'
import { HeaderColumn } from '@/services/header/HeaderService.types'
import { WhereClause } from '@/services/where/types/where.types'

type PublicReadTable = {
  defineSchema: (schema: RecordSchema<CliRecord>) => unknown
  findMany: (options: {
    where: WhereClause<CliRecord>
    select?: string[]
    omit?: string[]
  }) => Promise<CliRecord[]>
  findFirst: (options: {
    where: WhereClause<CliRecord>
    select?: string[]
    omit?: string[]
  }) => Promise<CliRecord | undefined>
  findUnique: (options: {
    where: WhereClause<CliRecord>
    select?: string[]
    omit?: string[]
  }) => Promise<CliRecord | undefined>
  findLast: (options: {
    where: WhereClause<CliRecord>
    select?: string[]
    omit?: string[]
  }) => Promise<CliRecord | undefined>
  findManyOrThrow: (options: {
    where: WhereClause<CliRecord>
    select?: string[]
    omit?: string[]
  }) => Promise<CliRecord[]>
  findFirstOrThrow: (options: {
    where: WhereClause<CliRecord>
    select?: string[]
    omit?: string[]
  }) => Promise<CliRecord>
  findUniqueOrThrow: (options: {
    where: WhereClause<CliRecord>
    select?: string[]
    omit?: string[]
  }) => Promise<CliRecord>
  findLastOrThrow: (options: {
    where: WhereClause<CliRecord>
    select?: string[]
    omit?: string[]
  }) => Promise<CliRecord>
  getHeaders: () => Promise<HeaderColumn[]>
}

export async function runReadCommand(
  command: NormalizedReadCommand
): Promise<CliRecord[] | CliRecord | null | ReadDescribeOutput> {
  const reader = HolySheets.public({
    spreadsheetId: command.spreadsheetId
  })

  const table = reader.base<CliRecord>(command.sheet, {
    headerRow: command.headerRow
  }) as unknown as PublicReadTable

  if (command.schema) {
    table.defineSchema(command.schema)
  }

  const findOptions: {
    where: WhereClause<CliRecord>
    select?: string[]
    omit?: string[]
  } = {
    where: command.where
  }

  if (command.select.length > 0) {
    findOptions.select = command.select
  }

  if (command.omit.length > 0) {
    findOptions.omit = command.omit
  }

  switch (command.operation) {
    case 'find-many':
      return await table.findMany(findOptions)

    case 'find-first': {
      const record = await table.findFirst(findOptions)
      return record ?? null
    }

    case 'find-unique': {
      const record = await table.findUnique(findOptions)
      return record ?? null
    }

    case 'find-last': {
      const record = await table.findLast(findOptions)
      return record ?? null
    }

    case 'find-many-or-throw':
      return await table.findManyOrThrow(findOptions)

    case 'find-first-or-throw':
      return await table.findFirstOrThrow(findOptions)

    case 'find-unique-or-throw':
      return await table.findUniqueOrThrow(findOptions)

    case 'find-last-or-throw':
      return await table.findLastOrThrow(findOptions)

    case 'describe': {
      const headers = await table.getHeaders()
      return {
        source: command.source,
        spreadsheetId: command.spreadsheetId,
        sheet: command.sheet,
        headerRow: command.headerRow,
        columns: headers.map(header => ({
          index: header.column,
          name: header.header
        })),
        schema: command.schema ?? []
      }
    }
  }
}
