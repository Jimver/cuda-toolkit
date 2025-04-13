import {AbstractLinks} from '../../src/links/links'
import {LinuxLinks} from '../../src/links/linux-links'
import {SemVer} from 'semver'

test.concurrent('Linux Cuda versions in descending order', async () => {
  const wLinks: AbstractLinks = LinuxLinks.Instance
  const versions = wLinks.getAvailableLocalCudaVersions()
  for (let i = 0; i < versions.length - 1; i++) {
    const versionA: SemVer = versions[i]
    const versionB: SemVer = versions[i + 1]
    expect(versionA.compare(versionB)).toBe(1) // A should be greater than B
  }
})

test.concurrent(
  'Linux Cuda version to URL map contains valid URLs',
  async () => {
    for (const version of LinuxLinks.Instance.getAvailableLocalCudaVersions()) {
      const url: URL =
        await LinuxLinks.Instance.getLocalURLFromCudaVersion(version)
      expect(url).toBeInstanceOf(URL)
    }
  }
)

test.concurrent('There is at least linux 1 version url pair', async () => {
  expect(
    LinuxLinks.Instance.getAvailableLocalCudaVersions().length
  ).toBeGreaterThanOrEqual(1)
})

test.concurrent(
  'Local Linux links should start with https://developer.(download.)nvidia.com and end with .run',
  async () => {
    const versions = LinuxLinks.Instance.getAvailableLocalCudaVersions()
    const filteredVersions = versions.filter(version => {
      return (
        version.version !== '10.0.130' &&
        version.version !== '9.2.148' &&
        version.version !== '8.0.61'
      )
    })
    for (const version of filteredVersions) {
      const url: URL =
        await LinuxLinks.Instance.getLocalURLFromCudaVersion(version)
      expect(url.toString()).toMatch(
        /^https:\/\/developer\.(download\.)?nvidia\.com.+\.run$/
      )
    }
  }
)
