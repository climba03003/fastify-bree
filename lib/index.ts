import BreeClass, { type BreeOptions, type JobOptions } from 'bree'
import { type FastifyPluginAsync } from 'fastify'
import FastifyPlugin from 'fastify-plugin'
import * as fs from 'fs'
import { BreeTS } from './plugin'

function isTSNode (options?: { ts?: boolean }): boolean {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  return options?.ts ?? !!(process as any)[Symbol.for('ts-node.register.instance')]
}

// I'm beat by breejs/bree types again
// We probably need to duplicate the types instead of extend
type AsyncFunction<A extends any[], O> = (...args: A) => Promise<O>

interface CustomJobOptions extends JobOptions {
  tsNodeOptions?: TSNodeOptions
}

interface CustomBreeOptions extends Omit<BreeOptions, 'jobs'> {
  jobs?: Array<string | (() => void) | CustomJobOptions>
}

export interface TSNodeOptions {
  transpileOnly?: boolean
}

export interface FastifyBreeOptions {
  customOptions?: CustomBreeOptions
  autoStart?: boolean
  autoClose?: boolean
}

declare module 'fastify' {
  interface FastifyInstance {
    bree: CustomBree
  }
}

// For future customization
export interface CustomBree extends Omit<BreeClass, 'add'> {
  add: AsyncFunction<
  [
      jobs:
        | string
        | (() => void)
        | CustomJobOptions
        | Array<string | (() => void) | CustomJobOptions>
  ],
  void
  >
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

  if (isTSNode()) BreeClass.extend(BreeTS)
  const bree: CustomBree = new BreeClass(o) as CustomBree

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
