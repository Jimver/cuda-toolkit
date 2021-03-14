import {getOs, OSType} from '../src/platform'
import os from 'os'

test.concurrent('Return either windows of linux platform', async () => {
  const osPlatform = await getOs()
  const osString = os.platform()
  let expected: OSType
  switch (osString) {
    case 'win32':
      expected = OSType.windows
      break
    case 'linux':
      expected = OSType.linux
      break
    default:
      throw new Error(`Unexpected platform: ${osString}`)
  }
  expect(osPlatform).toBe(expected)
})
