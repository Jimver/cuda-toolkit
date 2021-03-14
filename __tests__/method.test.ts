import {parseMethod} from '../src/method'

test.concurrent.each(['local', 'network'])(
  'Parse %s method',
  async methodString => {
    const parsed = parseMethod(methodString)
    expect(parsed).toBe(methodString)
  }
)

test('Parse invalid method', async () => {
  const invalidMethod = 'invalidMethodString'
  expect(() => parseMethod(invalidMethod)).toThrowError(
    `Invalid method string: ${invalidMethod}`
  )
})
