import { describe, it, expect } from 'vitest'
import { VisualizationQueryBuilder } from '@/services/visualization/VisualizationQueryBuilder'

describe('VisualizationQueryBuilder', () => {
  const headers = [
    { header: 'name', column: 0 },
    { header: 'age', column: 1 },
    { header: 'city', column: 2 }
  ]

  it('should build SELECT * when no where clause', () => {
    const builder = new VisualizationQueryBuilder({}, headers)
    expect(builder.build()).toBe('SELECT *')
  })

  it('should build simple equals condition from string value', () => {
    const builder = new VisualizationQueryBuilder({ name: 'John' }, headers)
    expect(builder.build()).toBe("SELECT * WHERE A = 'John'")
  })

  it('should build equals filter', () => {
    const builder = new VisualizationQueryBuilder(
      { name: { equals: 'John' } },
      headers
    )
    expect(builder.build()).toBe("SELECT * WHERE A = 'John'")
  })

  it('should build not filter', () => {
    const builder = new VisualizationQueryBuilder(
      { name: { not: 'John' } },
      headers
    )
    expect(builder.build()).toBe("SELECT * WHERE A != 'John'")
  })

  it('should build in filter', () => {
    const builder = new VisualizationQueryBuilder(
      { name: { in: ['John', 'Jane'] } },
      headers
    )
    expect(builder.build()).toBe("SELECT * WHERE (A = 'John' OR A = 'Jane')")
  })

  it('should build notIn filter', () => {
    const builder = new VisualizationQueryBuilder(
      { name: { notIn: ['John', 'Jane'] } },
      headers
    )
    expect(builder.build()).toBe("SELECT * WHERE (A != 'John' AND A != 'Jane')")
  })

  it('should build numeric comparison filters', () => {
    const builder = new VisualizationQueryBuilder(
      { age: { gt: 18, lte: 65 } },
      headers
    )
    const result = builder.build()
    expect(result).toContain('B > 18')
    expect(result).toContain('B <= 65')
  })

  it('should build lt and gte filters', () => {
    const builder = new VisualizationQueryBuilder(
      { age: { lt: 100, gte: 0 } },
      headers
    )
    const result = builder.build()
    expect(result).toContain('B < 100')
    expect(result).toContain('B >= 0')
  })

  it('should build contains filter', () => {
    const builder = new VisualizationQueryBuilder(
      { name: { contains: 'oh' } },
      headers
    )
    expect(builder.build()).toBe("SELECT * WHERE A contains 'oh'")
  })

  it('should build startsWith filter', () => {
    const builder = new VisualizationQueryBuilder(
      { name: { startsWith: 'Jo' } },
      headers
    )
    expect(builder.build()).toBe("SELECT * WHERE A starts with 'Jo'")
  })

  it('should build endsWith filter', () => {
    const builder = new VisualizationQueryBuilder(
      { name: { endsWith: 'hn' } },
      headers
    )
    expect(builder.build()).toBe("SELECT * WHERE A ends with 'hn'")
  })

  it('should build search (matches) filter', () => {
    const builder = new VisualizationQueryBuilder(
      { name: { search: 'J.*n' } },
      headers
    )
    expect(builder.build()).toBe("SELECT * WHERE A matches 'J.*n'")
  })

  it('should combine multiple columns with AND', () => {
    const builder = new VisualizationQueryBuilder(
      { name: 'John', city: 'NYC' },
      headers
    )
    expect(builder.build()).toBe("SELECT * WHERE A = 'John' AND C = 'NYC'")
  })

  it('should combine multiple filters on same column with AND', () => {
    const builder = new VisualizationQueryBuilder(
      { age: { gt: 18, lt: 65 } },
      headers
    )
    expect(builder.build()).toBe('SELECT * WHERE B < 65 AND B > 18')
  })

  it('should escape single quotes in values', () => {
    const builder = new VisualizationQueryBuilder({ name: "O'Brien" }, headers)
    expect(builder.build()).toBe("SELECT * WHERE A = 'O\\'Brien'")
  })

  it('should handle column at index > 25 (multi-letter notation)', () => {
    const wideHeaders = [
      ...headers,
      ...Array.from({ length: 24 }, (_, i) => ({
        header: `col${i + 3}`,
        column: i + 3
      }))
    ]
    // Column 26 = AA
    const builder = new VisualizationQueryBuilder({ col26: 'test' } as any, [
      ...wideHeaders,
      { header: 'col26', column: 26 }
    ])
    expect(builder.build()).toBe("SELECT * WHERE AA = 'test'")
  })

  it('should skip unknown headers in where clause', () => {
    const builder = new VisualizationQueryBuilder(
      { unknown: 'value' } as any,
      headers
    )
    expect(builder.build()).toBe('SELECT *')
  })
})
