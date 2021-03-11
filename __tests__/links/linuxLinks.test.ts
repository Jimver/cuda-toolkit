import {SemVer} from 'semver'
import {AbstractLinks} from '../../src/links/links'
import {LinuxLinks} from '../../src/links/linuxLinks'

test('Linux Cuda versions in descending order', async () => {
  const wLinks: AbstractLinks = LinuxLinks.Instance
  const versions = wLinks.getAvailableCudaVersions()
  for (let i = 0; i < versions.length - 1; i++) {
    const versionA: SemVer = versions[i]
    const versionB: SemVer = versions[i + 1]
    expect(versionA.compare(versionB)).toBe(1) // A should be greater than B
  }
})

test('Linux Cuda version to URL map contains valid URLs', async () => {
  for (const version of LinuxLinks.Instance.getAvailableCudaVersions()) {
    const url: URL = LinuxLinks.Instance.getURLFromCudaVersion(version)
    expect(url).toBeInstanceOf(URL)
  }
})

test('There is at least linux 1 version url pair', async () => {
  expect(
    LinuxLinks.Instance.getAvailableCudaVersions().length
  ).toBeGreaterThanOrEqual(1)
})
