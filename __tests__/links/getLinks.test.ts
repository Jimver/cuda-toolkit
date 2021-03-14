import {getLinks} from '../../src/links/getLinks'
import {LinuxLinks} from '../../src/links/linuxLinks'
import {WindowsLinks} from '../../src/links/windowsLinks'

test.concurrent('getLinks gives a valid ILinks class', async () => {
  const links = await getLinks()
  expect(
    links instanceof LinuxLinks || links instanceof WindowsLinks
  ).toBeTruthy()
})
