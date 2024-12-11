# Finding Data

## `findFirst` returns the first record that matches the `where` filters:

```Typescript
const user = await users.findFirst({ where: { name: 'Alice' } })
console.log(user.data)
```

## `findMany` returns all matching records:

```Typescript
const activeUsers = await users.findMany({
  where: { status: { equals: 'active' } }
})
console.log(activeUsers.data)
```
