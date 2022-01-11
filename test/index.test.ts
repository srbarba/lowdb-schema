import { join, dirname } from "path"
import { mkdirSync, existsSync, unlinkSync } from "fs"
import { describe, it, expect, afterEach, beforeEach } from "vitest"
import { defineModel } from "../src"

type User = {
  id: string
  name: string
  surname: string
  roles?: {
    name: string
  }[]
}
const data = (): User[] => [
  {
    id: "1",
    name: "John",
    surname: "Doe",
    roles: [{ name: "admin" }],
  },
  {
    id: "2",
    name: "Jane",
    surname: "Doe",
    roles: [{ name: "admin" }],
  },
]

describe("find", () => {
  it("returns value by id", () => {
    const UserModel = createInMemoryUserModel()
    const id = data()[0].id
    const matched = UserModel.find({ id })
    expect(matched?.valueOf()).toEqual(data()[0])
  })
  it("returns undefined", () => {
    const UserModel = createInMemoryUserModel()
    const id = "non"
    expect(UserModel.find({ id })).toBeUndefined()
  })
})

describe("all", () => {
  it("returns all values in db", () => {
    const UserModel = createInMemoryUserModel()
    expect(UserModel.all().map((i) => i.valueOf())).toEqual(data())
  })
  it("returns empty list", () => {
    const UserModel = createInMemoryUserModel(() => [] as any)
    expect(UserModel.all()).toEqual([])
  })
})

describe("filter", () => {
  it("returns filtered values in db", () => {
    const filters = { name: "John" }
    const UserModel = createInMemoryUserModel()
    expect(UserModel.filter(filters).length).toEqual(1)
  })
  it("returns empty list", () => {
    const filters = { surname: "Doce" }
    const UserModel = createInMemoryUserModel()
    expect(UserModel.filter(filters).length).toEqual(0)
  })
})

describe("create", () => {
  it("returns non persisted data model", () => {
    const user = { id: "3", name: "Jr", surname: "Doe" }
    const UserModel = createInMemoryUserModel()

    expect(UserModel.create(user).valueOf()).toEqual(user)
    expect(UserModel.find(user)).toBeUndefined()
  })
})

describe("save", () => {
  it("returns persisted data", () => {
    const givenUser = { id: "3", name: "Jr", surname: "Doe" }
    const UserModel = createInMemoryUserModel()
    const userModelData = UserModel.create(givenUser)
    userModelData.save()

    expect(UserModel.find(givenUser)?.valueOf()).toEqual(givenUser)
  })
})

describe("first", () => {
  it("returns first value", () => {
    const UserModel = createInMemoryUserModel()
    const userData = UserModel.first()

    const expectedData = data()[0]
    expect(userData?.valueOf()).toEqual(expectedData)
  })
  it("returns undefined", () => {
    const UserModel = createInMemoryUserModel(() => [] as any)
    expect(UserModel.first()).toBeUndefined()
  })
})

describe("last", () => {
  it("returns last value", () => {
    const UserModel = createInMemoryUserModel()
    const userData = UserModel.last()

    const expectedData = data()[1]
    expect(userData?.valueOf()).toEqual(expectedData)
  })
  it("returns undefined", () => {
    const UserModel = createInMemoryUserModel(() => [] as any)
    expect(UserModel.first()).toBeUndefined()
  })
})

describe("get", () => {
  it("returns value under path", () => {
    const UserModel = createInMemoryUserModel()
    const name = UserModel.first()?.get("name")

    const expectedName = data()[0].name
    expect(name).toEqual(expectedName)
  })
  it("returns nested value under path", () => {
    const UserModel = createInMemoryUserModel()
    const roleName = UserModel.first()?.get("roles.0.name")

    const expectedRoleName = data()[0].roles![0].name
    expect(roleName).toEqual(expectedRoleName)
  })
})

describe("set", () => {
  it("sets data to given path", () => {
    const givenSurname = "Smith"
    const UserModel = createInMemoryUserModel()
    const user = UserModel.first()!
    user.set("surname", givenSurname)
    expect(user.get("surname")).toEqual(givenSurname)
  })

  it("sets nested value under path", () => {
    const givenRoleName = "owner"
    const UserModel = createInMemoryUserModel()
    const user = UserModel.first()!
    user.set("roles.0.name", givenRoleName)
    expect(user.get("roles.0.name")).toEqual(givenRoleName)
  })
})

function createInMemoryUserModel(seeds = data) {
  return defineModel<User>({
    seeds,
  })
}

describe("save", () => {
  const file = join(__dirname, ".temp/users.db.json")
  prepareDb(file)

  it("returns persisted data", () => {
    const givenUser = { id: "3", name: "Jr", surname: "Doe" }
    const UserModel = createInFileUserModel(file)
    const userModelData = UserModel.create(givenUser)
    userModelData.save()

    expect(createInFileUserModel(file).last()?.valueOf()).toEqual(givenUser)
  })

  it("returns updated data", () => {
    const givenSurname = "Smith"
    const UserModel = createInFileUserModel(file)
    const user = UserModel.first()!
    user.set("surname", givenSurname)
    user.save()

    expect(createInFileUserModel(file).first()?.valueOf().surname).toEqual(
      givenSurname,
    )
  })
})

describe("add", () => {
  const file = join(__dirname, ".temp/users.db.json")
  prepareDb(file)

  it("creates and saves user", () => {
    const givenUser = { id: "3", name: "Jr", surname: "Doe" }
    const UserModel = createInFileUserModel(file)
    UserModel.add(givenUser)
    expect(createInFileUserModel(file).last()?.valueOf()).toEqual(givenUser)
  })
})

describe("destroy", () => {
  const file = join(__dirname, ".temp/users.db.json")
  prepareDb(file)

  it("creates and saves user", () => {
    const UserModel = createInFileUserModel(file)
    const user = UserModel.first()!
    user.destroy()
    expect(createInFileUserModel(file).first()?.valueOf()).not.toEqual(
      user.valueOf(),
    )
  })
})

describe("updates", () => {
  const file = join(__dirname, ".temp/users.db.json")
  prepareDb(file)

  it("set given values and saves user", () => {
    const givenSurname = "Smith"
    const UserModel = createInFileUserModel(file)
    const user = UserModel.first()!
    user.update({ surname: givenSurname })
    user.save()

    expect(createInFileUserModel(file).first()?.valueOf().surname).toEqual(
      givenSurname,
    )
  })
})

describe("reload", () => {
  const file = join(__dirname, ".temp/users.db.json")
  prepareDb(file)

  it("reloads db instance data", () => {
    const givenDbConnection = createInFileUserModel(file)
    expect(givenDbConnection.data).toEqual(data())

    const givenUser = { id: "3", name: "Jr", surname: "Doe" }
    const UserModel = createInFileUserModel(file)
    UserModel.add(givenUser)
    expect(givenDbConnection.last()?.valueOf()).not.toEqual(givenUser)

    givenDbConnection.reload()
    expect(givenDbConnection.last()?.valueOf()).toEqual(givenUser)
  })
})

function prepareDb(file: string) {
  beforeEach(() => {
    const dir = dirname(file)
    dir && !existsSync(dir) && mkdirSync(dir)
  })

  afterEach(() => {
    if (existsSync(file)) unlinkSync(file)
  })
}

function createInFileUserModel(file: string, seeds = data) {
  return defineModel<User>({
    file,
    seeds,
  })
}
