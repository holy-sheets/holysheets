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
      'rating'
    ])

    expect(parsed.sheet).toBe('places')
    expect(parsed.select).toEqual(['name', 'rating'])
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
})
