import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { CliError } from '@/cli/errors/CliError'
import { normalizeReadCommand } from '@/cli/normalize/normalizeReadCommand'
import { ParsedReadFlags } from '@/cli/types'

function createBaseFlags(): ParsedReadFlags {
  return {
    pretty: false,
    select: [],
    schemaBlocks: [],
    whereBlocks: []
  }
}

describe('normalizeReadCommand', () => {
  it('applies precedence: CLI flags > config > defaults', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'flag-id'
    flags.whereBlocks = [
      { field: 'rating', op: 'gte', values: ['4'] },
      { field: 'rating', op: 'lte', values: ['5'] }
    ]

    const normalized = normalizeReadCommand({
      operation: 'find-many',
      flags,
      config: {
        defaults: {
          spreadsheetId: 'config-id',
          sheet: 'places',
          headerRow: 2
        }
      }
    })

    expect(normalized.spreadsheetId).toBe('flag-id')
    expect(normalized.sheet).toBe('places')
    expect(normalized.headerRow).toBe(2)
    expect(normalized.where).toEqual({
      rating: { gte: 4, lte: 5 }
    })
  })

  it('parses schema from file and validates supported types', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'holysheets-cli-'))
    const schemaPath = path.join(tmpDir, 'schema.json')
    fs.writeFileSync(
      schemaPath,
      JSON.stringify([
        { key: 'name', type: 'string' },
        { key: 'rating', type: 'number', nullable: true }
      ])
    )

    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.schemaFile = schemaPath

    const normalized = normalizeReadCommand({
      operation: 'describe',
      flags,
      config: {}
    })

    expect(normalized.schema).toEqual([
      { key: 'name', type: 'string' },
      { key: 'rating', type: 'number', nullable: true }
    ])
  })

  it('fails on invalid where operator', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.whereBlocks = [{ field: 'name', op: 'eq', values: ['a'] }]

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(CliError)
  })

  it('fails when csv is used with describe', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.format = 'csv'

    expect(() =>
      normalizeReadCommand({
        operation: 'describe',
        flags,
        config: {}
      })
    ).toThrowError(CliError)
  })
})
