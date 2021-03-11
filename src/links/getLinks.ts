import {getOs, OSType} from '../platform'
import {AbstractLinks} from './links'
import {LinuxLinks} from './linuxLinks'
import {WindowsLinks} from './windowsLinks'

// Platform independent getter for ILinks interface
export async function getLinks(): Promise<AbstractLinks> {
  const osType = await getOs()
  switch (osType) {
    case OSType.windows:
      return WindowsLinks.Instance
    case OSType.linux:
      return LinuxLinks.Instance
  }
}
