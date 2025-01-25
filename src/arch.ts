import {debug} from '@actions/core'
import os from 'os'

export enum CPUArch {
  x86_64 = 'x64',
  arm64 = 'arm64'
}

export async function getArch(): Promise<CPUArch> {
  const arch = os.arch()
  switch (arch) {
    case 'x64':
      return CPUArch.x86_64
    case 'arm64':
      return CPUArch.arm64
    default:
      debug(`Unsupported architecture: ${arch}`)
      throw new Error(`Unsupported architecture: ${arch}`)
  }
}