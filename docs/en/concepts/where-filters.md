# Where Filters

**Where filters** allow refining queries and retrieving specific subsets of data based on certain conditions. **HolySheets!** supports a variety of filters, enabling precise data manipulation and retrieval.

## Supported Where Filters Table

| **Filter Type** | **Description**                            | **Example Usage**                            |
| --------------- | ------------------------------------------ | -------------------------------------------- |
| `equals`        | Exact match                                | `{ status: { equals: 'active' } }`           |
| `not`           | Not equal                                  | `{ role: { not: 'admin' } }`                 |
| `in`            | Value is in a list of values               | `{ status: { in: ['pending', 'shipped'] } }` |
| `notIn`         | Value is not in a list of values           | `{ category: { notIn: ['Electronics'] } }`   |
| `lt`            | Less than a specified value                | `{ amount: { lt: 1000 } }`                   |
| `lte`           | Less than or equal to a specified value    | `{ attendees: { lte: 50 } }`                 |
| `gt`            | Greater than a specified value             | `{ experience: { gt: 5 } }`                  |
| `gte`           | Greater than or equal to a specified value | `{ budget: { gte: 50000 } }`                 |
| `contains`      | Contains a specified substring             | `{ title: { contains: 'HolySheets!' } }`     |
| `startsWith`    | Starts with a specified substring          | `{ username: { startsWith: 'admin' } }`      |
| `endsWith`      | Ends with a specified substring            | `{ email: { endsWith: '@example.com' } }`    |
| `search`        | Matches a regular expression pattern       | `{ name: { search: '^Pro.*' } }`             |

## equals

Filters records where the specified field exactly matches the provided value.

### Example

```Typescript
await users.findMany({
  where: {
    status: { equals: 'active' }
  }
});
```

### Explanation

Retrieves all users whose `status` field is exactly `'active'`.

### Output

```JavaScript
[
  { "User ID": 1, "Name": "Alice", "Status": "active" },
  { "User ID": 2, "Name": "Bob", "Status": "active" }
]
```

## not

Filters records where the specified field does not match the provided value.

### Example

```Typescript
await users.findMany({
  where: {
    role: { not: 'admin' }
  }
});
```

### Explanation

Retrieves all users whose `role` is not `'admin'`.

### Output

```JavaScript
[
  { "User ID": 3, "Name": "Charlie", "Role": "user" },
  { "User ID": 4, "Name": "Dave", "Role": "editor" }
]
```

## in

Filters records where the specified field's value is within a provided array of values.

### Example

```Typescript
await orders.findMany({
  where: {
    status: { in: ['pending', 'processing', 'shipped'] }
  }
});
```

### Explanation

Retrieves all orders with `status` equal to `'pending'`, `'processing'`, or `'shipped'`.

### Output

```JavaScript
[
  { "Order ID": 101, "Status": "pending", "Amount": 250 },
  { "Order ID": 102, "Status": "processing", "Amount": 450 },
  { "Order ID": 103, "Status": "shipped", "Amount": 300 }
]
```

## notIn

Filters records where the specified field's value is not within a provided array of values.

### Example

```Typescript
await products.findMany({
  where: {
    category: { notIn: ['Electronics', 'Furniture'] }
  }
});
```

### Explanation

Retrieves all products that are not in the categories `'Electronics'` or `'Furniture'`.

### Output

```JavaScript
[
  { "Product ID": 201, "Name": "T-Shirt", "Category": "Apparel" },
  { "Product ID": 202, "Name": "Coffee Mug", "Category": "Kitchenware" }
]
```

## lt (Less Than)

Filters records where the specified field's value is less than the provided value.

### Example

```Typescript
await sales.findMany({
  where: {
    amount: { lt: 1000 }
  }
});
```

### Explanation

Retrieves all sales transactions where the `amount` is less than `1000`.

### Output

```JavaScript
[
  { "Sale ID": 301, "Amount": 750, "Product": "Book" },
  { "Sale ID": 302, "Amount": 500, "Product": "Pen" }
]
```

## lte (Less Than or Equal To)

Filters records where the specified field's value is less than or equal to the provided value.

### Example

```Typescript
await events.findMany({
  where: {
    attendees: { lte: 50 }
  }
});
```

### Explanation

Retrieves all events with an `attendees` count less than or equal to `50`.

### Output

```JavaScript
[
  { "Event ID": 401, "Name": "Workshop", "Attendees": 30 },
  { "Event ID": 402, "Name": "Seminar", "Attendees": 50 }
]
```

## gt (Greater Than)

Filters records where the specified field's value is greater than the provided value.

### Example

```Typescript
await employees.findMany({
  where: {
    experience: { gt: 5 }
  }
});
```

### Explanation

Retrieves all employees with more than `5` years of experience.

### Output

```JavaScript
[
  { "Employee ID": 501, "Name": "Eve", "Experience": 6 },
  { "Employee ID": 502, "Name": "Frank", "Experience": 10 }
]
```

## gte (Greater Than or Equal To)

Filters records where the specified field's value is greater than or equal to the provided value.

### Example

```Typescript
await projects.findMany({
  where: {
    budget: { gte: 50000 }
  }
});
```

### Explanation

Retrieves all projects with a `budget` of at least `50,000`.

### Output

```JavaScript
[
  { "Project ID": 601, "Name": "Infrastructure Upgrade", "Budget": 75000 },
  { "Project ID": 602, "Name": "New Product Launch", "Budget": 50000 }
]
```

## contains

Filters records where the specified field's value contains the provided substring.

### Example

```Typescript
await articles.findMany({
  where: {
    title: { contains: 'HolySheets!' }
  }
});
```

### Explanation

Retrieves all articles whose `title` includes the substring `'HolySheets!'`.

### Output

```JavaScript
[
  { "Article ID": 701, "Title": "Getting Started with HolySheets!" },
  { "Article ID": 702, "Title": "Advanced HolySheets! Techniques" }
]
```

## startsWith

Filters records where the specified field's value starts with the provided substring.

### Example

```Typescript
await users.findMany({
  where: {
    username: { startsWith: 'admin' }
  }
});
```

### Explanation

Retrieves all users whose `username` starts with `'admin'`.

### Output

```JavaScript
[
  { "User ID": 801, "Username": "adminUser1" },
  { "User ID": 802, "Username": "adminUser2" }
]
```

## endsWith

Filters records where the specified field's value ends with the provided substring.

### Example

```Typescript
await users.findMany({
  where: {
    email: { endsWith: '@example.com' }
  }
});
```

### Explanation

Retrieves all users whose `email` ends with `'@example.com'`.

### Output

```JavaScript
[
  { "User ID": 901, "Email": "alice@example.com" },
  { "User ID": 902, "Email": "bob@example.com" }
]
```

## search

Filters records where the specified field's value matches a provided regular expression pattern, allowing more flexible and powerful searches.

### Example

```Typescript
await products.findMany({
  where: {
    name: { search: '^Pro.*' }
  }
});
```

### Explanation

Retrieves all products whose `name` starts with `'Pro'` (e.g., `'Projector'`, `'Processor'`).

### Output

```JavaScript
[
  { "Product ID": 1001, "Name": "Projector X" },
  { "Product ID": 1002, "Name": "Processor Pro" }
]
```

## Best Practices

- **Consistent Headers:** Ensure that the first row of your spreadsheet contains clear and consistent headers. HolySheets! relies on these headers to map the data correctly.
- **Data Types:** Maintain consistent data types within each column to avoid unexpected behavior during data operations.
- **Unique Identifiers:** Use unique identifiers (such as `Task ID`) for each row to simplify update and delete operations.
- **Organize Sheets:** Structure your spreadsheet logically, separating different types of data into distinct sheets (e.g., Tasks, Team Members, Projects).
