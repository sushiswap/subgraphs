import { Route } from "../../generated/schema";
import { Route as RouteEvent } from "../../generated/RouteProcessor/RouteProcessor";

export function createRoute(event: RouteEvent): Route {
  let route = new Route(event.transaction.hash.toHex().concat('-').concat(event.transaction.index.toString()))
  route.from = event.params.from
  route.to = event.params.to
  route.tokenIn = event.params.tokenIn
  route.tokenOut = event.params.tokenOut
  route.amountIn = event.params.amountIn
  route.amountOutMin = event.params.amountOutMin
  route.amountOut = event.params.amountOut
  route.timestamp = event.block.timestamp

  return route
}