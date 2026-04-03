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
    select: string[]
  }) => Promise<CliRecord[]>
  findFirst: (options: {
    where: WhereClause<CliRecord>
    select: string[]
  }) => Promise<CliRecord | undefined>
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

  if (command.operation === 'find-many') {
    const records = await table.findMany({
      where: command.where,
      select: command.select
    })
    return records
  }

  if (command.operation === 'find-first') {
    const record = await table.findFirst({
      where: command.where,
      select: command.select
    })
    return record ?? null
  }

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
