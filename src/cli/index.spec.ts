import { afterEach, describe, expect, it, vi } from 'vitest'

const runCliMock = vi.fn()

vi.mock('@/cli/runCli', () => ({
  runCli: runCliMock
}))

describe('cli index entrypoint', () => {
  const originalArgv = process.argv

  afterEach(() => {
    process.argv = originalArgv
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('forwards process argv slice(2) to runCli', async () => {
    process.argv = [
      'node',
      'holysheets',
      'read',
      'find-many',
      '--sheet',
      'pokemon'
    ]

    await import('@/cli/index')

    expect(runCliMock).toHaveBeenCalledWith([
      'read',
      'find-many',
      '--sheet',
      'pokemon'
    ])
  })
})
