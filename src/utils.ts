import { dirname } from "path"
import { mkdirSync, existsSync } from "fs"
import { LowSync, MemorySync, JSONFileSync } from "lowdb"
import { defineModel } from "./Model"

export type InMemoryModelOptions<D> = {
  seeds: () => D[]
}
export function defineInMemoryModel<D>(options: InMemoryModelOptions<D>) {
  const adapter = new MemorySync<D[]>()
  const db = new LowSync<D[]>(adapter)
  return defineModel({ db, seeds: options.seeds })
}

export type InJSONFileModelOptions<D> = {
  file: string
  seeds: () => D[]
}
export function defineInJSONFileModel<D>(options: InJSONFileModelOptions<D>) {
  const adapter = new JSONFileSync<D[]>(options.file)
  const db = new LowSync<D[]>(adapter)
  return defineModel({ db, seeds: options.seeds })
}

export function filePathExistsOrCreate(file: string) {
  const dir = dirname(file)
  dir && !existsSync(dir) && mkdirSync(dir)
  return true
}
