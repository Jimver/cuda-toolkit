import { parseMethod } from '../src/method'

test.concurrent.each(['local', 'network'])(
  'Parse %s method',
  async (methodString) => {
    const parsed = parseMethod(methodString)
    expect(parsed).toBe(methodString)
  }
)

test.concurrent('Parse invalid method', async () => {
  const invalidMethod = 'invalidMethodString'
  expect(() => parseMethod(invalidMethod)).toThrow(
    `Invalid method string: ${invalidMethod}`
  )
})
