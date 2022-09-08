import { PluginFunc } from 'bree'
import { Worker } from 'worker_threads'

export const BreeTS: PluginFunc = function (options, Bree): void {
  options = options ?? {}

  // @ts-expect-error
  const oldInit = Bree.prototype.init

  // we update init script, so the options is match for TypeScript
  // @ts-expect-error
  Bree.prototype.init = async function () {
    // add `.ts` extension to supported list
    if (!this.config.acceptedExtensions.includes('.ts')) {
      this.config.acceptedExtensions.push('.ts')
    }

    // if it use default option, we change it to `ts`
    if (this.config.defaultExtension === 'js') {
      this.config.defaultExtension = 'ts'
    }

    return oldInit.bind(this)()
  }

  const oldCreateWorker = Bree.prototype.createWorker

  // we update the create worker function
  // so it use the correct worker
  Bree.prototype.createWorker = function (filename: string, options: any) {
    if (filename.endsWith('.ts')) {
      options.eval = true
      options.workerData.__filename = filename
      options.workerData.__tsNodeOptions = options.workerData.job.tsNodeOptions

      return new Worker(`
const workerData = require('worker_threads').workerData
require('ts-node').register(workerData.__tsNodeOptions)
require(workerData.__filename)
      `, options)
    }

    return oldCreateWorker(filename, options)
  }
}
