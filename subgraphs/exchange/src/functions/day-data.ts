import { ethereum } from "@graphprotocol/graph-ts"
import { DayData } from "../../generated/schema"
import { getOrCreateFactory } from "./factory"

export function getOrCreateDayData(event: ethereum.Event): DayData {
    const id = event.block.timestamp.toI32() / 86400
  
    let dayData = DayData.load(id.toString())
  
    if (dayData === null) {
      const factory = getOrCreateFactory()
      dayData = new DayData(id.toString())
      dayData.factory = factory.id
      dayData.date = id * 86400
      dayData.liquidityUSD = factory.liquidityUSD
      dayData.liquidityETH = factory.liquidityETH
      dayData.txCount = factory.txCount
    }
  
    return dayData as DayData
  }
  
  export function updateDayData(event: ethereum.Event): DayData {
    const factory = getOrCreateFactory()
  
    const dayData = getOrCreateDayData(event)
  
    dayData.liquidityUSD = factory.liquidityUSD
    dayData.liquidityETH = factory.liquidityETH
    dayData.txCount = factory.txCount
  
    dayData.save()
  
    return dayData as DayData
  }
  