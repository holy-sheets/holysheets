# CLI Schema

Schemas define the expected structure of your sheet's columns. They are optional — if omitted, all columns are treated as strings.

When provided, the schema enables type validation and column aliasing.

---

## Schema Sources

You must use **only one** schema source at a time. Mixing sources will produce an error.

### 1. Schema File

Point to a JSON file containing an array of schema definitions:

```bash
holysheets read find-many \
  --spreadsheet-id <ID> \
  --sheet places \
  --schema-file ./schema.json
```

`schema.json`:

```json
[
  { "key": "nome_estabelecimento", "type": "string" },
  { "key": "rating", "type": "number" },
  { "key": "visitado_em", "type": "date", "nullable": true }
]
```

### 2. Inline JSON

Pass the schema directly as a JSON string:

```bash
holysheets read find-many \
  --spreadsheet-id <ID> \
  --sheet places \
  --schema-json '[{"key":"name","type":"string"},{"key":"rating","type":"number"}]'
```

### 3. Repeatable Flags

Define the schema field by field using grouped flags:

```bash
holysheets read find-many \
  --spreadsheet-id <ID> \
  --sheet places \
  --schema-field nome_estabelecimento --schema-type string \
  --schema-field rating --schema-type number \
  --schema-field visitado_em --schema-type date --schema-nullable
```

---

## Flag Grouping Rules

Each `--schema-field` starts a **new schema block**. The following flags apply to the most recent `--schema-field`:

| Flag                | Description                      | Required |
| ------------------- | -------------------------------- | -------- |
| `--schema-field`    | Column name (starts a new block) | Yes      |
| `--schema-type`     | Data type                        | Yes      |
| `--schema-nullable` | Allow null values (boolean flag) | No       |
| `--schema-alias`    | Rename the field in the output   | No       |

---

## Supported Types

| Type      | Description   |
| --------- | ------------- |
| `string`  | Text value    |
| `number`  | Numeric value |
| `boolean` | Boolean value |
| `date`    | Date value    |

---

## Alias Example

Use `--schema-alias` to rename columns in the output:

```bash
holysheets read find-many \
  --spreadsheet-id <ID> \
  --sheet places \
  --schema-field nome_estabelecimento --schema-type string --schema-alias name \
  --schema-field rating --schema-type number
```
