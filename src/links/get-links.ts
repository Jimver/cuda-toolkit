import {OSType, getOs} from '../platform'
import {CPUArch, getArch} from '../arch'
import {AbstractLinks} from './links'
import {LinuxLinks} from './linux-links'
import {LinuxArmLinks} from './linux-arm-links'
import {WindowsLinks} from './windows-links'
import {WindowsArmLinks} from './windows-arm-links'

// Platform independent getter for ILinks interface
export async function getLinks(): Promise<AbstractLinks> {
  const osType = await getOs()
  const osArch = await getArch()

  switch (osType) {
    case OSType.windows:
      if (osArch === 'arm64') {
        return WindowsLinks.Instance
      } else {
        return WindowsArmLinks.Instance
      }
    case OSType.linux:
      if (osArch === 'arm64') {
        return LinuxArmLinks.Instance
      } else {
        return LinuxLinks.Instance
      }
  }
}
