
// import { Address, log } from '@graphprotocol/graph-ts'
// import { PointList } from '../../generated/schema'
// import { PointList as PointListContract } from '../../generated/templates'

// export function createPointList(pointListAddress: string): PointList {
//   const pointList = new PointList(pointListAddress)
//   pointList.save()
//   log.warning("prepare template", [])
//   PointListContract.create(Address.fromString(pointListAddress))
//   log.warning("created template", [])
//   return pointList
// }

// export function getPointList(pointListAddress: string): PointList {
//   return PointList.load(pointListAddress) as PointList
// }
