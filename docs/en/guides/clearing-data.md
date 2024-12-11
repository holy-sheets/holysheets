# Clearing Data

## `clearFirst` clears cells in the first matching row without deleting it:

```Typescript
await users.clearFirst({ where: { name: 'Charlie' } })
```

## `clearMany` clears cells in all matching rows:

```Typescript
await users.clearMany({ where: { age: { lt: 25 } } })
```
