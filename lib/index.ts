import BreeClass, { BreeOptions } from 'bree'
import { FastifyPluginAsync } from 'fastify'
import FastifyPlugin from 'fastify-plugin'
import * as fs from 'fs'
import { BreeTS } from './plugin'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Bree = require('bree')

function isTSNode (options?: { ts?: boolean }): boolean {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  return options?.ts ?? !!(process as any)[Symbol.for('ts-node.register.instance')]
}

export interface TSNodeOptions {
  transpileOnly?: boolean
}

export interface FastifyBreeOptions {
  customOptions?: BreeOptions
  autoStart?: boolean
  autoClose?: boolean
}

declare module 'fastify' {
  interface FastifyInstance {
    bree: CustomBree
  }
}

declare module 'bree' {
  interface Job {
    tsNodeOptions?: TSNodeOptions
  }
}

// For future customization
export interface CustomBree extends BreeClass {
}

const plugin: FastifyPluginAsync<FastifyBreeOptions> = async function (fastify, options) {
  // default auto start to true
  const opt: Required<FastifyBreeOptions> = Object.assign({ customOptions: {}, autoStart: true, autoClose: true }, options)
  const { customOptions, autoStart, autoClose } = opt

  if (typeof customOptions.root === 'string') {
    await fs.promises.mkdir(customOptions.root, { recursive: true })
  }

  // default options
  const defaultOption: BreeOptions = {
    root: false,
    // we suppress all initial error
    silenceRootCheckError: true,
    jobs: []
  }
  const o = { ...defaultOption, ...customOptions }
  if (typeof o.logger !== 'object') {
    o.logger = fastify.log.child({ plugin: 'fastify-bree' }) as any
  }

  if (isTSNode()) Bree.extend(BreeTS)
  const bree: CustomBree = new Bree(o) as CustomBree

  fastify.decorate('bree', bree)

  if (autoStart) {
    fastify.addHook('onReady', async function () { await bree.start() })
  }

  if (autoClose) {
    fastify.addHook('onClose', async function () { await bree.stop() })
  }
}

export const FastifyBree = FastifyPlugin(plugin, {
  fastify: '4.x',
  name: 'fastify-bree',
  dependencies: []
})
export default FastifyBree
