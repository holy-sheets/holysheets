# Updating Data

## Use `updateFirst` to update the first match:

```Typescript
await users.updateFirst({ where: { name: 'Alice' }, data: { age: 31 } })
```

## Use `updateMany` to update all matches:

```Typescript
await users.updateMany({
  where: { status: 'active' },
  data: { status: 'inactive' }
})
```
