# Advanced Queries

This guide explores more in-depth features and patterns when working with HolySheets!, including complex filtering, metadata handling, and batch updates.

---

## 1. Using Multiple Filters in `where` (Logical AND)

```typescript
await holySheetsInstance.base('Orders').findMany(
  {
    where: {
      status: { not: 'cancelled' },
      total: { gt: 100 }
    }
  },
  {
    includeMetadata: true
  }
)
```

**Explanation**:

- Both filters must be satisfied (logical AND).
- Fetches orders where `status` is NOT `'cancelled'` **and** `total` is greater than `100`.
- Includes metadata to inspect the affected ranges and operation duration.

---

## 2. Combining Filter Types

```typescript
await holySheetsInstance.base('Products').findMany({
  where: {
    category: { in: ['Electronics', 'Apparel'] },
    name: { startsWith: 'Pro' }
  }
})
```

**Explanation**:

- Filters the `Products` sheet for rows in the categories `'Electronics'` or `'Apparel'`, **and** names starting with `'Pro'`.

---

## 3. Performing Batch Updates with `updateMany`

```typescript
await holySheetsInstance.base('Users').updateMany({
  where: {
    status: 'active'
  },
  data: { status: 'inactive' }
})
```

**Explanation**:

- Finds all users where `status` equals `'active'`, then sets `status` to `'inactive'`.
- Be cautious: **all** matching rows will be updated.

---

## 4. Bulk Clearing with `clearMany`

```typescript
await holySheetsInstance.base('Logs').clearMany({
  where: {
    level: { in: ['debug', 'trace'] }
  }
})
```

**Explanation**:

- Clears all rows in the `Logs` sheet that have `level` `'debug'` or `'trace'`.
- Does not delete rows, only empties their contents.

---

## 5. Retrieving All Records with Metadata

```typescript
const allRecords = await holySheetsInstance.base('Inventory').findAll(
  {
    includeEmptyRows: true
  },
  {
    includeMetadata: true
  }
)
console.log(allRecords.metadata)
```

**Explanation**:

- Retrieves every row from the `Inventory` sheet, **including** empty rows.
- Returns metadata about the operation, such as execution time and affected ranges.

---

## 6. Advanced Error Handling

You can catch and log errors when an operation fails:

```typescript
try {
  await holySheetsInstance.base('Payments').deleteMany({
    where: { status: 'failed' }
  })
} catch (error) {
  console.error('Error deleting failed payments:', error)
}
```

**Explanation**:

- If the Sheets API call fails or no permission is granted, an error is thrown.
- Log or handle this error in your application logic.

---

## Tips for Scaling

1. **Use Metadata**: Inspect operation duration, record counts, and any errors for performance insights or auditing.
2. **Refine Filters**: Use multiple filters (`gt`, `lt`, `not`, etc.) to narrow down large data sets.
3. **Optimize Sheets**: Regularly review the size of your spreadsheets and consider splitting data into multiple tabs for better performance.

---

Check [Basic Queries](./basic-queries.md) if you need a refresher on the fundamentals.
