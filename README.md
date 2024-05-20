# HolySheets!

![Logo](docs/logo.svg)

`HolySheets!` is a TypeScript library that simplifies the process of interacting with the Google Sheets API. It offers a set of tools for reading and writing data to and from Google Sheets, with a Prisma-like syntax.

## Advantages

- **No more memorizing range codes**: With `HolySheets!`, you don't need to remember complex range codes. The library handles all the range-related operations for you, allowing you to focus on your data.

## Features

- Easy-to-use API for interacting with Google Sheets.
- Supports reading and writing data.
- Supports authentication with the Google Sheets API.
- TypeScript support: Enhances development with static typing and intellisense.

## Installation

You can install `HolySheets!` using npm:

```bash
npm install holysheets
```

## Usage 

To use `HolySheets!` in your TypeScript project, you need to import it and initialize it with your Google Sheets credentials. Here's an example:

```typescript
  interface User {
    name: string
    email: string
    age: number
  }

  const hollySheets = new HolySheets({
    spreadsheetId: 'spreadsheet-id',
    privateKey: credentials.private_key, // Your credentials
    clientEmail: credentials.client_email // Your client email
  })  

  const user = holySheets.base<User>('Users')

  await user.findMany({
    where: {
      name: {
        contains: 'Joe'
      }
    }
  })  
  /// Find all users named Joe in Users sheet
```

:warning: Before using HolySheets, it's important to have Google credentials for your project. For more information on how to obtain these, please refer to the [Getting Credentials](docs/getting-credentials.md) guide.


## API documentation

### base

The `base` method is used to set the sheet that is going to be used.

```typescript
const baseConfig = base('Users');
```

You can also use your own type definition to have access to typescript static typing checking, for instance:

```typescript
interface User {
 name: string
 email: string
 age: number
}
const baseConfig = base<User>('Users');
/// Now you should only be able to add where clauses based on User interface keys
```

### findFirst

Retrieves the first row that matches the given filter criteria.

#### Parameters

- `filter`: An object specifying the filter criteria. Each key corresponds to a column name and each value specifies the condition to be met.

#### Example

```typescript
const user = await userSheet.findFirst({
  where: {
    email: 'john.doe@example.com'
  }
});
console.log(user);
// Output: { range: 'Users!A2:D2', row: 2, fields: { id: 1, name: 'John Doe', email: 'john.doe@example.com', points: 1200 } }
```


### findMany

Retrieves all rows that match the given filter criteria.

#### Parameters

- `filter`: An object specifying the filter criteria. Each key corresponds to a column name and each value specifies the condition to be met.

#### Example

```typescript
const users = await userSheet.findMany({
  where: {
    points: {
      greaterThan: 1000
    }
  }
});
console.log(users);
// Output: [
//   { range: 'Users!A2:D2', row: 2, fields: { id: 1, name: 'John Doe', points: 1050 } },
//   { range: 'Users!A3:D3', row: 3, fields: { id: 2, name: 'Jane Smith', points: 1100 } }
// ]
```

### updateFirst

Updates the first row that matches the given filter criteria with the specified new data.

#### Parameters

- `filter`: An object specifying the filter criteria. Each key corresponds to a column name and each value specifies the condition to be met.
- `data`: An object specifying the new data to update the matching row with.

#### Example

Before update:
```typescript
// Assuming the sheet has the following data:
// | id | name    | points |
// |----|---------|--------|
// | 1  | John    | 950    |
// | 2  | Jane    | 1050   |
// | 3  | Maria   | 1100   |

const updatedUser = await userSheet.updateFirst(
  { where: { name: { contains: 'Jane' } } },
  { data: { points: 1150 } }
);
console.log(updatedUser);
// Output: { range: 'Users!A3:D3', row: 3, fields: { id: 2, name: 'Jane', points: 1150 } }
```

// The sheet now has the following data:
// | id | name    | points |
// |----|---------|--------|
// | 1  | John    | 950    |
// | 2  | Jane    | 1150   |
// | 3  | Maria   | 1100   |

### updateMany
Updates all rows that match the given filter criteria with the specified new data.

#### Parameters
- `filter`: An object specifying the filter criteria. Each key corresponds to a column name and each value specifies the condition to be met.
- `data`: An object specifying the new data to update the matching rows with.

#### Example

```typescript
// Assuming the sheet has the following data:
// | id | name    | points |
// |----|---------|--------|
// | 1  | John    | 950    |
// | 2  | Jane    | 1050   |
// | 3  | Maria   | 1100   |

const updatedUsers = await userSheet.updateMany(
  { where: { points: { greaterThan: 1000 } } },
  { data: { points: 1200 } }
);
console.log(updatedUsers);
// Output: [
//   { range: 'Users!A2:D2', row: 2, fields: { id: 2, name: 'Jane', points: 1200 } },
//   { range: 'Users!A3:D3', row: 3, fields: { id: 3, name: 'Maria', points: 1200 } }
// ]

// The sheet now has the following data:
// | id | name    | points |
// |----|---------|--------|
// | 1  | John    | 950    |
// | 2  | Jane    | 1200   |
// | 3  | Maria   | 1200   |
```


### clearFirst

Clears the data in the first row that matches the given filter criteria.

#### Parameters
- `filter`: An object specifying the filter criteria. Each key corresponds to a column name and each value specifies the condition to be met.

#### Example

```typescript
const clearedUser = await userSheet.clearFirst({
  where: {
    name: 'John Doe'
  }
});
console.log(clearedUser);
// Output: { range: 'Users!A2:D2', row: 2, fields: { id: 1, name: '', email: '', points: '' } }
```

### clearMany

Clears the data in all rows that match the given filter criteria.

#### Parameters

- `filter`: An object specifying the filter criteria. Each key corresponds to a column name and each value specifies the condition to be met.

```typescript
const clearedUsers = await userSheet.clearMany({
  where: {
    points: {
      lessThan: 1000
    }
  }
});
console.log(clearedUsers);
// Output: [
//   { range: 'Users!A2:D2', row: 2, fields: { id: 1, name: '', points: '' } }
// ]

// The sheet now has the following data:
// | id | name    | points |
// |----|---------|--------|
// | 1  |         |        |
// | 2  | Jane    | 1050   |
// | 3  | Maria   | 1100   |
```

### deleteFirst

Deletes the first row that matches the given filter criteria.

#### Parameters

- `filter`: An object specifying the filter criteria. Each key corresponds to a column name and each value specifies the condition to be met.

#### Examples

```typescript
const deletedUser = await userSheet.deleteFirst({
  where: {
    email: 'john.doe@example.com'
  }
});
console.log(deletedUser);
// Output: { range: 'Users!A2:D2', row: 2, fields: { id: 1, name: 'John Doe', email: 'john.doe@example.com', points: 1200 } }
```

### deleteMany

Deletes all rows that match the given filter criteria.

#### Parameters

- `filter`: An object specifying the filter criteria. Each key corresponds to a column name and each value specifies the condition to be met.

#### Example

```typescript
const deletedUsers = await userSheet.deleteMany({
  where: {
    points: {
      lessThan: 1000
    }
  }
});
console.log(deletedUsers);
// Output: [
//   { range: 'Users!A2:D2', row: 2, fields: { id: 1, name: 'John', points: 950 } }
// ]

// The sheet now has the following data:
// | id | name    | points |
// |----|---------|--------|
// | 2  | Jane    | 1050   |
// | 3  | Maria   | 1100   |
```

### Filter conditions

`HolySheets!` provides a variety of filter conditions to help you query data from your Google Sheets. These filters allow you to specify criteria for selecting rows based on the values in their columns.

#### equals

Checks if the value in the column equals the specified value.

```typescript
const user = await userSheet.findFirst({
  where: {
    email: {
      equals: 'john.doe@example.com'
    }
  }
});
```

#### not

Checks if the value in the column does not equal the specified value.

```typescript
const users = await userSheet.findMany({
  where: {
    email: {
      not: 'john.doe@example.com'
    }
  }
});
```

#### in

Checks if the value in the column is included in the specified array.

```typescript
const users = await userSheet.findMany({
  where: {
    role: {
      in: ['admin', 'editor']
    }
  }
});
```

#### notIn

Checks if the value in the column is not included in the specified array.

```typescript
const users = await userSheet.findMany({
  where: {
    role: {
      notIn: ['guest', 'banned']
    }
  }
});
```

#### lt

Checks if the numeric value in the column is less than the specified value.

```typescript
const users = await userSheet.findMany({
  where: {
    age: {
      lt: 30
    }
  }
});
```

#### lte

Checks if the numeric value in the column is less than or equal to the specified value.

```typescript
const users = await userSheet.findMany({
  where: {
    age: {
      lte: 30
    }
  }
});
```
#### gt

Checks if the numeric value in the column is greater than the specified value.

```typescript
const users = await userSheet.findMany({
  where: {
    points: {
      gt: 1000
    }
  }
});
```

#### gte

Checks if the numeric value in the column is greater than or equal to the specified value.

```typescript
const users = await userSheet.findMany({
  where: {
    points: gte(1000)
  }
});
```

#### contains

Checks if the string value in the column contains the specified substring.

```typescript
const users = await userSheet.findMany({
  where: {
    name:{
      contains: 'Doe'
    }
  }
});
```

#### search

Performs a case-insensitive search to check if the string value in the column contains the specified substring.

```typescript
const users = await userSheet.findMany({
  where: {
    name: {
      search: 'doe'
    }
  }
});
```

#### startsWith

Checks if the string value in the column starts with the specified substring.

```typescript
const users = await userSheet.findMany({
  where: {
    name: {
      startsWith: 'John'
    }
  }
});
```

#### endsWith

Checks if the string value in the column ends with the specified substring.

```typescript
const users = await userSheet.findMany({
  where: {
    email: {
      endsWith: '@example.com'
    }
  }
});
```

## License

`HolySheets!` is licensed under the MIT License. For more details, see the [LICENSE](LICENSE) file in the project repository.

## Note

While `HolySheets!` provides a simplified interface for managing Google Sheets data, it is not intended to replace a dedicated database system. Please consider the specific needs and requirements of your project when deciding whether to use `HolySheets!`.

