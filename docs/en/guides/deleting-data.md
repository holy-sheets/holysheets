**deleting-data.md**

# Deleting Data

HolySheets! provides methods to remove existing data from your Google Sheets. Depending on your needs, you can delete a single matching record or multiple matching records at once.

The primary methods for deleting data are:

- `deleteFirst`
- `deleteMany`

Each method allows you to specify filters using the `where` clause.

## deleteFirst

Deletes the **first record** that matches the specified `where` conditions.

### Example

```Typescript
// Delete the first record where name is 'Alice'
const result = await holySheetsInstance.deleteFirst(
  {
    where: { name: 'Alice' }
  },
  {
    includeMetadata: true
  }
);
```

### Options

| Option  | Type                      | Default     | Description                                               |
| ------- | ------------------------- | ----------- | --------------------------------------------------------- |
| `where` | `WhereClause<RecordType>` | `undefined` | Filters to apply when searching for the record to delete. |

### Configs

| Config            | Type      | Default | Description                                             |
| ----------------- | --------- | ------- | ------------------------------------------------------- |
| `includeMetadata` | `boolean` | `false` | Determines whether to include metadata in the response. |

### Returns

A promise that resolves to a `SanitizedOperationResult<RecordType>` containing the deleted record and optional metadata.

---

## deleteMany

Deletes **all records** that match the specified `where` conditions.

### Example

```Typescript
// Delete all records where status is 'inactive'
const results = await holySheetsInstance.deleteMany(
  {
    where: { status: 'inactive' }
  },
  {
    includeMetadata: true
  }
);
```

### Options

| Option  | Type                      | Default     | Description                                            |
| ------- | ------------------------- | ----------- | ------------------------------------------------------ |
| `where` | `WhereClause<RecordType>` | `undefined` | Filters to apply when searching for records to delete. |

### Configs

| Config            | Type      | Default | Description                                             |
| ----------------- | --------- | ------- | ------------------------------------------------------- |
| `includeMetadata` | `boolean` | `false` | Determines whether to include metadata in the response. |

### Returns

A promise that resolves to a `SanitizedBatchOperationResult<RecordType>` containing the deleted records and optional metadata.

---

## Understanding the Options and Configs

### Options

- **`where`**: Defines the conditions to filter which record(s) should be deleted. Accepts a `WhereClause<RecordType>` object.

### Configs

- **`includeMetadata`**: When set to `true`, the response will include metadata about the operation, such as duration and status.

---

## Version History

- **Version 2.0.0**: Introduced the `deleteFirst` and `deleteMany` methods for deleting data.

---

## Additional Notes

- Be cautious when using `deleteMany`, as **all** records matching the `where` clause will be deleted.
- Any records not matching the `where` clause remain untouched.

---
