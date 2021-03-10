import {SemVer} from 'semver'
import {
  getAvailableCudaVersions,
  getURLFromCudaVersion
} from '../../src/links/windows'

test('Windows Cuda versions in descending order', async () => {
  const versions = getAvailableCudaVersions()
  for (let i = 0; i < versions.length - 1; i++) {
    const versionA = new SemVer(versions[i])
    const versionB = new SemVer(versions[i + 1])
    expect(versionA.compare(versionB)).toBe(1) // A should be greater than B
  }
})

test('Windows Cuda version to URL map contains valid URLs', async () => {
  for (const version of getAvailableCudaVersions()) {
    const url = getURLFromCudaVersion(version)
    expect(url).toBeInstanceOf(URL)
  }
})
