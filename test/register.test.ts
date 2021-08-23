import Fastify from 'fastify'
import * as path from 'path'
import FastifyBree from '../lib'

describe('register bree', function () {
  test('successful registered', async function () {
    const fastify = Fastify()
    await fastify.register(FastifyBree, {
      customOptions: { root: path.join(__dirname, 'jobs') },
      autoStart: true
    })
  })
})
