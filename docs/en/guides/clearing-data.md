# Clearing Data

HolySheets! offers methods to clear data from specific rows in your Google Sheets. Clearing data removes the contents of the cells without deleting the rows themselves.

The primary methods for clearing data are:

- `clearFirst`
- `clearMany`

Each method allows you to specify filters using the `where` clause.

## clearFirst

Clears the **first record** that matches the specified `where` conditions.

### Example

```Typescript
// Clear the first record where name is 'Alice'
const result = await holySheetsInstance.clearFirst(
  {
    where: { name: 'Alice' }
  },
  {
    includeMetadata: true
  }
);
```

### Options

| Option  | Type                      | Default     | Description                                              |
| ------- | ------------------------- | ----------- | -------------------------------------------------------- |
| `where` | `WhereClause<RecordType>` | `undefined` | Filters to apply when searching for the record to clear. |

### Configs

| Config            | Type      | Default | Description                                             |
| ----------------- | --------- | ------- | ------------------------------------------------------- |
| `includeMetadata` | `boolean` | `false` | Determines whether to include metadata in the response. |

### Returns

A promise that resolves to a `SanitizedOperationResult<RecordType>` containing the cleared record and optional metadata.

---

## clearMany

Clears **all records** that match the specified `where` conditions.

### Example

```Typescript
// Clear all records where status is 'temporary'
const results = await holySheetsInstance.clearMany(
  {
    where: { status: 'temporary' }
  },
  {
    includeMetadata: true
  }
);
```

### Options

| Option  | Type                      | Default     | Description                                           |
| ------- | ------------------------- | ----------- | ----------------------------------------------------- |
| `where` | `WhereClause<RecordType>` | `undefined` | Filters to apply when searching for records to clear. |

### Configs

| Config            | Type      | Default | Description                                             |
| ----------------- | --------- | ------- | ------------------------------------------------------- |
| `includeMetadata` | `boolean` | `false` | Determines whether to include metadata in the response. |

### Returns

A promise that resolves to a `SanitizedBatchOperationResult<RecordType>` containing the cleared records and optional metadata.

---

## Understanding the Options and Configs

### Options

- **`where`**: Defines the conditions to filter which record(s) should be cleared. Accepts a `WhereClause<RecordType>` object.

### Configs

- **`includeMetadata`**: When set to `true`, the response will include metadata about the operation, such as duration and status.

---

## Version History

- **Version 2.0.0**: Introduced the `clearFirst` and `clearMany` methods for clearing data.

---

## Additional Notes

- Clearing data **removes cell contents** but leaves rows intact.
- Use `clearMany` with caution, as **all** records matching the `where` clause will be cleared.
- For physically removing the rows themselves, consider using the delete methods instead.
