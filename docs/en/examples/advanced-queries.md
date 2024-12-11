# Advanced Queries Example

```Typescript
// Find users with email ending in @example.com and age > 30
const results = await users.findMany({
  where: {
    email: { endsWith: '@example.com' },
    age: { gt: 30 }
  }
})

// Update multiple inactive users at once
await users.updateMany({
  where: { status: { equals: 'inactive' } },
  data: { status: 'active' }
})
```
