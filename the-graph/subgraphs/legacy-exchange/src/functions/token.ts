import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Token, TokenKpi } from '../../generated/schema'
import { createTokenPrice, getOrCreateTokenPrice } from './token-price'

import { ERC20 } from '../../generated/Factory/ERC20'
import { NameBytes32 } from '../../generated/Factory/NameBytes32'
import { SymbolBytes32 } from '../../generated/Factory/SymbolBytes32'

export function createTokenKpi(id: string): TokenKpi {
  const kpi = new TokenKpi(id)
  kpi.token = id
  kpi.save()
  return kpi
}

export function getTokenKpi(id: string): TokenKpi {
  return TokenKpi.load(id) as TokenKpi
}

export function getOrCreateTokenKpi(id: string): TokenKpi {
  let tokenKpi = TokenKpi.load(id)
  if (tokenKpi === null) {
    tokenKpi = createTokenKpi(id)
  }
  return tokenKpi as TokenKpi
}

export function getOrCreateToken(id: string): Token {
  let token = Token.load(id)

  if (token === null) {
    token = new Token(id)

    const contract = ERC20.bind(Address.fromString(id))

    const decimals = getTokenDecimals(contract)
    const name = getTokenName(contract)
    const symbol = getTokenSymbol(contract)

    token.name = name.value
    token.nameSuccess = name.success
    token.symbol = symbol.value
    token.symbolSuccess = symbol.success
    token.decimals = decimals.value
    token.decimalsSuccess = decimals.success

    const price = getOrCreateTokenPrice(id)
    token.price = price.id

    const kpi = getOrCreateTokenKpi(id)
    token.kpi = kpi.id

    token.save()
  }

  return token as Token
}

class Symbol {
  success: boolean
  value: string
}

export function getTokenSymbol(contract: ERC20): Symbol {
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

export function getTokenName(contract: ERC20): Name {
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

export function getTokenDecimals(contract: ERC20): Decimal {
  const decimals = contract.try_decimals()

  if (!decimals.reverted) {
    return { success: true, value: BigInt.fromI32(decimals.value as i32) }
  }

  return { success: false, value: BigInt.fromI32(18) }
}
