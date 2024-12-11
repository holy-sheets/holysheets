# Data Operations

HolySheets provides a set of CRUD-like operations:

- **findFirst**, **findMany**: Query rows.
- **insert**: Insert new records.
- **updateFirst**, **updateMany**: Update existing rows.
- **deleteFirst**, **deleteMany**: Delete records.
- **clearFirst**, **clearMany**: Clear cell values without removing rows.

All operations can optionally return metadata such as affected ranges and operation duration.
