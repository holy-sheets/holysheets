import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { CliError } from '@/cli/errors/CliError'
import { normalizeReadCommand } from '@/cli/normalize/normalizeReadCommand'
import { ParsedReadFlags } from '@/cli/types'

function createBaseFlags(): ParsedReadFlags {
  return {
    skipSheetValidation: false,
    pretty: false,
    select: [],
    omit: [],
    schemaBlocks: [],
    whereBlocks: []
  }
}

describe('normalizeReadCommand', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

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
    expect(normalized.skipSheetValidation).toBe(false)
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

  it('fails when select and omit are used together', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.select = ['name']
    flags.omit = ['rating']

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(CliError)
  })

  it('fails when omit is used with describe', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.omit = ['rating']

    expect(() =>
      normalizeReadCommand({
        operation: 'describe',
        flags,
        config: {}
      })
    ).toThrowError(CliError)
  })

  it('uses internal defaults when flags/config are missing optional values', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'

    const normalized = normalizeReadCommand({
      operation: 'find-first',
      flags,
      config: {}
    })

    expect(normalized.headerRow).toBe(1)
    expect(normalized.format).toBe('json')
    expect(normalized.pretty).toBe(false)
    expect(normalized.schema).toBeUndefined()
    expect(normalized.where).toEqual({})
  })

  it('uses pretty=true from config when cli flag is absent', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'

    const normalized = normalizeReadCommand({
      operation: 'find-first',
      flags,
      config: {
        defaults: {
          pretty: true
        }
      }
    })

    expect(normalized.pretty).toBe(true)
  })

  it('uses pretty=true from cli flag even when config default is false', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.pretty = true

    const normalized = normalizeReadCommand({
      operation: 'find-first',
      flags,
      config: {
        defaults: {
          pretty: false
        }
      }
    })

    expect(normalized.pretty).toBe(true)
  })

  it('uses skipSheetValidation=true from config when cli flag is absent', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'

    const normalized = normalizeReadCommand({
      operation: 'find-first',
      flags,
      config: {
        defaults: {
          skipSheetValidation: true
        }
      }
    })

    expect(normalized.skipSheetValidation).toBe(true)
  })

  it('uses skipSheetValidation=true from cli flag even when config default is false', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.skipSheetValidation = true

    const normalized = normalizeReadCommand({
      operation: 'find-first',
      flags,
      config: {
        defaults: {
          skipSheetValidation: false
        }
      }
    })

    expect(normalized.skipSheetValidation).toBe(true)
  })

  it('fails when spreadsheet id is missing in flags and config', () => {
    const flags = createBaseFlags()
    flags.sheet = 'places'

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(
      new CliError(
        'Missing required option "--spreadsheet-id" (or provide it in config.defaults.spreadsheetId).'
      )
    )
  })

  it('fails when sheet is missing in flags and config', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(
      new CliError(
        'Missing required option "--sheet" (or provide it in config.defaults.sheet).'
      )
    )
  })

  it('fails on invalid header row values', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.headerRow = '0'

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(
      new CliError(
        'Invalid value for "--header-row": "0". Use an integer >= 1.'
      )
    )
  })

  it('fails on invalid format', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.format = 'table'

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(
      new CliError(
        'Invalid value for "--format": "table". Allowed values: json, csv, ndjson.'
      )
    )
  })

  it('fails when more than one schema source is provided', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.schemaJson = '[]'
    flags.schemaBlocks = [{ field: 'name', type: 'string' }]

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(
      new CliError(
        'Use only one schema source at a time: --schema-file OR --schema-json OR --schema-field/... flags.'
      )
    )
  })

  it('parses schema from json with alias and nullable', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.schemaJson = JSON.stringify([
      { key: 'name', type: 'string', as: 'label' },
      { key: 'active', type: 'boolean', nullable: false }
    ])

    const normalized = normalizeReadCommand({
      operation: 'find-many',
      flags,
      config: {}
    })

    expect(normalized.schema).toEqual([
      { key: 'name', type: 'string', as: 'label' },
      { key: 'active', type: 'boolean', nullable: false }
    ])
  })

  it('fails on invalid json in --schema-json', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.schemaJson = '[invalid'

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(/Invalid JSON in "--schema-json":/)
  })

  it('fails when --schema-json is not an array', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.schemaJson = JSON.stringify({ key: 'name', type: 'string' })

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(
      /Invalid JSON in "--schema-json": Schema from --schema-json must be a JSON array\./
    )
  })

  it('fails when schema item is not an object', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.schemaJson = JSON.stringify(['name'])

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(
      /Invalid JSON in "--schema-json": Invalid schema item at index 0 from --schema-json\./
    )
  })

  it('fails when schema key is missing', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.schemaJson = JSON.stringify([{ type: 'string' }])

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(
      /Invalid JSON in "--schema-json": Schema item at index 0 from --schema-json must contain a non-empty "key"\./
    )
  })

  it('fails when schema type is missing', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.schemaJson = JSON.stringify([{ key: 'name' }])

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(
      /Invalid JSON in "--schema-json": Schema item "name" from --schema-json must contain a valid "type"\./
    )
  })

  it('fails when schema alias is invalid', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.schemaJson = JSON.stringify([{ key: 'name', type: 'string', as: 1 }])

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(
      /Invalid JSON in "--schema-json": Schema item "name" from --schema-json has an invalid "as" value\./
    )
  })

  it('fails when schema nullable is invalid', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.schemaJson = JSON.stringify([
      { key: 'name', type: 'string', nullable: 'true' }
    ])

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(
      /Invalid JSON in "--schema-json": Schema item "name" from --schema-json has an invalid "nullable" value\./
    )
  })

  it('fails when schema type is unsupported', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.schemaJson = JSON.stringify([{ key: 'name', type: 'datetime' }])

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(
      /Invalid JSON in "--schema-json": Invalid schema type "datetime"\. Allowed values: string, number, boolean, date\./
    )
  })

  it('fails when schema file does not exist', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.schemaFile = './does-not-exist.schema.json'

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(/Schema file not found:/)
  })

  it('fails when schema file cannot be read', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'holysheets-cli-'))
    const schemaPath = path.join(tmpDir, 'schema.json')
    fs.writeFileSync(schemaPath, '[]')
    vi.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
      throw new Error('EACCES')
    })

    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.schemaFile = schemaPath

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(/Could not read schema file/)
  })

  it('fails when schema file has invalid json', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'holysheets-cli-'))
    const schemaPath = path.join(tmpDir, 'schema.json')
    fs.writeFileSync(schemaPath, '[invalid]')

    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.schemaFile = schemaPath

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(/Invalid JSON in schema file/)
  })

  it('fails when schema block is incomplete', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.schemaBlocks = [{ field: 'name' }]

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(
      new CliError(
        'Schema field "name" is incomplete. Missing "--schema-type".'
      )
    )
  })

  it('parses schema from flag blocks with alias and nullable', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.schemaBlocks = [
      { field: 'name', type: 'string', alias: 'label' },
      { field: 'rating', type: 'number', nullable: true }
    ]

    const normalized = normalizeReadCommand({
      operation: 'find-many',
      flags,
      config: {}
    })

    expect(normalized.schema).toEqual([
      { key: 'name', type: 'string', as: 'label' },
      { key: 'rating', type: 'number', nullable: true }
    ])
  })

  it('fails when where block has no operator', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.whereBlocks = [{ field: 'name', values: ['foo'] }]

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(
      new CliError('Filter for field "name" is incomplete. Missing "--where-op".')
    )
  })

  it('parses in/notIn where operators and merges repeated array filters', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.whereBlocks = [
      { field: 'tags', op: 'in', values: ['fire'] },
      { field: 'tags', op: 'in', values: ['flying'] },
      { field: 'name', op: 'notIn', values: ['weedle'] }
    ]

    const normalized = normalizeReadCommand({
      operation: 'find-many',
      flags,
      config: {}
    })

    expect(normalized.where).toEqual({
      tags: { in: ['fire', 'flying'] },
      name: { notIn: ['weedle'] }
    })
  })

  it('fails when array where operators receive no values', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.whereBlocks = [{ field: 'name', op: 'in', values: [] }]

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(
      new CliError(
        'Filter operator "in" requires at least one "--where-value".'
      )
    )
  })

  it('fails when scalar where operators receive multiple values', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.whereBlocks = [{ field: 'name', op: 'equals', values: ['a', 'b'] }]

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(
      new CliError(
        'Filter operator "equals" requires exactly one "--where-value".'
      )
    )
  })

  it('fails when numeric where operators receive non-numeric value', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.whereBlocks = [{ field: 'rating', op: 'gte', values: ['high'] }]

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(
      new CliError(
        'Filter operator "gte" requires a numeric "--where-value". Received "high".'
      )
    )
  })

  it('fails when non-array operator is duplicated for same field', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.whereBlocks = [
      { field: 'name', op: 'contains', values: ['bar'] },
      { field: 'name', op: 'contains', values: ['cafe'] }
    ]

    expect(() =>
      normalizeReadCommand({
        operation: 'find-many',
        flags,
        config: {}
      })
    ).toThrowError(
      new CliError(
        'Duplicate filter for field "name" with operator "contains".'
      )
    )
  })

  it('fails when where filters are used with describe', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.whereBlocks = [{ field: 'name', op: 'contains', values: ['bar'] }]

    expect(() =>
      normalizeReadCommand({
        operation: 'describe',
        flags,
        config: {}
      })
    ).toThrowError(
      new CliError('Command "read describe" does not accept where filters.')
    )
  })

  it('fails when select is used with describe', () => {
    const flags = createBaseFlags()
    flags.spreadsheetId = 'id'
    flags.sheet = 'places'
    flags.select = ['name']

    expect(() =>
      normalizeReadCommand({
        operation: 'describe',
        flags,
        config: {}
      })
    ).toThrowError(
      new CliError('Command "read describe" does not accept "--select".')
    )
  })
})
