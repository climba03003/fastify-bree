import Bree from 'bree'
import Fastify, { FastifyInstance } from 'fastify'
import * as path from 'path'
import FastifyBree from '../lib'

describe('instance bree', function () {
  let fastify: FastifyInstance

  beforeAll(async function () {
    (process as any)[Symbol.for('ts-node.register.instance')] = true
    fastify = Fastify()
    await fastify.register(FastifyBree, {
      customOptions: { root: path.join(__dirname, 'jobs') },
      autoStart: true
    })
    await fastify.ready()
  })

  test('fastify.bree', function () {
    expect(fastify.bree).toBeInstanceOf(Bree)
  })

  test('fastify.bree.register - function', function () {
    fastify.bree.register({
      name: 'test-1',
      path: function () {
        expect(true).toStrictEqual(true)
      }
    })
    fastify.bree.start('test-1')
  })

  test('fastify.bree.register - name', function () {
    fastify.bree.register({
      name: 'console'
    })
    fastify.bree.start('console')
  })

  test('fastify.bree.register - path', function () {
    fastify.bree.register({
      name: 'console named',
      path: path.join(__dirname, 'jobs', 'console.ts')
    })
    fastify.bree.start('console named')
  })

  test('fastify.bree.register - with worker option', function () {
    fastify.bree.register({
      name: 'console worker option',
      path: path.join(__dirname, 'jobs', 'console.ts'),
      worker: {}
    })
    fastify.bree.start('console worker option')
  })

  test('fastify.bree.register - with worker data option', function () {
    fastify.bree.register({
      name: 'console workerData option',
      path: path.join(__dirname, 'jobs', 'console.ts'),
      worker: {
        workerData: {}
      }
    })
    fastify.bree.start('console workerData option')
  })

  test('fastify.bree.register - transpileOnly', function () {
    fastify.bree.register({
      name: 'console worker transpileOnly',
      path: path.join(__dirname, 'jobs', 'console.ts'),
      tsNodeOptions: {
        transpileOnly: true
      },
      worker: {}
    })
    fastify.bree.start('console worker transpileOnly')
  })
})
