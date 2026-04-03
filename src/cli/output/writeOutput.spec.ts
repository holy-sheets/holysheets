import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { CliError } from '@/cli/errors/CliError'
import { writeOutput } from '@/cli/output/writeOutput'

describe('writeOutput', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('writes to stdout when output path is not provided', () => {
    const stdoutSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true)

    writeOutput('hello')

    expect(stdoutSpy).toHaveBeenCalledWith('hello\n')
  })

  it('writes to file when output path is provided', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hs-cli-output-'))
    const outputPath = path.join(tempDir, 'nested', 'result.json')

    writeOutput('{"ok":true}', outputPath)

    const fileContent = fs.readFileSync(outputPath, 'utf8')
    expect(fileContent).toBe('{"ok":true}')
  })

  it('throws CliError when writing file fails', () => {
    vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {
      throw new Error('disk full')
    })

    expect(() => writeOutput('content', './out/file.txt')).toThrowError(
      CliError
    )
  })
})
