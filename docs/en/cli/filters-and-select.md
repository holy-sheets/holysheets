# CLI Filters and Select

Use `--where-*` flags to filter records, `--select` to include fields, and `--omit` to exclude fields.

---

## Where Filters

Filters are built using grouped flags. Each `--where-field` starts a new filter block.

```bash
holysheets read find-many \
  --spreadsheet-id <ID> \
  --sheet <sheet-name> \
  --where-field rating --where-op gte --where-value 4 \
  --where-field name --where-op contains --where-value bar
```

Multiple filter blocks are combined with **AND** logic.

---

## Flag Grouping Rules

| Flag            | Description                      | Required |
| --------------- | -------------------------------- | -------- |
| `--where-field` | Column name (starts a new block) | Yes      |
| `--where-op`    | Comparison operator              | Yes      |
| `--where-value` | Value to compare against         | Yes      |

Each `--where-field` starts a **new filter block**. The following `--where-op` and `--where-value` apply to the most recent field.

---

## Supported Operators

| Operator     | Description                        | Value Type |
| ------------ | ---------------------------------- | ---------- |
| `equals`     | Exact match                        | `string`   |
| `not`        | Not equal                          | `string`   |
| `contains`   | Substring match                    | `string`   |
| `startsWith` | Starts with prefix                 | `string`   |
| `endsWith`   | Ends with suffix                   | `string`   |
| `search`     | Search (pattern matching)          | `string`   |
| `lt`         | Less than                          | `number`   |
| `lte`        | Less than or equal                 | `number`   |
| `gt`         | Greater than                       | `number`   |
| `gte`        | Greater than or equal              | `number`   |
| `in`         | Matches any value in list          | `string[]` |
| `notIn`      | Matches none of the values in list | `string[]` |

::: tip
For `in` and `notIn`, use multiple `--where-value` flags:

```bash
--where-field city --where-op in --where-value "São Paulo" --where-value "Rio"
```

:::

::: info
Numeric operators (`lt`, `lte`, `gt`, `gte`) require the value to be a valid number.
:::

---

## Multiple Filters on the Same Field

You can apply multiple operators to the same field:

```bash
holysheets read find-many \
  --spreadsheet-id <ID> \
  --sheet <sheet-name> \
  --where-field rating --where-op gte --where-value 3 \
  --where-field rating --where-op lte --where-value 5
```

This returns records where `rating >= 3 AND rating <= 5`.

---

## Select

Use `--select` to return only specific fields. It is repeatable:

```bash
holysheets read find-many \
  --spreadsheet-id <ID> \
  --sheet <sheet-name> \
  --select name \
  --select rating
```

When `--select` is omitted, all fields are returned.

::: warning
`--select` is not allowed with `read describe`.
:::

---

## Omit

Use `--omit` to exclude specific fields from the output. It is repeatable:

```bash
holysheets read find-many \
  --spreadsheet-id <ID> \
  --sheet <sheet-name> \
  --omit instagram \
  --omit endereco
```

::: warning
`--omit` cannot be used together with `--select` in the same command.
:::

::: warning
`--omit` is not allowed with `read describe`.
:::
