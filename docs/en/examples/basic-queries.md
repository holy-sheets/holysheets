# Basic Queries Example

```Typescript
const users = sheets.base<{ name: string; email: string }>('Users')

// Insert a user
await users.insert({ data: [{ name: 'Diana', email: 'diana@example.com' }] })

// Find a user by exact name
const diana = await users.findFirst({ where: { name: { equals: 'Diana' } } })
console.log(diana.data)
```
