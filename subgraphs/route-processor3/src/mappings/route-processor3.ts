import { RouteProcessor, Route, User } from "../../generated/schema"
import { RouteProcessor3 as RouteProcessorABI } from "../../generated/RouteProcessor3/RouteProcessor3"
import { BigInt, Address, ethereum, log } from "@graphprotocol/graph-ts"
import { Route as RouteEvent } from "../../generated/templates/RouteProcessor3/RouteProcessor3"
import { RouteProcessor_ADDRESS } from "../constants"
import { createRoute } from "../utils/route"
import { createUser } from "../utils/users"

export function handleRoute(event: RouteEvent): void {
  let routeProcessor = RouteProcessor.load(RouteProcessor_ADDRESS.toHex())
  if (routeProcessor == null) {
    routeProcessor = new RouteProcessor(RouteProcessor_ADDRESS.toHex())
    routeProcessor.routeCount = BigInt.fromI32(0)
    routeProcessor.save()
  }

  let route = createRoute(event)
  route.routeProcessor = routeProcessor.id
  route.save()

  let user = User.load(event.params.user.toHex())
  if (user == null) user = createUser(event.params.user)
  user.save()

  routeProcessor.routeCount = routeProcessor.routeCount.plus(BigInt.fromI32(1))
  routeProcessor.save()
} 