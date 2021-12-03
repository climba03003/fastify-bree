import Fastify from 'fastify'
import * as path from 'path'
import FastifyBree from '../lib'

describe('register bree', function () {
  test('without options', async function () {
    const fastify = Fastify()
    await fastify.register(FastifyBree)
  })

  test('customOptions', async function () {
    const fastify = Fastify()
    await fastify.register(FastifyBree, {
      customOptions: { root: path.join(__dirname, 'jobs') }
    })
  })

  test('custom logger', async function () {
    const fastify = Fastify()
    await fastify.register(FastifyBree, {
      customOptions: { logger: console as any }
    })
  })
})
