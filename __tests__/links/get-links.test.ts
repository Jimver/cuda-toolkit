import {LinuxLinks} from '../../src/links/linux-links'
import {WindowsLinks} from '../../src/links/windows-links'
import {getLinks} from '../../src/links/get-links'

test.concurrent('getLinks gives a valid ILinks class', async () => {
  const links = await getLinks()
  expect(
    links instanceof LinuxLinks || links instanceof WindowsLinks
  ).toBeTruthy()
})
