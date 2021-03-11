import {SemVer} from 'semver'
import {WindowsLinks} from '../../src/links/windowsLinks'
import {AbstractLinks} from '../../src/links/links'

test('Windows Cuda versions in descending order', async () => {
  const wLinks: AbstractLinks = WindowsLinks.Instance
  const versions = wLinks.getAvailableCudaVersions()
  for (let i = 0; i < versions.length - 1; i++) {
    const versionA: SemVer = versions[i]
    const versionB: SemVer = versions[i + 1]
    expect(versionA.compare(versionB)).toBe(1) // A should be greater than B
  }
})

test('Windows Cuda version to URL map contains valid URLs', async () => {
  for (const version of WindowsLinks.Instance.getAvailableCudaVersions()) {
    const url: URL = WindowsLinks.Instance.getURLFromCudaVersion(version)
    expect(url).toBeInstanceOf(URL)
  }
})

test('There is at least windows 1 version url pair', async () => {
  expect(
    WindowsLinks.Instance.getAvailableCudaVersions().length
  ).toBeGreaterThanOrEqual(1)
})
