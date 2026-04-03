# HolySheets!

![Logo](docs/public/logo.svg)

`HolySheets!` is a TypeScript/Node.js library that simplifies interaction with the Google Sheets API, offering a Prisma-like syntax for querying and manipulating spreadsheet data. It abstracts away complexities like A1 ranges, headers extraction, and batch operations, letting you focus on your data and application logic.

[![codecov](https://codecov.io/github/holy-sheets/holysheets/branch/main/graph/badge.svg?token=DCG1F1XSVZ)](https://codecov.io/github/holy-sheets/holysheets)
[![npm version](https://img.shields.io/npm/v/holysheets.svg)](https://www.npmjs.com/package/holysheets)
[![License](https://img.shields.io/npm/l/holysheets.svg)](https://github.com/holy-sheets/holysheets/blob/main/LICENSE)
[![Build Status](https://github.com/holy-sheets/holysheets/actions/workflows/publish.yml/badge.svg)](https://github.com/holy-sheets/holysheets/actions/workflows/publish.yml)

## Key Features

- **No more manual A1 ranges:** The library manages Google Sheets ranges internally.
- **CRUD-like Operations:** Insert, find (single or multiple), update, clear, and delete records with ease.
- **Flexible Querying:** Use various filters (`equals`, `not`, `in`, `gt`, `contains`, etc.) for precise querying.
- **Metadata and Error Handling:** Optionally retrieve rich metadata about operations and handle errors gracefully.
- **Typed and IntelliSense-friendly:** Written in TypeScript, providing static typing and better developer experience.

## Installation

You can install `HolySheets!` using npm:

```bash
npm install holysheets
```

## CLI (Public Read)

HolySheets now includes a CLI focused on public read operations from Google Sheets.

You can run commands in both forms:

```bash
# implicit source (google-sheets is the default)
npx holysheets read find-many --sheet <sheet-name> --spreadsheet-id <ID>

# explicit source
npx holysheets google-sheets read find-many --sheet <sheet-name> --spreadsheet-id <ID>
```

### Supported Commands

```bash
holysheets read find-many
holysheets read find-first
holysheets read describe

holysheets google-sheets read find-many
holysheets google-sheets read find-first
holysheets google-sheets read describe
```

### Help

```bash
holysheets --help
holysheets read --help
holysheets read find-many --help
holysheets google-sheets read find-many --help
```

### Common Flags

```bash
--config <path>
--spreadsheet-id <id>
--sheet <name>
--header-row <number>
--skip-sheet-validation
--format <json|csv|ndjson>
--output <path>
--pretty
```

Config precedence:

- CLI flags override config file values.
- Config file values override internal defaults.

Example config file:

```json
{
  "defaults": {
    "spreadsheetId": "<ID>",
    "sheet": "<sheet-name>",
    "headerRow": 2,
    "skipSheetValidation": false
  }
}
```

`--skip-sheet-validation` is an escape hatch that disables pre-checking whether the sheet name exists in public metadata.  
It can reduce one network call, but it may allow silent fallback behavior from Google endpoints when the sheet name is invalid.

### Schema Input

You can provide schema in one (and only one) of these ways:

```bash
--schema-file <path>
--schema-json <json-string>
```

Or explicit repeatable flags:

```bash
--schema-field <name>
--schema-type <string|number|boolean|date>
--schema-nullable
--schema-alias <name>
```

Schema block grouping rule:

- Each `--schema-field` starts a new schema field definition.
- Following `--schema-type`, `--schema-nullable`, and `--schema-alias` apply to the latest field.

Example:

```bash
holysheets read find-many \
  --sheet <sheet-name> \
  --spreadsheet-id <ID> \
  --schema-field nome_estabelecimento --schema-type string \
  --schema-field rating --schema-type number \
  --schema-field visitado_em --schema-type date --schema-nullable
```

### Filters (`where`)

```bash
--where-field <field>
--where-op <equals|not|in|notIn|lt|lte|gt|gte|contains|startsWith|endsWith|search>
--where-value <value>
```

Filter block grouping rule:

- Each `--where-field` starts a new filter block.
- Following `--where-op` and `--where-value` apply to the latest field.
- Multiple blocks are combined with `AND`.

Example:

```bash
holysheets read find-many \
  --sheet <sheet-name> \
  --spreadsheet-id <ID> \
  --where-field rating --where-op gte --where-value 4 \
  --where-field nome_estabelecimento --where-op contains --where-value bar
```

### Select

`--select` is repeatable:

```bash
holysheets read find-many \
  --sheet <sheet-name> \
  --spreadsheet-id <ID> \
  --select nome_estabelecimento \
  --select rating
```

### Omit

`--omit` is repeatable:

```bash
holysheets read find-many \
  --sheet <sheet-name> \
  --spreadsheet-id <ID> \
  --omit instagram \
  --omit endereco
```

`--select` and `--omit` cannot be used together in the same command.

### Output and Formats

- `--format` controls serialization.
- `--output` controls destination.
- Without `--output`, data is printed to stdout.
- With `--output`, data is written to file.

Output behavior:

- `find-many`: `json`, `csv`, `ndjson`
- `find-first`: `json`, `ndjson`
- `describe`: `json`, `ndjson`

`csv` is intentionally supported only for `find-many` in this version.

Examples:

```bash
holysheets read find-many --sheet <sheet-name> --spreadsheet-id <ID> --format json --output ./out/data.json
holysheets read find-many --sheet <sheet-name> --spreadsheet-id <ID> --format csv --output ./out/data.csv
```

### Describe Behavior

`read describe` is metadata-focused and does not return data rows.
It does not accept `--where-*`, `--select`, or `--omit`.

It returns:

- source
- spreadsheetId
- sheet
- headerRow
- detected columns (`index` + `name`)
- resolved schema (when provided)

Example:

```bash
holysheets read describe --sheet <sheet-name> --spreadsheet-id <ID> --header-row 2
```

Typical JSON output:

```json
{
  "source": "google-sheets",
  "spreadsheetId": "<ID>",
  "sheet": "<sheet-name>",
  "headerRow": 2,
  "columns": [
    { "index": 0, "name": "nome_estabelecimento" },
    { "index": 1, "name": "rating" }
  ],
  "schema": []
}
```

## Authentication and Credentials

Before using HolySheets!, you need Google credentials (Service Account or OAuth2) with access to your target spreadsheet. For guidance, check the [Getting Credentials](docs/getting-credentials.md) documentation.

## Quickstart Example

```typescript
import HolySheets from 'holysheets'

interface User {
  name: string
  email: string
  age: number
}

const holySheets = new HolySheets({
  spreadsheetId: 'YOUR_SPREADSHEET_ID',
  auth: yourAuthClient // e.g. a JWT or OAuth2 client
})

// Select the target sheet for operations
const users = holySheets.base<User>('Users')

// Find multiple users named 'Joe'
const result = await users.findMany({
  where: {
    name: {
      contains: 'Joe'
    }
  }
})

console.log(result.data)
```

## API Overview

All operations support an optional `OperationConfigs` parameter, currently allowing `includeMetadata: boolean`. When `includeMetadata` is `true`, the result includes operation metadata (such as operationId, duration, status, and affected ranges).

Example:

```typescript
const result = await users.findFirst(
  {
    where: { email: 'john@example.com' }
  },
  {
    includeMetadata: true
  }
)

console.log(result.data) // The record data
console.log(result.metadata) // Additional metadata about the operation
```

### Base Method

```typescript
const users = holySheets.base<User>('Users')
```

Select the sheet to operate on. Once selected, you can chain operations like `findFirst`, `findMany`, etc.

### getSheetId

Retrieve the numeric Sheet ID of a given sheet title:

```typescript
const sheetIdResult = await holySheets.getSheetId('Users', {
  includeMetadata: true
})
if (sheetIdResult.metadata?.status === 'success') {
  console.log('Sheet ID:', sheetIdResult.data)
}
```

### insert

Insert multiple records at the end of the sheet:

```typescript
await users.insert(
  {
    data: [
      { name: 'Alice', email: 'alice@wonderland.com', age: 25 },
      { name: 'Bob', email: 'bob@example.com', age: 30 }
    ]
  },
  { includeMetadata: true }
)
```

### findFirst

Retrieve the first matching record:

```typescript
const user = await users.findFirst(
  {
    where: {
      email: 'john.doe@example.com'
    }
  },
  { includeMetadata: true }
)

console.log(user.data)
```

### findMany

Retrieve all matching records:

```typescript
const activeUsers = await users.findMany(
  {
    where: {
      status: 'active'
    }
  },
  { includeMetadata: true }
)

console.log(activeUsers.data)
```

### updateFirst

Update the first matching record:

```typescript
const updatedUser = await users.updateFirst(
  {
    where: { name: { equals: 'Alice' } },
    data: { age: 26 }
  },
  { includeMetadata: true }
)

console.log(updatedUser.data)
```

### updateMany

Update all matching records:

```typescript
const updatedUsers = await users.updateMany(
  {
    where: { status: 'active' },
    data: { status: 'inactive' }
  },
  { includeMetadata: true }
)

console.log(updatedUsers.data)
```

### clearFirst

Clear values (set them empty) in the first matching row:

```typescript
const clearedUser = await users.clearFirst(
  {
    where: { name: 'Bob' }
  },
  { includeMetadata: true }
)

console.log(clearedUser.data)
```

### clearMany

Clear values in all matching rows:

```typescript
const clearedUsers = await users.clearMany(
  {
    where: { age: { lt: 25 } }
  },
  { includeMetadata: true }
)

console.log(clearedUsers.data)
```

### deleteFirst

Delete the first matching row:

```typescript
const deletedUser = await users.deleteFirst(
  {
    where: { email: 'alice@wonderland.com' }
  },
  { includeMetadata: true }
)

console.log(deletedUser.data)
```

### deleteMany

Delete all matching rows:

```typescript
const deletedUsers = await users.deleteMany(
  {
    where: { status: { equals: 'inactive' } }
  },
  { includeMetadata: true }
)

console.log(deletedUsers.data)
```

## Filters and Conditions

The `where` clause accepts filters like `equals`, `not`, `in`, `notIn`, `lt`, `lte`, `gt`, `gte`, `contains`, `search`, `startsWith`, and `endsWith`.

Examples:

```typescript
// Find users with age greater than 30
await users.findMany({ where: { age: { gt: 30 } } })

// Find users whose name starts with 'Jo'
await users.findMany({ where: { name: { startsWith: 'Jo' } } })
```

## Metadata and Error Handling

By specifying `{ includeMetadata: true }` in configs, you receive metadata detailing:

- `operationType` (e.g., 'insert', 'find', 'update', etc.)
- `status` ('success' or 'failure')
- `recordsAffected`
- `ranges` involved
- `error` message if any
- `duration`
- `operationId`

If `includeMetadata` is not set or `false`, only `data` is returned.

## License

`HolySheets!` is licensed under the [MIT License](LICENSE).

## Note

While `HolySheets!` provides a simplified interface for managing Google Sheets data, it is not intended to replace a dedicated database system. Please consider whether a fully-fledged database or other storage solution is more appropriate for your project’s needs.
