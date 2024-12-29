# Updating Data

HolySheets! provides a set of methods to help you update existing data in your Google Sheets. Whether you need to update a single record or multiple records at once, HolySheets! offers clear and concise methods to handle your update operations.

The primary methods for updating data are:

- `updateFirst`
- `updateMany`

Each method allows you to specify filters using the `where` clause and provide the fields to update in the `data` object.

## updateFirst

Updates the **first record** that matches the specified `where` conditions.

### Example

```Typescript
// Update the first record where name is 'Alice' and set status to 'inactive'
const result = await holySheetsInstance.updateFirst(
  {
    where: { name: 'Alice' },
    data: { status: 'inactive' }
  },
  {
    includeMetadata: true
  }
);
```

### Options

| Option  | Type                      | Default     | Description                                                      |
| ------- | ------------------------- | ----------- | ---------------------------------------------------------------- |
| `where` | `WhereClause<RecordType>` | `undefined` | Filters to apply when searching for the record to update.        |
| `data`  | `Partial<RecordType>`     | `undefined` | Key-value pairs representing the fields to update in the record. |

### Configs

| Config            | Type      | Default | Description                                             |
| ----------------- | --------- | ------- | ------------------------------------------------------- |
| `includeMetadata` | `boolean` | `false` | Determines whether to include metadata in the response. |

### Returns

A promise that resolves to a `SanitizedOperationResult<RecordType>` containing the updated record and optional metadata.

---

## updateMany

Updates **all records** that match the specified `where` conditions.

### Example

```Typescript
// Update all records where status is 'active' to 'inactive'
const results = await holySheetsInstance.updateMany(
  {
    where: { status: 'active' },
    data: { status: 'inactive' }
  },
  {
    includeMetadata: true
  }
);
```

### Options

| Option  | Type                      | Default     | Description                                                       |
| ------- | ------------------------- | ----------- | ----------------------------------------------------------------- |
| `where` | `WhereClause<RecordType>` | `undefined` | Filters to apply when searching for records to update.            |
| `data`  | `Partial<RecordType>`     | `undefined` | Key-value pairs representing the fields to update in each record. |

### Configs

| Config            | Type      | Default | Description                                             |
| ----------------- | --------- | ------- | ------------------------------------------------------- |
| `includeMetadata` | `boolean` | `false` | Determines whether to include metadata in the response. |

### Returns

A promise that resolves to a `SanitizedBatchOperationResult<RecordType>` containing all updated records and optional metadata.

---

## Understanding the Options and Configs

To effectively utilize HolySheets! updating methods, it's essential to understand the `options` and `configs` parameters that can be passed to each method.

### Options

- **`where`**: Defines the conditions to filter which record(s) should be updated. Accepts a `WhereClause<RecordType>` object.
- **`data`**: Specifies the new field values to set in the matched record(s). Accepts a `Partial<RecordType>` object containing key-value pairs of the fields to be updated.

### Configs

- **`includeMetadata`**: When set to `true`, the response will include metadata about the operation, such as duration, number of affected rows, and status.

---

## Version History

- **Version 2.0.0**: Introduced the `updateFirst` and `updateMany` methods for updating data.

---

## Additional Notes

- HolySheets! leverages the same `where` filters used in finding data, so you can refine which record(s) to update with great precision.
- When updating multiple records via `updateMany`, **all** records matching the `where` clause will be updated, so use the filter carefully to avoid unintended changes.
- Make sure your `data` object contains only the fields you intend to update. Fields not included in `data` remain unchanged.
