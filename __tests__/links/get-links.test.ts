import {LinuxLinks} from '../../src/links/linux-links'
import {WindowsLinks} from '../../src/links/windows-links'
import {getLinks} from '../../src/links/get-links'
import {LinuxArmLinks} from '../../src/links/linux-arm-links'
import {WindowsArmLinks} from '../../src/links/windows-arm-links'

test.concurrent('getLinks gives a valid ILinks class', async () => {
  try {
    const links = await getLinks()
    expect(
      links instanceof LinuxLinks || links instanceof WindowsLinks
    ).toBeTruthy()
  } catch (error) {
    // Other OS
  }
})

test.concurrent('getLinks return same versions in same order', async () => {
  const linuxLinks = LinuxLinks.Instance.getAvailableLocalCudaVersions()
  const linuxArmLinks = LinuxArmLinks.Instance.getAvailableLocalCudaVersions()
  const windowsLinks = WindowsLinks.Instance.getAvailableLocalCudaVersions()
  const windowsArmLinks =
    WindowsArmLinks.Instance.getAvailableLocalCudaVersions()
  const windowsNetworkLinks =
    WindowsLinks.Instance.getAvailableNetworkCudaVersions()
  const windowsArmNetworkLinks =
    WindowsArmLinks.Instance.getAvailableNetworkCudaVersions()

  expect(linuxLinks.length).toBe(windowsLinks.length)
  expect(linuxArmLinks.length).toBe(WindowsArmLinks.length)
  expect(windowsLinks.length).toBe(windowsNetworkLinks.length)
  expect(windowsArmLinks.length).toBe(windowsArmNetworkLinks.length)
  expect(linuxLinks).toEqual(windowsLinks)
  expect(linuxArmLinks).toEqual(windowsArmLinks)
  expect(windowsLinks).toEqual(windowsNetworkLinks)
  expect(windowsArmLinks).toEqual(windowsArmNetworkLinks)
})
