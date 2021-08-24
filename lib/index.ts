import BreeClass from 'bree'
import { FastifyPluginAsync } from 'fastify'
import FastifyPlugin from 'fastify-plugin'
import * as fs from 'fs'
import * as path from 'path'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Bree = require('bree')

function isTSNode (options: { ts?: boolean }): boolean {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  return options.ts ?? !!(process as any)[Symbol.for('ts-node.register.instance')]
}

export type BreeOptions = NonNullable<ConstructorParameters<typeof BreeClass>[0]>
export type JobOptions = Exclude<Parameters<BreeClass['add']>[0], string | any[] | Function>

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

export interface CustomBree extends BreeClass {
  register: (jobOptions: JobOptions & { ts?: boolean }) => void
}

function noop (): void {}
const fakeLogger = {
  trace: noop,
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
  log: noop
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
    jobs: []
  }
  const o = { ...defaultOption, ...customOptions }
  // we suppress all initialization error message by using fake logger
  // the main reason is when the root dir is empty it will throw a false positive
  // error
  o.logger = fakeLogger

  const bree: CustomBree = new Bree(o) as CustomBree
  // update to use real logger after initialization
  if (typeof customOptions.logger === 'object') {
    bree.config.logger = customOptions.logger
  } else {
    bree.config.logger = fastify.log.child({ plugin: 'fastify-bree' })
  }

  bree.register = function (jobOptions) {
    let opt = {}
    // if specified path - it should use path to include the script
    if (isTSNode(jobOptions) && typeof jobOptions.path === 'string') {
      opt = normailizeTypeScriptWorkerOption(jobOptions, jobOptions.path)
    // if not specified path - it should use name and concat with root to include the script
    } else if (isTSNode(jobOptions) && typeof customOptions.root === 'string' && typeof jobOptions.name === 'string' && typeof jobOptions.path !== 'function') {
      opt = normailizeTypeScriptWorkerOption(jobOptions, `${path.join(customOptions.root, jobOptions.name)}.ts`)
    // if it do not have path (string) - it should not modify the option
    } else {
      opt = jobOptions
    }
    bree.add(opt)
  }

  fastify.decorate('bree', bree)

  if (autoStart) {
    fastify.addHook('onReady', function () { bree.start() })
  }

  if (autoClose) {
    fastify.addHook('onClose', async function () { await bree.stop() })
  }
}

function normailizeTypeScriptWorkerOption (opt: JobOptions & { worker?: { workerData?: any } }, filename: string): JobOptions & { worker?: { workerData?: any } } {
  const jobOptions: JobOptions & { worker: { workerData?: any } } = { ...opt, path: TypeScriptWorker, worker: { workerData: {} } }
  if (typeof opt.worker === 'object') {
    jobOptions.worker = { ...opt.worker }
    if (typeof opt.worker.workerData === 'object') {
      jobOptions.worker.workerData = { ...(opt.worker as any).workerData }
    } else {
      jobOptions.worker.workerData = {}
    }
  }
  jobOptions.worker.workerData.__filename = filename
  return jobOptions
}

export const FastifyBree = FastifyPlugin(plugin, {
  fastify: '3.x',
  name: 'fastify-bree',
  dependencies: []
})
export default FastifyBree

// export typescript worker
// TODO: better integration for typescript worker
export function TypeScriptWorker (): void {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path = require('path')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('ts-node').register()
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const workerData = require('worker_threads').workerData
  require(path.resolve(__dirname, workerData.__filename))
}
