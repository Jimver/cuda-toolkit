import fs from 'fs'
import os from 'os'
import path from 'path'
import { getFilesRecursive, filterReadable } from '../src/fs-utils.js'

describe('fs-utils', () => {
  const tmpRoot = path.join(os.tmpdir(), `cuda-toolkit-test-${Date.now()}`)

  beforeAll(async () => {
    await fs.promises.mkdir(tmpRoot, { recursive: true })
    // create files and nested directories
    await fs.promises.mkdir(path.join(tmpRoot, 'subdir'))
    await fs.promises.writeFile(path.join(tmpRoot, 'a.txt'), 'a')
    await fs.promises.writeFile(path.join(tmpRoot, 'subdir', 'b.txt'), 'b')

    // create a non-readable file (if platform supports chmod)
    try {
      const p = path.join(tmpRoot, 'noaccess.txt')
      await fs.promises.writeFile(p, 'x')
      await fs.promises.chmod(p, 0o000)
    } catch {
      // ignore chmod failures on platforms that don't support it
    }
  })

  afterAll(async () => {
    try {
      const p = path.join(tmpRoot, 'noaccess.txt')
      await fs.promises.chmod(p, 0o644)
    } catch {
      // ignore
    }
    await fs.promises.rm(tmpRoot, { recursive: true, force: true })
  })

  test('getFilesRecursive returns all files under directory', async () => {
    const files = await getFilesRecursive(tmpRoot)

    const normalizedNames = files.map((f) => path.relative(tmpRoot, f)).sort()

    expect(normalizedNames).toEqual(
      ['a.txt', 'noaccess.txt', path.join('subdir', 'b.txt')].sort()
    )
  })

  test('filterReadable filters out non-readable or missing files', async () => {
    const a = path.join(tmpRoot, 'a.txt')
    const nosuch = path.join(tmpRoot, 'does-not-exist.txt')
    const noaccess = path.join(tmpRoot, 'noaccess.txt')

    const result = await filterReadable([a, nosuch, noaccess])

    expect(result).toContain(a)
    expect(result).not.toContain(nosuch)
  })
})
