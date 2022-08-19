import { handleUser } from "../functions";
import { Deposit, EmergencyWithdraw, Withdraw } from "../../generated/MasterChefV1/MasterChefV1";
import { Product } from "../constants";

export function withdraw(event: Withdraw): void {
    handleUser(event.params.user, event, Product.MASTER_CHEF_V1)
}

export function emergencyWithdraw(event: EmergencyWithdraw): void {
    handleUser(event.params.user, event, Product.MASTER_CHEF_V1)
}

export function deposit(event: Deposit): void {
    handleUser(event.params.user, event, Product.MASTER_CHEF_V1)
}