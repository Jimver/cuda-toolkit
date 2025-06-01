import { AbstractLinks } from '../../src/links/links'
import { SemVer } from 'semver'
import { WindowsLinks } from '../../src/links/windows-links'

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
      const url: URL =
        await WindowsLinks.Instance.getLocalURLFromCudaVersion(version)
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

test.concurrent(
  'Local Windows links should start with https://developer.(.download.)nvidia.com and end with .exe',
  async () => {
    const versions = WindowsLinks.Instance.getAvailableLocalCudaVersions()
    const filteredVersions = versions.filter((version) => {
      return (
        version.version !== '10.0.130' &&
        version.version !== '9.2.148' &&
        version.version !== '8.0.61'
      )
    })
    for (const version of filteredVersions) {
      const url: URL =
        await WindowsLinks.Instance.getLocalURLFromCudaVersion(version)
      expect(url.toString()).toMatch(
        /^https:\/\/developer\.(download\.)?nvidia\.com.+\.exe$/
      )
    }
  }
)

test.concurrent(
  'Network Windows links should start with https://developer.(download.)nvidia.com and end with network.exe',
  async () => {
    const versions = WindowsLinks.Instance.getAvailableNetworkCudaVersions()
    const filteredVersions = versions.filter((version) => {
      return (
        version.version !== '10.0.130' &&
        version.version !== '9.2.148' &&
        version.version !== '8.0.61'
      )
    })
    for (const version of filteredVersions) {
      const url: URL =
        WindowsLinks.Instance.getNetworkURLFromCudaVersion(version)
      expect(url.toString()).toMatch(
        /^https:\/\/developer\.(download\.)?nvidia\.com.+network\.exe$/
      )
    }
  }
)
