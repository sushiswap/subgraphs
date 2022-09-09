// import { Point } from "../../generated/schema";
// import { SetPointsCall } from "../../generated/MISOMarket/PointList";
// import { getPointList } from "../functions";
// import { log } from "@graphprotocol/graph-ts";


// export function onSetPoints(event: SetPointsCall): void {
//   log.warning("onSetPoints", [])
//   const pointList = getPointList(event.from.toHex())
//     for (let i = 0; i < event.inputs._accounts.length; i++) {
//         event.inputs._accounts[i].toHex()
//         const point = new Point(event.inputs._accounts[i].toHex().concat(":").concat(event.from.toHex()))
//         point.auction = pointList.auction
//         point.amount = event.inputs._amounts[i]
//         point.save()
//     }
// }