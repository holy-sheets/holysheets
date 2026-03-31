# Public Read-Only Mode

HolySheets! supports a **public read-only mode** that lets you query public Google Sheets without any authentication setup. This is ideal for dashboards, static sites, public datasets, and rapid prototyping.

Under the hood, this mode uses the [Google Visualization API](https://developers.google.com/chart/interactive/docs/querylanguage) to execute SQL-like queries server-side, returning only the matching rows.

---

## Prerequisites

Your Google Sheet must be accessible publicly. Either:

- **Publish** the spreadsheet via _File → Share → Publish to the web_, or
- **Share** it as _"Anyone with the link can view"_.

No service account, OAuth setup, or API key is required.

---

## Getting Started

```Typescript
import HolySheets from 'holysheets'

const reader = HolySheets.public({
  spreadsheetId: 'YOUR_PUBLIC_SPREADSHEET_ID'
})

const table = reader.base<{ name: string; age: string; city: string }>('Sheet1')
```

The `HolySheets.public()` factory returns a reader instance. Calling `.base<T>('SheetName')` sets the target sheet and returns a typed reader with only find methods.

---

## Available Methods

In public mode, only **read operations** are available:

| Method              | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `findMany`          | Returns all records matching the `where` clause.         |
| `findFirst`         | Returns the first matching record.                       |
| `findUnique`        | Returns the single matching record (throws if multiple). |
| `findLast`          | Returns the last matching record.                        |
| `findManyOrThrow`   | Like `findMany`, but throws if no records are found.     |
| `findFirstOrThrow`  | Like `findFirst`, but throws if no records are found.    |
| `findUniqueOrThrow` | Like `findUnique`, but throws if none or multiple.       |
| `findLastOrThrow`   | Like `findLast`, but throws if no records are found.     |

Write methods (`insert`, `update`, `delete`, `clear`) are **not present** on the public reader at the type level, so TypeScript will prevent you from calling them.

---

## Examples

### Finding Multiple Records

```Typescript
const results = await table.findMany({
  where: { city: { equals: 'NYC' } }
})
console.log(results)
// [{ name: 'John', age: '30', city: 'NYC' }, ...]
```

### Finding the First Record

```Typescript
const first = await table.findFirst({
  where: { name: { startsWith: 'A' } }
})
console.log(first)
// { name: 'Alice', age: '28', city: 'SF' }
```

### Using select to Limit Fields

```Typescript
const results = await table.findMany({
  where: { age: { gt: 25 } },
  select: ['name', 'city']
})
console.log(results)
// [{ name: 'John', city: 'NYC' }, { name: 'Alice', city: 'SF' }]
```

### Using omit to Exclude Fields

```Typescript
const results = await table.findFirst({
  omit: ['age']
})
console.log(results)
// { name: 'John', city: 'NYC' }
```

### Finding a Unique Record

```Typescript
const record = await table.findUnique({
  where: { name: { equals: 'Alice' } }
})
console.log(record)
// { name: 'Alice', age: '28', city: 'SF' }
```

> **Note**: `findUnique` throws a `MultipleRecordsFoundForUniqueError` if more than one record matches.

### Handling Missing Records

```Typescript
try {
  await table.findFirstOrThrow({
    where: { name: { equals: 'Nobody' } }
  })
} catch (error) {
  // RecordNotFoundError
  console.log('No record found')
}
```

---

## Using with Schema

You can define a schema for type coercion and validation, just like in authenticated mode:

```Typescript
import HolySheets, { DataTypes } from 'holysheets'

interface Product {
  name: string
  price: number
  active: boolean
}

const reader = HolySheets.public({ spreadsheetId: '...' })

const products = reader
  .base<Product>('Products')
  .defineSchema([
    { key: 'name', type: DataTypes.STRING },
    { key: 'price', type: DataTypes.NUMBER },
    { key: 'active', type: DataTypes.BOOLEAN }
  ])

const expensive = await products.findMany({
  where: { price: { gt: 100 } }
})
```

---

## Custom Header Row

If your headers are not on the first row, specify `headerRow`:

```Typescript
const table = reader.base<MyType>('Sheet1', { headerRow: 2 })
```

---

## Where Filters

Public mode supports the same `where` filters as authenticated mode. See the [Where Filters reference](/en/concepts/where-filters) for the full list of available operators (`equals`, `not`, `contains`, `startsWith`, `endsWith`, `gt`, `lt`, `in`, `notIn`, `search`, etc.).

---

## Comparison with Authenticated Mode

| Feature                       | Authenticated Mode | Public Mode |
| ----------------------------- | ------------------ | ----------- |
| Read operations (find)        | ✅                 | ✅          |
| Insert, update, delete, clear | ✅                 | ❌          |
| Requires auth credentials     | ✅                 | ❌          |
| Works with private sheets     | ✅                 | ❌          |
| Schema support                | ✅                 | ✅          |
| Where filters                 | ✅                 | ✅          |
| Select / Omit                 | ✅                 | ✅          |
| Server-side filtering         | ❌                 | ✅          |

> **Note**: In public mode, filtering happens server-side via the Google Visualization API, which can be more efficient for large sheets since only matching rows are transferred.

---

## API Reference

### `HolySheets.public(credentials)`

Creates a public reader instance.

| Parameter       | Type     | Description                              |
| --------------- | -------- | ---------------------------------------- |
| `spreadsheetId` | `string` | The ID of the public Google Spreadsheet. |

**Returns**: A public reader instance with `.base()` and `.defineSchema()` methods.

### `.base<RecordType>(sheetName, options?)`

Sets the target sheet.

| Parameter   | Type     | Default | Description                   |
| ----------- | -------- | ------- | ----------------------------- |
| `sheetName` | `string` | —       | The name of the sheet (tab).  |
| `headerRow` | `number` | `1`     | The row number of the header. |

**Returns**: A typed reader with find methods.
