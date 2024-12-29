# Data Operations

HolySheets! provides a set of CRUD-like operations to interact with your Google Sheets data:

- **Finding Data**

  - [`findFirst`](/en/guides/finding-data.md#findfirst): Retrieves the first matching record.
  - [`findMany`](/en/guides/finding-data.md#findmany): Retrieves multiple matching records.
  - [`findAll`](/en/guides/finding-data.md#findall): Retrieves all records.

- **Inserting Data**

  - [`insert`](/en/guides/inserting-data.md): Inserts new records.

- **Updating Data**

  - [`updateFirst`](/en/guides/updating-data.md#updatefirst): Updates the first matching record.
  - [`updateMany`](/en/guides/updating-data.md#updatemany): Updates all matching records.

- **Deleting Data**

  - [`deleteFirst`](/en/guides/deleting-data.md#deletefirst): Deletes the first matching record.
  - [`deleteMany`](/en/guides/deleting-data.md#deletemany): Deletes all matching records.

- **Clearing Data**
  - [`clearFirst`](/en/guides/clearing-data.md#clearfirst): Clears the first matching record’s cell contents (row not removed).
  - [`clearMany`](/en/guides/clearing-data.md#clearmany): Clears all matching records’ cell contents (rows not removed).

All operations can optionally return metadata such as affected ranges and operation duration. To include metadata in your responses, pass `{ includeMetadata: true }` in the second parameter of any operation method.

```typescript
// Example: Finding the first record named "Alice" and including metadata
const result = await holySheetsInstance.findFirst(
  {
    where: { name: 'Alice' }
  },
  {
    includeMetadata: true
  }
)

console.log(result.data) // The matching record
console.log(result.metadata) // Optional metadata (if requested)
```
