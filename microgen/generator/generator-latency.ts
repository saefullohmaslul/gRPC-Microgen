import rimraf from 'rimraf'
import { PROTOS_PATH } from '../global/constant'

export default class GeneratorLatency {
  public deleteLatency() {
    rimraf.sync(PROTOS_PATH)
  }
}