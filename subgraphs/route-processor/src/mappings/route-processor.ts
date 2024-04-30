import { RouteProcessor, User } from "../../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"
import { Route as RouteEvent } from "../../generated/RouteProcessor/RouteProcessor"
import { RouteProcessor_ADDRESS } from "../constants"
import { createRoute } from "../utils/route"
import { createUser } from "../utils/users"

export function handleRoute(event: RouteEvent): void {
  let routeProcessor = RouteProcessor.load(RouteProcessor_ADDRESS.toHex())
  if (routeProcessor == null) {
    routeProcessor = new RouteProcessor(RouteProcessor_ADDRESS.toHex())
    routeProcessor.routeCount = BigInt.fromI32(0)
    routeProcessor.userCount = BigInt.fromI32(0)
    routeProcessor.save()
  }

  let route = createRoute(event)
  route.save()

  let user = User.load(event.params.from.toHex())
  if (user == null) {
    user = createUser(event.params.from.toHex())
    routeProcessor.userCount = routeProcessor.userCount.plus(BigInt.fromI32(1))
  }
  user.save()

  routeProcessor.routeCount = routeProcessor.routeCount.plus(BigInt.fromI32(1))
  routeProcessor.save()
}