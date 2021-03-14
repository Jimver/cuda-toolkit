export type Method = 'local' | 'network'

export function parseMethod(methodString: string): Method {
  switch (methodString) {
    case 'local':
      return 'local'
    case 'network':
      return 'network'
    default:
      throw new Error(`Invalid method string: ${methodString}`)
  }
}
