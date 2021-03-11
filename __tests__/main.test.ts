import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'

// shows how the runner will run a javascript action with env / stdout protocol
test('runs action', () => {
  process.env['INPUT_CUDA'] = '11.2.2'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  try {
    const result = cp.execFileSync(np, [ip], options).toString()
    // eslint-disable-next-line no-console
    console.log(`Result: ${result}`)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
    // eslint-disable-next-line no-console
    console.log(err.stdout.toString())
  }
})
