import { LogFillOrder, LogOrderCancelled } from "../../generated/LimitOrder/LimitOrder";
import { Product } from "../constants";
import { handleUser } from "../functions";

export function onFillOrder(event: LogFillOrder): void {
    handleUser(event.params.receiver, event, Product.LIMIT_ORDER)
}

export function onOrderCancelled(event: LogOrderCancelled): void {
    handleUser(event.params.user, event, Product.LIMIT_ORDER)
}
