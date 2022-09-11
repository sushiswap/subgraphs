
import { Address, log } from '@graphprotocol/graph-ts'
import { PointList } from '../../generated/schema'
import { PointList as PointListContract } from '../../generated/templates'

export function getOrCreatePointList(pointListAddress: string): PointList {
    let pointList = PointList.load(pointListAddress)
    if (pointList == null) {
        pointList = new PointList(pointListAddress)
        pointList.save()
        PointListContract.create(Address.fromString(pointListAddress))
    }
    return pointList
}

export function getPointList(pointListAddress: string): PointList {
    return PointList.load(pointListAddress) as PointList
}
