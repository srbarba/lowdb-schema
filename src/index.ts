import { get, set, findIndex, find, filter, reverse } from "lodash"
import type { Low, LowSync } from "lowdb"
import type { RecordPaths, GetPathValue } from "./utils"

type Database<D> = Low<D> | LowSync<D>

interface ModelDataProps<D> {
  model: Model<D>
  data: D
  isNew: boolean
}

class ModelData<D extends Record<string, any>> {
  model: Model<D>
  data: D
  isNew: boolean
  isSaved: boolean

  constructor(props: ModelDataProps<D>) {
    this.model = props.model
    this.data = props.data
    this.isNew = props.isNew
    this.isSaved = !props.isNew
  }

  static create<D>(options: Omit<ModelDataProps<D>, "isNew">) {
    return ModelData.toModelData({
      model: options.model,
      data: options.data,
      isNew: true,
    })
  }

  static toModelData<D>(options: ModelDataProps<D>) {
    return new ModelData({
      model: options.model,
      data: options.data,
      isNew: options.isNew,
    })
  }

  get index() {
    return findIndex(this.model.data, { id: this.data.id })
  }

  get<P extends RecordPaths<D>, V extends GetPathValue<D, P>>(
    path: P,
    defaultValue?: V,
  ) {
    return get(this.data, path.replace(/\.$/, ""), defaultValue)
  }

  set<P extends RecordPaths<D>, V extends GetPathValue<D, P>>(
    path: P,
    value: V,
  ) {
    this.isSaved = false
    return set(this.data, path.replace(/\.$/, ""), value)
  }

  save() {
    if (this.index < 0) {
      this.model.data.push(this.data)
    } else {
      this.model.data.splice(this.index, 1, this.data)
    }
    this.isNew = false
    this.isSaved = true
    this.model.save()
  }

  update(values: Partial<D>) {
    for (const key in values) {
      const value = values[key]
      set(this.data, key, value)
    }
    this.save()
  }

  destroy() {
    if (this.index >= 0) {
      this.model.data.splice(this.index, 1)
    }
    this.model.save()
    return this
  }

  valueOf() {
    return this.data
  }
}

function createModelData<D>(model: Model<D>, data: D) {
  return toModelData(model)(true)(data)
}
function toModelData<D>(model: Model<D>) {
  return (isNew: boolean) => (data: D) => new ModelData({ model, data, isNew })
}

type ModelProps<D> = {
  db: Database<D[]>
  seeds: () => D[]
}
export class Model<D> {
  db: Database<D[]>
  seeds: () => D[]

  constructor(props: ModelProps<D>) {
    this.db = props.db
    this.seeds = props.seeds
  }

  get data() {
    if (this.db.data === null) {
      this.db.read()
      this.db.data ||= this.seeds?.()
    }
    return this.db.data || ([] as D[])
  }

  save() {
    this.db.write()
    return this
  }

  reload() {
    this.db.read()
    this.db.data ||= this.seeds?.()
    return this
  }

  all() {
    return this.data.map(toModelData(this)(false))
  }

  filter(values: Partial<D>) {
    return (filter(this.data, values) as D[]).map(toModelData(this)(false))
  }

  find(values: Partial<D>) {
    const data = find(this.data, values) as D
    return data ? toModelData(this)(false)(data) : undefined
  }

  first() {
    const first = this.data[0]
    return first ? toModelData(this)(false)(first) : undefined
  }

  last() {
    const first = reverse(this.data)[0]
    return first ? toModelData(this)(false)(first) : undefined
  }

  create(initial: D) {
    return createModelData(this, initial)
  }

  add(initial: D) {
    const model = this.create(initial)
    model.save()
    return model
  }
}

export function defineModel<D>({ db, seeds }: ModelProps<D>) {
  return Object.freeze(new Model({ db, seeds }))
}
