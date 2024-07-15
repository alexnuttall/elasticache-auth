import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import { SignatureV4 } from '@aws-sdk/signature-v4'
import { HttpRequest } from '@aws-sdk/protocol-http'
import { Sha256 } from '@aws-crypto/sha256-js'
import { formatUrl } from '@aws-sdk/util-format-url'

const { accessKeyId, secretAccessKey, sessionToken, environment, cacheName } = yargs(
  hideBin(process.argv)
)
  .options({
    environment: {
      type: 'string',
      demandOption: true,
    },
    accessKeyId: {
      type: 'string',
      demandOption: true,
    },
    secretAccessKey: {
      type: 'string',
      demandOption: true,
    },
    sessionToken: {
      type: 'string',
      demandOption: true,
    },
    environment: {
      type: 'string',
      demandOption: true,
    },
    cacheName: {
      // e.g. comms-pl-dev2-acct-nhsapp-users
      type: 'string',
      demandOption: true,
    },
  })
  .parseSync()

const run = async () => {
  const signer = new SignatureV4({
    service: 'elasticache',
    region: 'eu-west-2',
    credentials: {
      accessKeyId,
      secretAccessKey,
      sessionToken,
    },
    sha256: Sha256,
  })

  const request = new HttpRequest({
    method: 'GET',
    protocol: '<remove>',
    hostname: cacheName,
    port: 6379,
    query: {
      Action: 'connect',
      User: environment,
    },
    headers: {
      host: cacheName,
    },
  })

  const presigned = await signer.presign(request, {
    expiresIn: 900,
  })

  console.log(formatUrl(presigned).replace('<remove>://', ''))
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
