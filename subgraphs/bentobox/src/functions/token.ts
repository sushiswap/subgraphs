import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { ERC20 } from '../../generated/BentoBox/ERC20'
import { NameBytes32 } from '../../generated/BentoBox/NameBytes32'
import { SymbolBytes32 } from '../../generated/BentoBox/SymbolBytes32'
import { Token } from '../../generated/schema'
import { getOrCreateBentoBox } from './bentobox'
import { increaseTokenCount } from './bentobox-kpi'
import { createRebase } from './rebase'
import { getOrCreateTokenKpi } from './token-kpi'

export function getToken(id: string): Token {
  return Token.load(id) as Token
}

export function getOrCreateToken(id: string, event: ethereum.Event): Token {
  let token = Token.load(id)

  if (token === null) {
    token = new Token(id)

    getOrCreateTokenKpi(id)
    token.kpi = id

    const contract = ERC20.bind(Address.fromString(id))

    const decimals = getTokenDecimals(contract)
    const name = getTokenName(contract)
    const symbol = getTokenSymbol(contract)

    const bentoBox = getOrCreateBentoBox()

    increaseTokenCount(event.block.timestamp)

    token.bentoBox = bentoBox.id
    token.name = name.value
    token.nameSuccess = name.success
    token.symbol = symbol.value
    token.symbolSuccess = symbol.success
    token.decimals = decimals.value
    token.decimalsSuccess = decimals.success

    const rebase = createRebase(id)
    token.rebase = rebase.id

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
    return { success: true, value: BigInt.fromU32(decimals.value) }
  }

  return { success: false, value: BigInt.fromU32(18) }
}
