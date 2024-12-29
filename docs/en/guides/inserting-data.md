# Inserting Data

HolySheets! provides a convenient method to insert new data into your Google Sheets. Whether you need to insert a single record or multiple records, HolySheets! makes the process straightforward.

The primary method for inserting data is:

- `insert`

This method allows you to specify the data you want to insert as an array of records.

## insert

Inserts one or more records into the Google Sheet.

### Example

```typescript
// Insert two new user records
const result = await holySheetsInstance.insert(
  {
    data: [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 }
    ]
  },
  {
    includeMetadata: true
  }
)
```

### Options

| Option | Type           | Default     | Description                                                                                        |
| ------ | -------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `data` | `RecordType[]` | `undefined` | An array of records to be inserted into the sheet. Each object key corresponds to a column header. |

### Configs

| Config            | Type      | Default | Description                                             |
| ----------------- | --------- | ------- | ------------------------------------------------------- |
| `includeMetadata` | `boolean` | `false` | Determines whether to include metadata in the response. |

### Returns

A promise that resolves to a `SanitizedOperationResult<RecordType[]>` containing the inserted records and optional metadata.

---

## Understanding the Options and Configs

To effectively utilize HolySheets! insertion methods, it's essential to understand the `options` and `configs` parameters that can be passed.

### Options

- **`data`**: An array of records to insert. Each record’s keys should match the header names in your sheet.

### Configs

- **`includeMetadata`**: When set to `true`, the response will include metadata about the operation, such as the duration and status of the insert.

---

## Additional Notes

- Ensure that the keys in your `data` objects match the column headers in your sheet to avoid misalignment.
- Each new record will be appended after the last row currently in the sheet.
- If you need to insert rows at a specific position, consider alternative methods or reordering your data after insertion.
