import { Address, BigInt } from "@graphprotocol/graph-ts";

import { ERC20 } from "../../generated/MasterDeployer/ERC20";
import { NameBytes32 } from "../../generated/MasterDeployer/NameBytes32";
import { SymbolBytes32 } from "../../generated/MasterDeployer/SymbolBytes32";
import { Token } from "../../generated/schema";

export function getOrCreateToken(id: Address): Token {
  let token = Token.load(id.toHex());

  if (token === null) {
    const decimals = getTokenDecimals(id);
    const name = getTokenName(id);
    const symbol = getTokenSymbol(id);

    token = new Token(id.toHex());
    token.name = name.value;
    token.nameSuccess = name.success;
    token.symbol = symbol.value;
    token.symbolSuccess = symbol.success;
    token.decimals = decimals.value;
    token.decimalsSuccess = decimals.success;
    token.save();
  }

  return token as Token;
}

class Symbol {
  success: boolean;
  value: string;
}

export function getTokenSymbol(id: Address): Symbol {
  let erc20Contract = ERC20.bind(id);

  const symbol = erc20Contract.try_symbol();

  if (!symbol.reverted) {
    return { success: true, value: symbol.value.toString() };
  }

  const symbolBytes32Contract = SymbolBytes32.bind(id);

  const symbolBytes32 = symbolBytes32Contract.try_symbol();

  if (
    !symbolBytes32.reverted &&
    symbolBytes32.value.toHex() !=
      "0x0000000000000000000000000000000000000000000000000000000000000001"
  ) {
    return { success: true, value: symbolBytes32.value.toString() };
  }

  return { success: false, value: "???" };
}

class Name {
  success: boolean;
  value: string;
}

export function getTokenName(id: Address): Name {
  const erc20Contract = ERC20.bind(id);

  const name = erc20Contract.try_name();

  if (!name.reverted) {
    return { success: true, value: name.value.toString() };
  }

  const nameBytes32Contract = NameBytes32.bind(id);

  const nameBytes32 = nameBytes32Contract.try_name();

  if (
    !nameBytes32.reverted &&
    nameBytes32.value.toHex() !=
      "0x0000000000000000000000000000000000000000000000000000000000000001"
  ) {
    return { success: true, value: nameBytes32.value.toString() };
  }

  return { success: false, value: "???" };
}

class Decimal {
  success: boolean;
  value: BigInt;
}

export function getTokenDecimals(id: Address): Decimal {
  const contract = ERC20.bind(id);

  const decimals = contract.try_decimals();

  if (!decimals.reverted) {
    return { success: true, value: BigInt.fromI32(decimals.value as i32) };
  }

  return { success: false, value: BigInt.fromI32(18) };
}
