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
  })

  test('fastify.bree.register - name', function () {
    fastify.bree.register({
      name: 'console'
    })
  })

  test('fastify.bree.register - path', function () {
    fastify.bree.register({
      name: 'console named',
      path: 'console.ts'
    })
  })

  test('fastify.bree.register - with worker option', function () {
    fastify.bree.register({
      name: 'console worker option',
      path: 'console.ts',
      worker: {}
    })
  })

  test('fastify.bree.register - with worker data option', function () {
    fastify.bree.register({
      name: 'console workerData option',
      path: 'console.ts',
      worker: {
        workerData: {}
      }
    })
  })
})
