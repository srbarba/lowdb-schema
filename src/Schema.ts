import type { Model } from "./Model"
import {
  defineInMemoryModel,
  InMemoryModelOptions,
  defineInJSONFileModel,
  InJSONFileModelOptions,
} from "./utils"

type Schema = Record<string, Model<any>>

type DefineInMemorySchemaOptions = {
  models: Record<string, InMemoryModelOptions<any>>
}

export function defineInMemorySchema<S extends DefineInMemorySchemaOptions>(
  options: S,
) {
  return Object.entries(options.models).reduce((schema, [name, model]) => {
    schema[name] = defineInMemoryModel(model)
    return schema
  }, {} as Schema)
}

type DefineInJSONFileSchemaOptions = {
  models: Record<string, InJSONFileModelOptions<any>>
}

export function defineInJSONFileSchema<S extends DefineInJSONFileSchemaOptions>(
  options: S,
) {
  return Object.entries(options.models).reduce((schema, [name, model]) => {
    schema[name] = defineInJSONFileModel(model)
    return schema
  }, {} as Schema)
}
