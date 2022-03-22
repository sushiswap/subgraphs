import { User } from "../../../generated/schema"

export function createUser(id: string): User {
  const user = new User(id)
  user.save()
  return user
}

export function getUser(id: string): User {
  return User.load(id) as User
}

export function getOrCreateUser(id: string): User {
  const user = User.load(id)

  if (user === null) {
    return createUser(id)
  }

  return user as User
}
