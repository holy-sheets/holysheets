import { describe, expect, it } from 'vitest'

import { CliError } from '@/cli/errors/CliError'
import { parseReadFlags } from '@/cli/parse/parseReadFlags'

describe('parseReadFlags', () => {
  it('parses grouped schema and where flags in order', () => {
    const parsed = parseReadFlags([
      '--sheet',
      'places',
      '--schema-field',
      'name',
      '--schema-type',
      'string',
      '--schema-field',
      'rating',
      '--schema-type',
      'number',
      '--schema-nullable',
      '--where-field',
      'rating',
      '--where-op',
      'gte',
      '--where-value',
      '4',
      '--where-field',
      'name',
      '--where-op',
      'contains',
      '--where-value',
      'bar',
      '--select',
      'name',
      '--select',
      'rating',
      '--omit',
      'instagram'
    ])

    expect(parsed.sheet).toBe('places')
    expect(parsed.select).toEqual(['name', 'rating'])
    expect(parsed.omit).toEqual(['instagram'])
    expect(parsed.schemaBlocks).toEqual([
      { field: 'name', type: 'string' },
      { field: 'rating', type: 'number', nullable: true }
    ])
    expect(parsed.whereBlocks).toEqual([
      { field: 'rating', op: 'gte', values: ['4'] },
      { field: 'name', op: 'contains', values: ['bar'] }
    ])
  })

  it('fails when schema-type is used without schema-field', () => {
    expect(() => parseReadFlags(['--schema-type', 'string'])).toThrowError(
      CliError
    )
  })

  it('fails on unknown option', () => {
    expect(() => parseReadFlags(['--unknown', 'value'])).toThrowError(CliError)
  })

  it('parses inline values and boolean flags', () => {
    const parsed = parseReadFlags([
      '--config=./holysheets.cli.json',
      '--spreadsheet-id=sheet-id',
      '--sheet=pokemon',
      '--header-row=2',
      '--format=ndjson',
      '--output=./out.ndjson',
      '--pretty',
      '--schema-file=./schema.json',
      '--schema-json=[]',
      '--where-field',
      'id',
      '--where-op',
      'equals',
      '--where-value',
      '1'
    ])

    expect(parsed).toEqual({
      config: './holysheets.cli.json',
      spreadsheetId: 'sheet-id',
      sheet: 'pokemon',
      headerRow: '2',
      format: 'ndjson',
      output: './out.ndjson',
      schemaFile: './schema.json',
      schemaJson: '[]',
      pretty: true,
      select: [],
      omit: [],
      schemaBlocks: [],
      whereBlocks: [{ field: 'id', op: 'equals', values: ['1'] }]
    })
  })

  it('throws when receiving positional args', () => {
    expect(() => parseReadFlags(['oops'])).toThrowError(
      new CliError('Unexpected positional argument "oops".')
    )
  })

  it('throws when value is missing', () => {
    expect(() => parseReadFlags(['--sheet'])).toThrowError(
      new CliError('Missing value for "--sheet".')
    )
  })

  it('throws when boolean flag receives inline value', () => {
    expect(() => parseReadFlags(['--pretty=true'])).toThrowError(
      new CliError('Option "--pretty" does not accept a value.')
    )
  })

  it('throws when schema-nullable is used before schema-field', () => {
    expect(() => parseReadFlags(['--schema-nullable'])).toThrowError(
      new CliError(
        'Flag "--schema-nullable" must be used after "--schema-field".'
      )
    )
  })

  it('throws when schema-alias is used before schema-field', () => {
    expect(() => parseReadFlags(['--schema-alias', 'x'])).toThrowError(
      new CliError('Flag "--schema-alias" must be used after "--schema-field".')
    )
  })

  it('throws on duplicate schema type for same field', () => {
    expect(() =>
      parseReadFlags([
        '--schema-field',
        'name',
        '--schema-type',
        'string',
        '--schema-type',
        'number'
      ])
    ).toThrowError(new CliError('Schema field "name" already has a type.'))
  })

  it('throws on duplicate schema alias for same field', () => {
    expect(() =>
      parseReadFlags([
        '--schema-field',
        'name',
        '--schema-type',
        'string',
        '--schema-alias',
        'n',
        '--schema-alias',
        'name2'
      ])
    ).toThrowError(new CliError('Schema field "name" already has an alias.'))
  })

  it('throws when where-op is used before where-field', () => {
    expect(() => parseReadFlags(['--where-op', 'equals'])).toThrowError(
      new CliError('Flag "--where-op" must be used after "--where-field".')
    )
  })

  it('throws when where-value is used before where-field', () => {
    expect(() => parseReadFlags(['--where-value', 'x'])).toThrowError(
      new CliError('Flag "--where-value" must be used after "--where-field".')
    )
  })

  it('throws on duplicate where-op in the same filter block', () => {
    expect(() =>
      parseReadFlags([
        '--where-field',
        'name',
        '--where-op',
        'contains',
        '--where-op',
        'equals'
      ])
    ).toThrowError(
      new CliError('Filter for field "name" already has an operator.')
    )
  })
})
