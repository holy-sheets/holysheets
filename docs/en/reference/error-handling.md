# Error Handling

HolySheets throws errors if operations fail:

- `NoRecordFound` if no rows match a query.
- `UnknownError` for unexpected issues.

Use `try/catch` or check `metadata` for `status: 'failure'` and `error` messages.
