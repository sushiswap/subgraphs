import { Address, BigInt } from "@graphprotocol/graph-ts";

import { ERC20 } from "../../generated/MasterDeployer/ERC20";
import { NULL_CALL_RETURN_VALUE } from "../constants";
import { NameBytes32 } from "../../generated/MasterDeployer/NameBytes32";
import { SymbolBytes32 } from "../../generated/MasterDeployer/SymbolBytes32";
import { Token } from "../../generated/schema";

export function getOrCreateToken(id: Address): Token {
  let token = Token.load(id.toHex());

  if (token === null) {
    token = new Token(id.toHex());
    token.name = getTokenName(id);
    token.symbol = getTokenSymbol(id);
    token.decimals = getTokenDecimals(id);
    token.save();
  }

  return token as Token;
}

export function getTokenSymbol(address: Address): string {
  let erc20Contract = ERC20.bind(address);

  const symbol = erc20Contract.try_symbol();

  if (!symbol.reverted) {
    return symbol.value;
  }

  const symbolBytes32Contract = SymbolBytes32.bind(address);

  const symbolBytes32 = symbolBytes32Contract.try_symbol();

  if (
    !symbolBytes32.reverted &&
    symbolBytes32.value.toHex() != NULL_CALL_RETURN_VALUE
  ) {
    return symbolBytes32.value.toString();
  }

  return "???";
}

export function getTokenName(address: Address): string {
  const erc20Contract = ERC20.bind(address);

  const name = erc20Contract.try_name();

  if (!name.reverted) {
    return name.value;
  }

  const nameBytes32Contract = NameBytes32.bind(address);

  const nameBytes32 = nameBytes32Contract.try_name();

  if (
    !nameBytes32.reverted &&
    nameBytes32.value.toHex() != NULL_CALL_RETURN_VALUE
  ) {
    return nameBytes32.value.toString();
  }

  return "???";
}

export function getTokenDecimals(address: Address): BigInt {
  let contract = ERC20.bind(address);
  let decimalValue = 18;
  let decimalResult = contract.try_decimals();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  return BigInt.fromI32(decimalValue as i32);
}
