import { Product } from "../constants";
import { handleUser } from "../functions";
import { LogDeposit } from "../../generated/BentoBox/BentoBox";

export function onLogDeposit(event: LogDeposit): void {
    handleUser(event.params.from, event, Product.BENTOBOX)
}