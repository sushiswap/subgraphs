import { BigInt } from "@graphprotocol/graph-ts";
import { User } from "../../generated/schema";

export function createUser(addy: string): User {
  let user = new User(addy)
  user.routeCount = BigInt.fromI32(0)

  return user
}