export const ACTIONS = new Map<i32,string>()

ACTIONS.set(0, "APPROVAL: Master contract approval")
ACTIONS.set(1, "SOURCE: Deposit to BentoBox")
ACTIONS.set(2, "SOURCE: Transfer from BentoBox")
ACTIONS.set(3, "DESTINATION: Deposit to BentoBox")
ACTIONS.set(4, "DESTINATION: Withdraw Token")
ACTIONS.set(5, "DESTINATION: Withdraw or Transfer from BentoBox")
ACTIONS.set(6, "Unwrap and Transfer")
ACTIONS.set(7, "SWAP: Legacy")
ACTIONS.set(8, "SWAP: Trident")
ACTIONS.set(9, "SWAP: Trident Complex Path")
ACTIONS.set(10, "BRIDGE: Teleport")
ACTIONS.set(11, "BRIDGE: Token Transfer")
// ([
//   [],
//   [2, "SOURCE: Transfer from BentoBox"],
//   [3, "DESTINATION: Deposit to BentoBox"],
//   [4, "DESTINATION: Withdraw Token"],
//   [5, "DESTINATION: Withdraw or Transfer from BentoBox"],
//   [6, "Unwrap and Transfer"],
//   [7, "SWAP: Legacy"],
//   [8, "SWAP: Trident"],
//   [9, "SWAP: Trident Complex Path"],
//   [10, "BRIDGE: Teleport"],
//   [11, "BRIDGE: Token Transfer"]
// ])

export const UNKNOWN_ACTION = "Unknown action"


export namespace PayloadType {
  export const SOURCE = "SOURCE"
  export const DESTINATION = "DESTINATION"
}
