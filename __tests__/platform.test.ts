import {OSType, getOs} from '../src/platform'
import os from 'os'

test.concurrent('Return either windows of linux platform', async () => {
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
      expect(getOs()).rejects.toThrow(`Unsupported OS: ${osString}`)
      return
  }
  const osPlatform = await getOs()
  expect(osPlatform).toBe(expected)
})
