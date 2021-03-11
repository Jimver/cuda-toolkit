import {SemVer} from 'semver'
import {getVersion} from '../src/version'

test('Successfully parse correct version', async () => {
  const versionString = '11.2.2'
  const version = await getVersion(versionString)
  expect(version).toBeInstanceOf(SemVer)
  expect(version.compare(new SemVer(versionString))).toBe(0)
})

test('Expect error to be thrown on invalid version string', async () => {
  const versionString = 'invalid version string that does not conform to semver'
  await expect(getVersion(versionString)).rejects.toThrow(
    TypeError(`Invalid Version: ${versionString}`)
  )
})

test('Expect error to be thrown on unavailable version', async () => {
  const versionString = '0.0.1'
  await expect(getVersion(versionString)).rejects.toThrowError(
    `Version not available: ${versionString}`
  )
})
