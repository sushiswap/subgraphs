import { Address } from "@graphprotocol/graph-ts";
import { test, assert, clearStore } from "matchstick-as/assembly/index";
import { FACTORY_ADDRESS } from "../src/constants/addresses";
import { onPairCreated } from "../src/mappings/factory";
import { createPairCreatedEvent, getOrCreateTokenMock } from "./mocks";

// TODO: tests on token price
// tokenKpi
test('onPairCreated, creates token, tokenPrice, tokenKpi', () => {
    const usdc = Address.fromString('0xb7a4f3e9097c08da09517b5ab877f7a917224ede')
    const usdt = Address.fromString('0x07de306ff27a2b630b1141956844eb1552b956b5')
    const pair = Address.fromString('0x0000000000000000000000000000000000000420')
  
    let pairCreatedEvent = createPairCreatedEvent(FACTORY_ADDRESS, usdc, usdt, pair)
    let pairAssetId0 = pair.toHex().concat(":asset:0")
    let pairAssetId1 = pair.toHex().concat(":asset:1")
   
    getOrCreateTokenMock(usdc.toHex(), 6, 'USD Coin', 'USDC')
    getOrCreateTokenMock(usdt.toHex(), 6, 'Tether USD', 'USDT')
    onPairCreated(pairCreatedEvent)
  
    assert.fieldEquals('Pair', pair.toHex(), 'id', pair.toHex())
    assert.fieldEquals('PairAsset', pairAssetId0, 'id', pairAssetId0)
    assert.fieldEquals('PairAsset', pairAssetId1, 'id', pairAssetId1)

  
  
    clearStore()
  })


test('When tokens are whitelisted, a WhitelistedPair entity is created', () => { 
    
})