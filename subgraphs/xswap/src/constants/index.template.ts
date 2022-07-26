
export namespace ActionName {
  // Bento and Token Operations
  export const SRC_DEPOSIT_TO_BENTOBOX = "SOURCE: Deposit to BentoBox";
  export const SRC_TRANSFER_FROM_BENTOBOX = "SOURCE: Transfer from BentoBox";;
  export const DST_DEPOSIT_TO_BENTOBOX = "DESTINATION: Deposit to BentoBox";
  export const DST_WITHDRAW_TOKEN = "DESTINATION: Withdraw Token";
  export const DST_WITHDRAW_OR_TRANSFER_FROM_BENTOBOX = "DESTINATION: Withdraw or Transfer from BentoBox";
  export const UNWRAP_AND_TRANSFER = "Unwrap and Transfer";

  // Swap Operations
  export const LEGACY_SWAP = "SWAP: Legacy";
  export const TRIDENT_SWAP = "SWAP: Trident";
  export const TRIDENT_COMPLEX_PATH_SWAP = "SWAP: Trident Complex Path";

  // Bridge Operations
  export const STARGATE_TELEPORT = "BRIDGE: Teleport";
  export const SRC_TOKEN_TRANSFER = "BRIDGE: Token Transfer";
}

export namespace ActionId {    
  // Bento and Token Operations
  export const SRC_DEPOSIT_TO_BENTOBOX = 1;
  export const SRC_TRANSFER_FROM_BENTOBOX = 2;
  export const DST_DEPOSIT_TO_BENTOBOX = 3;
  export const DST_WITHDRAW_TOKEN = 4;
  export const DST_WITHDRAW_OR_TRANSFER_FROM_BENTOBOX = 5;
  export const UNWRAP_AND_TRANSFER = 6;

  // Swap Operations
  export const LEGACY_SWAP = 7;
  export const TRIDENT_SWAP = 8;
  export const TRIDENT_COMPLEX_PATH_SWAP = 9;

  // Bridge Operations
  export const STARGATE_TELEPORT = 10;
  export const SRC_TOKEN_TRANSFER = 11;
}



