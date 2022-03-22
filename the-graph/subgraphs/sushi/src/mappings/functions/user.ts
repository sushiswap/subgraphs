import { Transfer as TransferEvent } from "../../../generated/ERC20/ERC20"
import { User } from "../../../generated/schema"
import { UserType } from "./user-type"

export function createUser(id: string, event: TransferEvent): User {
  const user = new User(id)
  user.creationBlock = event.block.number
  user.creationTimestamp = event.block.timestamp
  user.modifiedBlock = event.block.number
  user.modifiedTimestamp = event.block.timestamp
  user.save()
  return user
}

export function getOrCreateUser(type: UserType, event: TransferEvent): User {
  const id = type === UserType.SENDER ? event.params.from.toHex() : event.params.to.toHex()
  const user = User.load(id)

  if (user === null) {
    return createUser(id, event)
  }

  return user as User
}
