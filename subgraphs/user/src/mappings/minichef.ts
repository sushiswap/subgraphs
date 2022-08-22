import { handleUser } from "../functions";
import { Deposit, EmergencyWithdraw, Withdraw } from "../../generated/MiniChef/MiniChef";
import { Product } from "../constants";

export function withdraw(event: Withdraw): void {
    handleUser(event.params.user, event, Product.MINI_CHEF)
}

export function emergencyWithdraw(event: EmergencyWithdraw): void {
    handleUser(event.params.user, event, Product.MINI_CHEF)
}

export function deposit(event: Deposit): void {
    handleUser(event.params.user, event, Product.MINI_CHEF)
}