# Types

Below is a quick-reference table for the most common **HolySheets!** types, followed by detailed explanations.

| **Type**                           | **Description**                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `CellValue`                        | Allowed cell data types (string, number, boolean, null).                       |
| `RecordType`                       | Represents a single row of data (keys = column headers).                       |
| `WhereClause<RecordType>`          | Defines conditions for filtering rows (keys = columns; values = filters).      |
| `SelectClause<RecordType>`         | Determines which columns to return (`true` to include, `false` to omit).       |
| `OperationConfigs`                 | Configurations for including metadata and other optional features.             |
| `OperationMetadata`                | Contains details about a completed operation (e.g., duration, status, errors). |
| `OperationResult<RecordType>`      | Return type for single-record operations (e.g., `findFirst`).                  |
| `BatchOperationResult<RecordType>` | Return type for multi-record operations (e.g., `findMany`).                    |

---

## `CellValue`

Represents the type of data allowed in a single cell. By default, **HolySheets!** supports strings, numbers, booleans, and null values.

```ts
export type CellValue = string | number | boolean | null
```

---

## `RecordType`

A generic type representing a single record (row) in the sheet. Each key corresponds to a column header, and each value must be a valid `CellValue`.

```ts
type RecordType = Record<string, CellValue>
```

> **Note**: When you instantiate **HolySheets!**, you can pass your own custom interface (instead of a plain record) if you want strongly typed columns.

---

## `WhereClause<RecordType>`

Defines conditions for filtering rows. Each key must match a column name in `RecordType`, and the value can be either:

- A simple string (e.g., `'Alice'` for an equals check), or
- An object specifying one or more filters (e.g., `{ not: 'Bob', startsWith: 'A' }`).

```ts
export type WhereClause<RecordType> = {
  [column in keyof RecordType]?: string | WhereCondition
}
```

Where `WhereCondition` includes supported filters like `equals`, `lt`, `gt`, `contains`, etc.

---

## `SelectClause<RecordType>`

Specifies which columns to include in the result. Each key corresponds to a column in `RecordType`, and the value is a boolean indicating whether to include that column.

```ts
export type SelectClause<RecordType> = Partial<{
  [column in keyof RecordType]: boolean
}>
```

Example usage:

```ts
select: { name: true, age: true, status: false }
```

This includes only `name` and `age` columns in the returned data, excluding `status`.

---

## `OperationConfigs`

Allows you to configure additional behaviors for each operation. Currently, the most common config is:

- **`includeMetadata`** (boolean): When `true`, the operation returns extra metadata (e.g., duration, affected rows).

```ts
export type OperationConfigs = {
  includeMetadata: boolean
}
```

Usage example:

```ts
await holySheetsInstance.findMany(
  { where: { status: 'active' } },
  { includeMetadata: true }
)
```

---

## `OperationMetadata`

When `includeMetadata` is `true` in an operation, **HolySheets!** returns an `OperationMetadata` object detailing the results. This can include information such as the duration of the operation, number of records affected, and any errors.

### Interface

```ts
export interface OperationMetadata {
  operationId: string
  timestamp: string // e.g. "2024-01-01T12:00:00.000Z"
  duration: string // e.g. "50ms"
  recordsAffected: number // how many rows were inserted/updated/etc.
  status: 'success' | 'failure'
  operationType: OperationType // e.g. 'insert', 'update', 'delete', 'find', 'clear'
  spreadsheetId: string
  sheetId: string // the name of the sheet
  ranges: string[] // Affected ranges, if any
  error?: string // error message if status = 'failure'
  userId?: string // optional user ID or similar, if available
}
```

### Key Fields

| **Field**         | **Type**                      | **Description**                                                            |
| ----------------- | ----------------------------- | -------------------------------------------------------------------------- |
| `operationId`     | `string`                      | A unique identifier for the operation.                                     |
| `timestamp`       | `string`                      | ISO-formatted date/time string when the operation occurred.                |
| `duration`        | `string`                      | How long the operation took to complete, e.g., `"50ms"`.                   |
| `recordsAffected` | `number`                      | How many records were inserted, updated, or deleted.                       |
| `status`          | `'success'      \| 'failure'` | Whether the operation succeeded or failed.                                 |
| `operationType`   | `OperationType`               | The type of operation performed, e.g., `'insert'`, `'update'`, `'delete'`. |
| `spreadsheetId`   | `string`                      | The Google Sheets spreadsheet ID.                                          |
| `sheetId`         | `string`                      | The name of the specific sheet targeted by this operation.                 |
| `ranges`          | `string[]`                    | An array of ranges that were affected or checked during the operation.     |
| `error`           | `string?`                     | An error message if the operation failed.                                  |
| `userId`          | `string?`                     | An optional user identifier for audit or logging purposes.                 |

---

## `OperationResult<RecordType>`

Represents the result of a **single-record operation** (like `findFirst`, `updateFirst`, `deleteFirst`, etc.). It includes:

- **`data`**: The returned record (or `undefined` if none found).
- **`metadata`**: Optional metadata (if `includeMetadata` was `true`).

```ts
export interface OperationResult<RecordType> {
  data: T | undefined
  metadata?: OperationMetadata
}
```

---

## `BatchOperationResult<RecordType>`

Represents the result of a **multi-record operation** (like `findMany`, `updateMany`, `deleteMany`, etc.). It includes:

- **`data`**: An array of records (or `undefined` if none found).
- **`metadata`**: Optional metadata (if `includeMetadata` was `true`).

```ts
export interface BatchOperationResult<RecordType> {
  data: T[] | undefined
  metadata?: OperationMetadata
}
```

---

## Additional Notes

- **Strongly Typed Columns**: You can replace `RecordType` with your own interface or type if your columns are well-defined. For example:

```ts
interface UserRecord {
  id: number
  name: string
  email: string
  isActive: boolean
}

// Then use it with HolySheets:
const sheets = new Holysheets({
  spreadsheetId: 'your-spreadsheet-id',
  auth: yourAuthInstance // OAuth2 or JWT instance
})

// Select the 'Users' sheet
const usersBase = sheets.base<UserRecord>('Users')
```

- **Flexible Filtering**: `WhereClause<RecordType>` offers powerful filtering via filter objects (e.g., `{ equals: 'Alice', startsWith: 'Al' }`), which are combined with AND logic if multiple filters exist on the same field.

- **Metadata**: Set `{ includeMetadata: true }` in `OperationConfigs` to receive additional details about your operation. The returned `OperationMetadata` object can help with logging, auditing, or performance monitoring.

```

```
