import { Address, BigInt } from '@graphprotocol/graph-ts'
import { BIG_INT_ONE } from '../constants'
import { ERC20 } from '../../generated/Factory/ERC20'
import { NameBytes32 } from '../../generated/Factory/NameBytes32'
import { SymbolBytes32 } from '../../generated/Factory/SymbolBytes32'
import { Token } from '../../generated/schema'
import { getOrCreateFactory } from './factory'
import { createTokenKpi } from './token-kpi'
import { createTokenPrice } from './token-price'

export function getOrCreateToken(id: string): Token {
  let token = Token.load(id)

  if (token === null) {
    token = new Token(id)
    createTokenPrice(id)
    createTokenKpi(id)

    const contract = ERC20.bind(Address.fromString(id))

    const decimals = getTokenDecimals(contract)
    const name = getTokenName(contract)
    const symbol = getTokenSymbol(contract)
    token.price = id
    token.kpi = id
    token.name = name.value
    token.nameSuccess = name.success
    token.symbol = symbol.value
    token.symbolSuccess = symbol.success
    token.decimals = decimals.value
    token.decimalsSuccess = decimals.success

    token.save()
    const factory = getOrCreateFactory()
    factory.tokenCount = factory.tokenCount.plus(BIG_INT_ONE)
    factory.save()
  }

  return token as Token
}

class Symbol {
  success: boolean
  value: string
}

function getTokenSymbol(contract: ERC20): Symbol {
  const symbol = contract.try_symbol()
  if (!symbol.reverted) {
    return { success: true, value: symbol.value.toString() }
  }

  const symbolBytes32Contract = SymbolBytes32.bind(contract._address)

  const symbolBytes32 = symbolBytes32Contract.try_symbol()

  if (
    !symbolBytes32.reverted &&
    symbolBytes32.value.toHex() != '0x0000000000000000000000000000000000000000000000000000000000000001'
  ) {
    return { success: true, value: symbolBytes32.value.toString() }
  }

  return { success: false, value: '???' }
}

class Name {
  success: boolean
  value: string
}

function getTokenName(contract: ERC20): Name {
  const name = contract.try_name()

  if (!name.reverted) {
    return { success: true, value: name.value.toString() }
  }

  const nameBytes32Contract = NameBytes32.bind(contract._address)

  const nameBytes32 = nameBytes32Contract.try_name()

  if (
    !nameBytes32.reverted &&
    nameBytes32.value.toHex() != '0x0000000000000000000000000000000000000000000000000000000000000001'
  ) {
    return { success: true, value: nameBytes32.value.toString() }
  }

  return { success: false, value: '???' }
}

class Decimal {
  success: boolean
  value: BigInt
}

function getTokenDecimals(contract: ERC20): Decimal {
  const decimals = contract.try_decimals()

  if (!decimals.reverted) {
    return { success: true, value: BigInt.fromI32(decimals.value) }
  }

  return { success: false, value: BigInt.fromI32(18) }
}
