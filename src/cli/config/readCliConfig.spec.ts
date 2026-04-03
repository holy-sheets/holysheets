import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { CliError } from '@/cli/errors/CliError'
import { readCliConfig } from '@/cli/config/readCliConfig'

describe('readCliConfig', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns empty object when path is not provided', () => {
    expect(readCliConfig()).toEqual({})
  })

  it('throws when config file does not exist', () => {
    expect(() => readCliConfig('./missing-config.json')).toThrowError(CliError)
  })

  it('reads and parses a valid config file', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hs-cli-config-'))
    const configPath = path.join(tempDir, 'config.json')
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        defaults: {
          spreadsheetId: 'abc',
          sheet: 'pokemon',
          headerRow: 2
        }
      })
    )

    const config = readCliConfig(configPath)
    expect(config).toEqual({
      defaults: {
        spreadsheetId: 'abc',
        sheet: 'pokemon',
        headerRow: 2
      }
    })
  })

  it('throws when file cannot be read', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hs-cli-config-'))
    const configPath = path.join(tempDir, 'config.json')
    fs.writeFileSync(configPath, '{"defaults":{"sheet":"pokemon"}}')

    vi.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
      throw new Error('permission denied')
    })

    expect(() => readCliConfig(configPath)).toThrowError(
      /Could not read config file/
    )
  })

  it('throws when config file has invalid json', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hs-cli-config-'))
    const configPath = path.join(tempDir, 'config.json')
    fs.writeFileSync(configPath, '{"defaults":')

    expect(() => readCliConfig(configPath)).toThrowError(
      /Invalid JSON in config file/
    )
  })

  it('throws when parsed config is not an object', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hs-cli-config-'))
    const configPath = path.join(tempDir, 'config.json')
    fs.writeFileSync(configPath, '42')

    expect(() => readCliConfig(configPath)).toThrowError(
      /Invalid JSON in config file/
    )
  })
})
