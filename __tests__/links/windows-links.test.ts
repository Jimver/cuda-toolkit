import {AbstractLinks} from '../../src/links/links'
import {SemVer} from 'semver'
import {WindowsLinks} from '../../src/links/windows-links'

test.concurrent('Windows Cuda versions in descending order', async () => {
  const wLinks: AbstractLinks = WindowsLinks.Instance
  const versions = wLinks.getAvailableLocalCudaVersions()
  for (let i = 0; i < versions.length - 1; i++) {
    const versionA: SemVer = versions[i]
    const versionB: SemVer = versions[i + 1]
    expect(versionA.compare(versionB)).toBe(1) // A should be greater than B
  }
})

test.concurrent(
  'Windows Cuda version to URL map contains valid URLs',
  async () => {
    for (const version of WindowsLinks.Instance.getAvailableLocalCudaVersions()) {
      const url: URL = WindowsLinks.Instance.getLocalURLFromCudaVersion(version)
      expect(url).toBeInstanceOf(URL)
    }
  }
)

test.concurrent('There is at least windows 1 version url pair', async () => {
  expect(
    WindowsLinks.Instance.getAvailableLocalCudaVersions().length
  ).toBeGreaterThanOrEqual(1)
})

test.concurrent(
  'Windows Cuda network versions in descending order',
  async () => {
    const wLinks = WindowsLinks.Instance
    const versions = wLinks.getAvailableNetworkCudaVersions()
    for (let i = 0; i < versions.length - 1; i++) {
      const versionA: SemVer = versions[i]
      const versionB: SemVer = versions[i + 1]
      expect(versionA.compare(versionB)).toBe(1) // A should be greater than B
    }
  }
)

test.concurrent(
  'Windows network Cuda version to URL map contains valid URLs',
  async () => {
    for (const version of WindowsLinks.Instance.getAvailableNetworkCudaVersions()) {
      const url: URL =
        WindowsLinks.Instance.getNetworkURLFromCudaVersion(version)
      expect(url).toBeInstanceOf(URL)
    }
  }
)

test.concurrent(
  'There is at least windows network 1 version url pair',
  async () => {
    expect(
      WindowsLinks.Instance.getAvailableNetworkCudaVersions().length
    ).toBeGreaterThanOrEqual(1)
  }
)
