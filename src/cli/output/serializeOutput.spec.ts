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
    skipSheetValidation: false,
    format: 'json',
    pretty: false,
    select: [],
    omit: [],
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

  it('serializes json with pretty output when requested', () => {
    const command = baseCommand({ format: 'json', pretty: true })
    const output = serializeOutput(command, { name: 'Pikachu', stats: { hp: 35 } })

    expect(output).toBe('{\n  "name": "Pikachu",\n  "stats": {\n    "hp": 35\n  }\n}')
  })

  it('serializes ndjson for find-many arrays', () => {
    const command = baseCommand({ format: 'ndjson', operation: 'find-many' })
    const output = serializeOutput(command, [{ id: 1 }, { id: 2 }])

    expect(output).toBe('{"id":1}\n{"id":2}')
  })

  it('serializes ndjson for find-many non-array values as empty output', () => {
    const command = baseCommand({ format: 'ndjson', operation: 'find-many' })
    const output = serializeOutput(command, { id: 1 })

    expect(output).toBe('')
  })

  it('serializes ndjson as single json for non-list operations', () => {
    const command = baseCommand({ format: 'ndjson', operation: 'find-first' })
    const output = serializeOutput(command, { id: 25 })

    expect(output).toBe('{"id":25}')
  })

  it('serializes csv from single-object results', () => {
    const command = baseCommand({ format: 'csv', operation: 'find-first' })
    const output = serializeOutput(command, { name: 'Eevee', rarity: 'rare' })

    expect(output).toBe('name,rarity\nEevee,rare')
  })

  it('serializes csv as empty content for nullish non-array data', () => {
    const command = baseCommand({ format: 'csv', operation: 'find-first' })

    expect(serializeOutput(command, null)).toBe('')
    expect(serializeOutput(command, undefined)).toBe('')
  })

  it('escapes complex csv values', () => {
    const command = baseCommand({ format: 'csv', operation: 'find-many' })
    const output = serializeOutput(command, [
      {
        name: 'Mr. Mime',
        notes: 'line1\nline2',
        quote: 'He said "hi"',
        metadata: { region: 'kanto' },
        capturedAt: new Date('2024-01-02T03:04:05.000Z')
      }
    ])

    expect(output).toBe(
      'name,notes,quote,metadata,capturedAt\nMr. Mime,"line1\nline2","He said ""hi""","{""region"":""kanto""}",2024-01-02T03:04:05.000Z'
    )
  })

  it('renders nullish csv cell values as empty strings', () => {
    const command = baseCommand({ format: 'csv', operation: 'find-many' })
    const output = serializeOutput(command, [{ a: null, b: undefined, c: 'ok' }])

    expect(output).toBe('a,b,c\n,,ok')
  })

  it('throws for unsupported output format', () => {
    const command = baseCommand({
      format: 'json'
    }) as NormalizedReadCommand & { format: 'table' }

    command.format = 'table'

    expect(() => serializeOutput(command, { a: 1 })).toThrowError(
      new CliError('Unsupported output format.')
    )
  })
})
