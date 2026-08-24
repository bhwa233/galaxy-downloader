import { spawn } from 'node:child_process'

const retryableError = /\[code:\s*971\]/i
const maxAttempts = Number.parseInt(process.env.CF_DEPLOY_MAX_ATTEMPTS ?? '4', 10)
const baseDelayMs = Number.parseInt(process.env.CF_DEPLOY_RETRY_DELAY_MS ?? '60000', 10)
const deployArguments = ['exec', 'vinext', 'deploy', ...process.argv.slice(2)]

function runDeploy() {
  return new Promise((resolve) => {
    const child = spawn('pnpm', deployArguments, {
      env: process.env,
      stdio: ['inherit', 'pipe', 'pipe'],
    })
    let output = ''

    for (const stream of [child.stdout, child.stderr]) {
      stream.on('data', (chunk) => {
        output += chunk
        process.stdout.write(chunk)
      })
    }

    child.on('close', (code, signal) => resolve({ code, signal, output }))
    child.on('error', (error) => resolve({ code: 1, signal: null, output: `${output}\n${error.message}` }))
  })
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const result = await runDeploy()

  if (result.code === 0) {
    process.exit(0)
  }

  const canRetry = retryableError.test(result.output) && attempt < maxAttempts
  if (!canRetry) {
    process.exit(result.code ?? 1)
  }

  const delayMs = baseDelayMs * attempt
  console.error(
    `Cloudflare API rate limit (971); retrying deployment ${attempt + 1}/${maxAttempts} in ${Math.ceil(delayMs / 1000)} seconds.`
  )
  await new Promise((resolve) => setTimeout(resolve, delayMs))
}
