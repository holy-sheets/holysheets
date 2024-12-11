# Inserting Data

Use `insert` to add new rows:

```Typescript
await users.insert({
  data: [
    { name: 'Bob', email: 'bob@example.com' },
    { name: 'Charlie', email: 'charlie@example.com' }
  ]
})
```

This appends data at the end of the sheet. Include metadata to get operation details:

```Typescript
const result = await users.insert({ data: [...] }, { includeMetadata: true })
console.log(result.metadata)
```
