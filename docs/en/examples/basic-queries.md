# Basic Queries

This guide demonstrates how to perform the most common HolySheets! operations with minimal configuration.

---

## 1. Insert a Single Record

```typescript
await holySheetsInstance.base('Users').insert({
  data: [{ name: 'Alice', age: 30 }]
})
```

**Explanation**:

- Calls `base('Users')` to target the `Users` sheet.
- Inserts a single record with `name` and `age` fields.

---

## 2. Find the First Matching Record

```typescript
const alice = await holySheetsInstance.base('Users').findFirst({
  where: { name: 'Alice' }
})
console.log(alice.data)
```

**Explanation**:

- Retrieves the first row in the `Users` sheet where the `name` column equals `'Alice'`.

---

## 3. Update the First Matching Record

```typescript
await holySheetsInstance.base('Users').updateFirst({
  where: { name: 'Alice' },
  data: { age: 31 }
})
```

**Explanation**:

- Finds the first record matching `name === 'Alice'`.
- Updates her `age` to `31`.

---

## 4. Delete the First Matching Record

```typescript
await holySheetsInstance.base('Users').deleteFirst({
  where: { name: 'Alice' }
})
```

**Explanation**:

- Finds the first `Users` row where `name === 'Alice'` and deletes that row.

---

## 5. Clearing a Single Record

```typescript
await holySheetsInstance.base('Users').clearFirst({
  where: { name: 'Bob' }
})
```

**Explanation**:

- Clears all cell contents for the first row matching `name === 'Bob'`, but retains the empty row.

---

## Next Steps

Check out [Advanced Queries](./advanced-queries.md) for more filtering techniques, metadata usage, and bulk updates.
