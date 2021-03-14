import {SemVer} from 'semver'
import {Method} from '../src/method'
import {getVersion} from '../src/version'

test.concurrent.each<Method>(['local', 'network'])(
  'Successfully parse correct version for method %s',
  async method => {
    const versionString = '11.2.2'
    const version = await getVersion(versionString, method)
    expect(version).toBeInstanceOf(SemVer)
    expect(version.compare(new SemVer(versionString))).toBe(0)
  }
)

test.concurrent.each<Method>(['local', 'network'])(
  'Expect error to be thrown on invalid version string for method %s',
  async method => {
    const versionString =
      'invalid version string that does not conform to semver'
    await expect(getVersion(versionString, method)).rejects.toThrow(
      TypeError(`Invalid Version: ${versionString}`)
    )
  }
)

test.concurrent.each<Method>(['local', 'network'])(
  'Expect error to be thrown on unavailable version for method %s',
  async method => {
    const versionString = '0.0.1'
    await expect(getVersion(versionString, method)).rejects.toThrowError(
      `Version not available: ${versionString}`
    )
  }
)
