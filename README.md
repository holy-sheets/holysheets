# HolySheets!

![Logo](docs/public/logo.svg)

`HolySheets!` is a TypeScript/Node.js library that simplifies interaction with the Google Sheets API, offering a Prisma-like syntax for querying and manipulating spreadsheet data. It abstracts away complexities like A1 ranges, headers extraction, and batch operations, letting you focus on your data and application logic.

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

## Authentication and Credentials

Before using HolySheets, you need Google credentials (Service Account or OAuth2) with access to your target spreadsheet. For guidance, check the [Getting Credentials](docs/getting-credentials.md) documentation.

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
