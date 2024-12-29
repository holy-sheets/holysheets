# Querying Data

HolySheets provides a suite of methods to efficiently query data from your Google Sheets. Whether you need to retrieve a single record, multiple records, or all records, HolySheets offers flexible options to tailor your queries to your specific needs.

The primary methods for querying data are:

- `findFirst`
- `findMany`
- `findAll`

Each method allows you to specify filters using the `where` clause and limit the fields returned using the `select` clause.

## findFirst

Retrieves the first record that matches the specified `where` conditions.

### Example

```Typescript
// Retrieve the first record where name is 'Alice'
const result = await holySheetsInstance.findFirst({
  where: { name: 'Alice' },
  select: { id: true, email: true }
}, {
  includeMetadata: true
});
```

### Options

| Option   | Type           | Default      | Description                                               |
| -------- | -------------- | ------------ | --------------------------------------------------------- |
| `where`  | `WhereClause`  | `undefined`  | Filters to apply when searching for records.              |
| `select` | `SelectClause` | `All Fields` | Specifies which fields to include in the returned record. |

### Configs

| Config            | Type      | Default | Description                                             |
| ----------------- | --------- | ------- | ------------------------------------------------------- |
| `includeMetadata` | `boolean` | `false` | Determines whether to include metadata in the response. |

### Returns

A promise that resolves to a `SanitizedOperationResult` containing the first matching record and optional metadata.

## findMany

Retrieves multiple records that match the specified `where` conditions.

### Example

```Typescript
// Retrieve all records where age is greater than 18
const results = await holySheetsInstance.findMany({
  where: { age: { gt: 18 } },
  select: { name: true, email: true }
}, {
  includeMetadata: true
});
```

### Options

| Option   | Type           | Default      | Description                                               |
| -------- | -------------- | ------------ | --------------------------------------------------------- |
| `where`  | `WhereClause`  | `undefined`  | Filters to apply when searching for records.              |
| `select` | `SelectClause` | `All Fields` | Specifies which fields to include in the returned record. |

### Configs

| Config            | Type      | Default | Description                                             |
| ----------------- | --------- | ------- | ------------------------------------------------------- |
| `includeMetadata` | `boolean` | `false` | Determines whether to include metadata in the response. |

### Returns

A promise that resolves to a `SanitizedBatchOperationResult` containing the matching records and optional metadata.

## findAll

**(Added in version 2.1.0)**

Retrieves all records from the specified sheet, with optional selection of fields and inclusion of empty rows.

### Example

```Typescript
// Retrieve all records, including empty rows
const allRecords = await holySheetsInstance.findAll({
  includeEmptyRows: true
}, {
  includeMetadata: true
});
```

### Options

| Option             | Type           | Default      | Description                                                |
| ------------------ | -------------- | ------------ | ---------------------------------------------------------- |
| `select`           | `SelectClause` | `All Fields` | Specifies which fields to include in the returned records. |
| `includeEmptyRows` | `boolean`      | `false`      | Determines whether to include empty rows in the response.  |

### Configs

| Config            | Type      | Default | Description                                             |
| ----------------- | --------- | ------- | ------------------------------------------------------- |
| `includeMetadata` | `boolean` | `false` | Determines whether to include metadata in the response. |

### Returns

A promise that resolves to a `SanitizedBatchOperationResult` containing all records and optional metadata.

---

## Understanding the Options and Configs

To effectively utilize HolySheets! querying methods, it's essential to understand the `options` and `configs` parameters that can be passed to each method.

### Options

The `options` parameter allows you to customize the data retrieval process. Common options include:

- **`where`**: Defines the conditions to filter records. It accepts a `WhereClause` object.
- **`select`**: Specifies which fields to include in the returned records. It accepts a `SelectClause` object.
- **`includeEmptyRows`**: Determines whether to include empty rows in the response. Available in `findAll` only.

### Configs

The `configs` parameter allows you to configure operational aspects of the data retrieval process. Common configs include:

- **`includeMetadata`**: When set to `true`, the response will include metadata about the operation, such as duration and status.

---

## Version History

- **Version 2.1.0**: Introduced the `findAll` method for retrieving all records with additional options.

---

## Additional Notes

HolySheets leverages `where` filters to enable powerful and flexible querying capabilities. These filters allow you to define precise conditions for selecting records, ensuring that your data retrieval is both efficient and tailored to your specific requirements.
