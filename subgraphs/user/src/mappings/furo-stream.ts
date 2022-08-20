
import { handleUser } from "../functions";
import { Product } from "../constants";
import { CreateStream } from "../../generated/FuroStream/FuroStream";

export function onCreateStream(event: CreateStream): void {
    handleUser(event.params.sender, event, Product.FURO)
    handleUser(event.params.recipient, event, Product.FURO)
}
