import { jest } from '@jest/globals'
import { SemVer } from 'semver'
import os from 'os'
import { WindowsLinks } from '../../src/links/windows-links'

const nvidia = 'https://developer.download.nvidia.com/compute/cuda'

afterEach(() => {
  jest.restoreAllMocks()
})

describe('Windows links on x64', () => {
  beforeEach(() => {
    jest.spyOn(os, 'arch').mockReturnValue('x64')
  })

  test('13.4.1 local link is the x86_64 installer', async () => {
    const url = await WindowsLinks.Instance.getLocalURLFromCudaVersion(
      new SemVer('13.4.1')
    )
    expect(url.toString()).toBe(
      `${nvidia}/13.4.1/local_installers/cuda_13.4.1_windows_x86_64.exe`
    )
  })

  test('13.4.1 network link is the x86_64 installer', async () => {
    const url = await WindowsLinks.Instance.getNetworkURLFromCudaVersion(
      new SemVer('13.4.1')
    )
    expect(url.toString()).toBe(
      `${nvidia}/13.4.1/network_installers/cuda_13.4.1_windows_x86_64_network.exe`
    )
  })

  test('older versions keep their unsuffixed links', async () => {
    const local = await WindowsLinks.Instance.getLocalURLFromCudaVersion(
      new SemVer('13.3.1')
    )
    const network = await WindowsLinks.Instance.getNetworkURLFromCudaVersion(
      new SemVer('13.3.1')
    )
    expect(local.toString()).toBe(
      `${nvidia}/13.3.1/local_installers/cuda_13.3.1_windows.exe`
    )
    expect(network.toString()).toBe(
      `${nvidia}/13.3.1/network_installers/cuda_13.3.1_windows_network.exe`
    )
  })

  test('every local and network link resolves without error', async () => {
    for (const version of WindowsLinks.Instance.getAvailableLocalCudaVersions()) {
      const url =
        await WindowsLinks.Instance.getLocalURLFromCudaVersion(version)
      expect(url.toString()).not.toContain('_arm64')
    }
    for (const version of WindowsLinks.Instance.getAvailableNetworkCudaVersions()) {
      const url =
        await WindowsLinks.Instance.getNetworkURLFromCudaVersion(version)
      expect(url.toString()).not.toContain('_arm64')
    }
  })
})

describe('Windows links on arm64', () => {
  beforeEach(() => {
    jest.spyOn(os, 'arch').mockReturnValue('arm64')
  })

  test('13.4.1 local link is the arm64 installer', async () => {
    const url = await WindowsLinks.Instance.getLocalURLFromCudaVersion(
      new SemVer('13.4.1')
    )
    expect(url.toString()).toBe(
      `${nvidia}/13.4.1/local_installers/cuda_13.4.1_windows_arm64.exe`
    )
  })

  test('13.4.1 network link is the arm64 installer', async () => {
    const url = await WindowsLinks.Instance.getNetworkURLFromCudaVersion(
      new SemVer('13.4.1')
    )
    expect(url.toString()).toBe(
      `${nvidia}/13.4.1/network_installers/cuda_13.4.1_windows_arm64_network.exe`
    )
  })

  // excp: 12.9.2 carries x86 suffix fpr who knows what reason...
  test.each(['13.3.1', '12.9.2', '11.8.0'])(
    'version %s without an arm64 build throws a descriptive error',
    async (versionString) => {
      const version = new SemVer(versionString)
      await expect(
        WindowsLinks.Instance.getLocalURLFromCudaVersion(version)
      ).rejects.toThrow('does not provide a Windows arm64 installer')
      await expect(
        WindowsLinks.Instance.getNetworkURLFromCudaVersion(version)
      ).rejects.toThrow('does not provide a Windows arm64 installer')
    }
  )

  test('arm64 links are derived for every version with an x86 split', async () => {
    const arm64Versions = ['13.4.1']
    for (const versionString of arm64Versions) {
      const version = new SemVer(versionString)
      const local =
        await WindowsLinks.Instance.getLocalURLFromCudaVersion(version)
      const network =
        await WindowsLinks.Instance.getNetworkURLFromCudaVersion(version)
      expect(local.toString()).toMatch(/_windows_arm64\.exe$/)
      expect(network.toString()).toMatch(/_windows_arm64_network\.exe$/)
    }
  })
})
