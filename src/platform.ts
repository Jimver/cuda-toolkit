import {debug} from '@actions/core'
import os from 'os'

export enum OSType {
  windows = 'windows',
  linux = 'linux'
}

export async function getOs(): Promise<OSType> {
  const osPlatform = os.platform()
  switch (osPlatform) {
    case 'win32':
      return OSType.windows
    case 'linux':
      return OSType.linux
    default:
      debug(`Unsupported OS: ${osPlatform}`)
      throw new Error(`Unsupported OS: ${osPlatform}`)
  }
}
