import Fastify from 'fastify'
import * as path from 'path'
import t from 'tap'
import FastifyBree from '../lib'

t.test('register bree', function (t) {
  t.plan(3)

  t.test('without options', async function (t) {
    t.plan(1)
    const fastify = Fastify()
    await fastify.register(FastifyBree)
    t.pass('can be registered without options')
  })

  t.test('customOptions', async function (t) {
    t.plan(1)
    const fastify = Fastify()
    await fastify.register(FastifyBree, {
      customOptions: { root: path.join(__dirname, 'jobs') }
    })
    t.pass('can be registered with customOptions')
  })

  t.test('custom logger', async function (t) {
    t.plan(1)
    const fastify = Fastify()
    await fastify.register(FastifyBree, {
      customOptions: { logger: console as any }
    })
    t.pass('can be registered with custom logger')
  })
})
