import { describe, expect, it } from 'vitest'

import { CliError } from '@/cli/errors/CliError'
import { serializeOutput } from '@/cli/output/serializeOutput'
import { NormalizedReadCommand } from '@/cli/types'

function baseCommand(
  overrides: Partial<NormalizedReadCommand>
): NormalizedReadCommand {
  return {
    source: 'google-sheets',
    operation: 'find-many',
    spreadsheetId: 'id',
    sheet: 'places',
    headerRow: 1,
    format: 'json',
    pretty: false,
    select: [],
    where: {},
    ...overrides
  }
}

describe('serializeOutput', () => {
  it('serializes find-many as csv', () => {
    const command = baseCommand({ format: 'csv', operation: 'find-many' })
    const output = serializeOutput(command, [
      { name: 'Cafe', rating: 4.5 },
      { name: 'Bar', rating: 4.2 }
    ])

    expect(output).toBe('name,rating\nCafe,4.5\nBar,4.2')
  })

  it('serializes find-first as compact json', () => {
    const command = baseCommand({ operation: 'find-first', format: 'json' })
    const output = serializeOutput(command, { name: 'Cafe' })

    expect(output).toBe('{"name":"Cafe"}')
  })

  it('fails when csv is used outside find-many', () => {
    const command = baseCommand({ operation: 'describe', format: 'csv' })

    expect(() => serializeOutput(command, { a: 1 })).toThrowError(CliError)
  })
})
