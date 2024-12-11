# Where Filters

Where filters allow you to refine queries. Examples include:

- `equals`, `not`
- `in`, `notIn`
- `lt`, `lte`, `gt`, `gte`
- `contains`, `startsWith`, `endsWith`, `search`

Example:

```Typescript
await users.findMany({
  where: {
    email: { endsWith: '@example.com' }
  }
})
```
