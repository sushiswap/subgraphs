
import { CreateVesting } from "../../generated/FuroVesting/FuroVesting";
import { Product } from "../constants";
import { handleUser } from "../functions";


export function onCreateVesting(event: CreateVesting): void {
    handleUser(event.params.owner, event, Product.FURO)
    handleUser(event.params.recipient, event, Product.FURO)
}
