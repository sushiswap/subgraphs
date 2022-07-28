
import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Operation } from '../../generated/schema'
import { getOrCreateAction } from './action'


function createOperation(id: string, action: i32, value: BigInt, data: Bytes): Operation {
  getOrCreateAction(action)
  const operation = new Operation(id)
  operation.action = action.toString()
  operation.value = value
  operation.data = data
  operation.save()

  return operation
}

export function createOperations(id: string, actions: i32[], values: BigInt[], datas: Bytes[]): string[] {
  let operationIds: string[] = []
  for(let i = 0; i < actions.length; i++) {
    const operationId = id.concat(":").concat(i.toString())
    operationIds.push(operationId)
    createOperation(operationId, actions[i], values[i], datas[i])
  }
  return operationIds
}

