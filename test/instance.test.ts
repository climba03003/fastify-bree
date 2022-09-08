import Bree from 'bree'
import Fastify from 'fastify'
import * as path from 'path'
import t from 'tap'
import FastifyBree from '../lib'

t.test('instance bree', async function (t) {
  t.plan(8)

  // we simulate ts-node environment
  ;(process as any)[Symbol.for('ts-node.register.instance')] = true
  const fastify = Fastify()
  await fastify.register(FastifyBree, {
    customOptions: { root: path.join(__dirname, 'jobs') },
    autoStart: true
  })
  await fastify.ready()

  t.teardown(fastify.close)
  t.pass('can start bree instance')

  t.equal(fastify.bree instanceof Bree, true)

  await fastify.bree.add({
    name: 'test-1',
    path: function () {
      return path.join(__dirname, 'jobs', 'console.ts')
    }
  })
  await fastify.bree.start('test-1')
  t.pass('fastify.bree.register - function')

  await fastify.bree.add({
    name: 'console'
  })
  await fastify.bree.start('console')
  t.pass('fastify.bree.register - console')

  await fastify.bree.add({
    name: 'console named',
    path: path.join(__dirname, 'jobs', 'console.ts')
  })
  await fastify.bree.start('console named')
  t.pass('fastify.bree.register - path')

  await fastify.bree.add({
    name: 'console worker option',
    path: path.join(__dirname, 'jobs', 'console.ts'),
    worker: {}
  })
  await fastify.bree.start('console worker option')
  t.pass('fastify.bree.register - with worker option')

  await fastify.bree.add({
    name: 'console workerData option',
    path: path.join(__dirname, 'jobs', 'console.ts'),
    worker: {
      workerData: {}
    }
  })
  await fastify.bree.start('console workerData option')
  t.pass('fastify.bree.register - with worker data option')

  await fastify.bree.add({
    name: 'console worker transpileOnly',
    path: path.join(__dirname, 'jobs', 'console.ts'),
    tsNodeOptions: {
      transpileOnly: true
    },
    worker: {}
  })
  await fastify.bree.start('console worker transpileOnly')
  t.pass('fastify.bree.register - transpileOnly')
})
