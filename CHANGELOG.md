# [2.0.0](https://github.com/holy-sheets/holy-sheets/compare/v1.1.0...v2.0.0) (2024-12-08)

## Breaking Changes

- **Authentication:** Authentication method with credentials has been updated. ([5bc4510](https://github.com/holy-sheets/holy-sheets/commit/5bc4510), [34b2a11](https://github.com/holy-sheets/holy-sheets/commit/34b2a11))

## Features

- Implement result sanitization for CRUD operations and add `getSheetId` method [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([8a60d1e](https://github.com/holy-sheets/holy-sheets/commit/8a60d1edcd812fc7a1829de47f384c454c08acd0))
- Add optional configs parameter to CRUD operations for enhanced flexibility [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([adb31f4](https://github.com/holy-sheets/holy-sheets/commit/adb31f4b84213968481a907fd69b10f976afebfb))
- Skip tests for fetching, clearing, and deleting multiple records [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([2733e57](https://github.com/holy-sheets/holy-sheets/commit/2733e57135516d9d4d8d694efbf978639ac30191))
- Add validation to ensure row is a number before deletion [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([29b105d](https://github.com/holy-sheets/holy-sheets/commit/29b105d09175cb13ff6c3c00389f2c368fe0422a))
- Add support for optional metadata and improve error handling [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([f82dee4](https://github.com/holy-sheets/holy-sheets/commit/f82dee442b2f4682852052a720250f34ef7152e6))
- Enhance `updateMany` function to support optional metadata and improve error handling [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([44032f2](https://github.com/holy-sheets/holy-sheets/commit/44032f299543c4a444c67cbc731c06632fcf1c74))
- Enhance `insert` function to support optional metadata and improve error handling [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([6723bf3](https://github.com/holy-sheets/holy-sheets/commit/6723bf3aa6efb015c934765106374d12ee7fb013))
- Enhance `deleteMany` function to support optional metadata and improve error handling [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([f6d6ff3](https://github.com/holy-sheets/holy-sheets/commit/f6d6ff3ee90374183f4f9e2845ef96a537d80a72))
- Enhance `clearMany` function to support optional metadata and improve error handling [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([8b2e0ce](https://github.com/holy-sheets/holy-sheets/commit/8b2e0ce51ed142998498f1608f8ab9e79e337828))
- Enhance `findMany` function to include metadata in results and update tests accordingly [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([dc6d69a](https://github.com/holy-sheets/holy-sheets/commit/dc6d69a678660f30ce6bdae9fca259dcf84bdd14))
- Enhance `deleteFirst` function with optional metadata support and improved error handling [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([8ed0e15](https://github.com/holy-sheets/holy-sheets/commit/8ed0e1517bcd63f12c7ed617d9755d709f9ad5ab))
- Enhance `clearFirst` function with optional metadata support and improved error handling [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([8958314](https://github.com/holy-sheets/holy-sheets/commit/8958314b0e619e602b6f7b57db2158938e9a45a6))
- Enhance `updateFirst` function with optional metadata support and improved error handling [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([57e1dee](https://github.com/holy-sheets/holy-sheets/commit/57e1deef02c6611f7f690926e336bead02191a45))
- Enhance `findFirst` function with metadata support and improved error handling [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([a250462](https://github.com/holy-sheets/holy-sheets/commit/a250462a44d38c9ef7983132b696acdd20680b90))
- Add OperationError and NotFoundError classes, and `IMetadataService` interface for operation metadata management [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([c25d237](https://github.com/holy-sheets/holy-sheets/commit/c25d237d17456de110cda50869c09aaa2233b837))
- Streamline authentication by using auth parameter directly ([d9843f8](https://github.com/holy-sheets/holy-sheets/commit/d9843f8617ad2027e9bb1efbc46c67c63c93d766)), closes [#5](https://github.com/holy-sheets/holy-sheets/issues/5)
- Add use example for OAuth ([f07ad7b](https://github.com/holy-sheets/holy-sheets/commit/f07ad7b2daa984d2d2bfffd242da595e51d8d069)), closes [#5](https://github.com/holy-sheets/holy-sheets/issues/5)
- Add JWT authentication example and environment configuration ([b63e481](https://github.com/holy-sheets/holy-sheets/commit/b63e4819bf72dfb6c7f91b5fe437219d8b60809e)), closes [#5](https://github.com/holy-sheets/holy-sheets/issues/5)

## Bug Fixes

- **update:** uses spreadsheets.values.update to update data for `updateFirst` and `updateMany` [#7](https://github.com/holy-sheets/holy-sheets/issues/7) ([c93fb6e](https://github.com/holy-sheets/holy-sheets/commit/c93fb6e5802c5d340347dc8a5360667410ba40b3))

# [1.1.0](https://github.com/holy-sheets/holy-sheets/compare/v1.0.6...v1.1.0) (2024-12-08)

### Bug Fixes

- **update:** uses spreadsheets.values.update to update data for updateFirst and updateMany [#7](https://github.com/holy-sheets/holy-sheets/issues/7) ([c93fb6e](https://github.com/holy-sheets/holy-sheets/commit/c93fb6e5802c5d340347dc8a5360667410ba40b3))

### Features

- add JWT authentication example and environment configuration ([b63e481](https://github.com/holy-sheets/holy-sheets/commit/b63e4819bf72dfb6c7f91b5fe437219d8b60809e)), closes [#5](https://github.com/holy-sheets/holy-sheets/issues/5)
- add optional configs parameter to CRUD operations for enhanced flexibility [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([adb31f4](https://github.com/holy-sheets/holy-sheets/commit/adb31f4b84213968481a907fd69b10f976afebfb))
- add use example for OAuth ([f07ad7b](https://github.com/holy-sheets/holy-sheets/commit/f07ad7b2daa984d2d2bfffd242da595e51d8d069)), closes [#5](https://github.com/holy-sheets/holy-sheets/issues/5)
- **clearFirst:** enhance clearFirst function with optional metadata support and improved error handling [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([8958314](https://github.com/holy-sheets/holy-sheets/commit/8958314b0e619e602b6f7b57db2158938e9a45a6))
- **clearMany:** enhance clearMany function to support optional metadata and improve error handling [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([8b2e0ce](https://github.com/holy-sheets/holy-sheets/commit/8b2e0ce51ed142998498f1608f8ab9e79e337828))
- **deleteFirst:** add validation to ensure row is a number before deletion [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([29b105d](https://github.com/holy-sheets/holy-sheets/commit/29b105d09175cb13ff6c3c00389f2c368fe0422a))
- **deleteFirst:** enhance deleteFirst function with optional metadata support and improved error handling [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([8ed0e15](https://github.com/holy-sheets/holy-sheets/commit/8ed0e1517bcd63f12c7ed617d9755d709f9ad5ab))
- **deleteMany:** enhance deleteMany function to support optional metadata and improve error handling [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([f6d6ff3](https://github.com/holy-sheets/holy-sheets/commit/f6d6ff3ee90374183f4f9e2845ef96a537d80a72))
- **findFirst:** enhance findFirst function with metadata support and improved error handling [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([a250462](https://github.com/holy-sheets/holy-sheets/commit/a250462a44d38c9ef7983132b696acdd20680b90))
- **findMany:** enhance findMany function to include metadata in results and update tests accordingly [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([dc6d69a](https://github.com/holy-sheets/holy-sheets/commit/dc6d69a678660f30ce6bdae9fca259dcf84bdd14))
- **getSheetId:** add support for optional metadata and improve error handling [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([f82dee4](https://github.com/holy-sheets/holy-sheets/commit/f82dee442b2f4682852052a720250f34ef7152e6))
- **holysheets main class:** streamline authentication by using auth parameter directly ([d9843f8](https://github.com/holy-sheets/holy-sheets/commit/d9843f8617ad2027e9bb1efbc46c67c63c93d766)), closes [#5](https://github.com/holy-sheets/holy-sheets/issues/5)
- implement result sanitization for CRUD operations and add getSheetId method [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([8a60d1e](https://github.com/holy-sheets/holy-sheets/commit/8a60d1edcd812fc7a1829de47f384c454c08acd0))
- **insert:** enhance insert function to support optional metadata and improve error handling [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([6723bf3](https://github.com/holy-sheets/holy-sheets/commit/6723bf3aa6efb015c934765106374d12ee7fb013))
- **metadata:** add OperationError and NotFoundError classes, and IMetadataService interface for operation metadata management [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([c25d237](https://github.com/holy-sheets/holy-sheets/commit/c25d237d17456de110cda50869c09aaa2233b837))
- **tests:** skip tests for fetching, clearing, and deleting multiple records [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([2733e57](https://github.com/holy-sheets/holy-sheets/commit/2733e57135516d9d4d8d694efbf978639ac30191))
- **updateFirst:** enhance updateFirst function with optional metadata support and improved error handling [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([57e1dee](https://github.com/holy-sheets/holy-sheets/commit/57e1deef02c6611f7f690926e336bead02191a45))
- **updateMany:** enhance updateMany function to support optional metadata and improve error handling [#10](https://github.com/holy-sheets/holy-sheets/issues/10) ([44032f2](https://github.com/holy-sheets/holy-sheets/commit/44032f299543c4a444c67cbc731c06632fcf1c74))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### 1.0.1 (2024-05-20)

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.
