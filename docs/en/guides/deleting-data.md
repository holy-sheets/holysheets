# Deleting Data

## `deleteFirst` removes the first matching row:

```Typescript
await users.deleteFirst({ where: { email: 'alice@example.com' } })
```

## `deleteMany` removes all matching rows:

```Typescript
await users.deleteMany({ where: { status: 'inactive' } })
```
