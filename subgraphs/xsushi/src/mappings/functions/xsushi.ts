import { BigInt } from "@graphprotocol/graph-ts";
import { XSushi } from "../../../generated/schema";
import { XSUSHI } from "../constants";

export function getOrCreateXSushi(): XSushi { 
    let xSushi = XSushi.load(XSUSHI)

    if (xSushi === null) {
      xSushi = new XSushi(XSUSHI)
      xSushi.save()
      return xSushi
    }
    
    return xSushi as XSushi
}