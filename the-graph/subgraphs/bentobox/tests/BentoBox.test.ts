import { Address, BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'
import { test, assert, clearStore } from 'matchstick-as/assembly/index'
import { onLogDeposit, onLogFlashLoan, onLogStrategyDivest, onLogStrategyInvest, onLogStrategyLoss, onLogStrategyProfit, onLogTransfer, onLogWithdraw } from '../src/mappings/bentobox'
import { getUserTokenId } from '../src/functions'
import { createDepositEvent, createFlashLoanEvent, createStrategyDivestEvent, createStrategyInvestEvent, createStrategyLossEvent, createStrategyProfitEvent, createTokenMock, createTransferEvent, createWithdrawEvent } from './mocks'


const BENTOBOX = Address.fromString('0xc381a85ed7C7448Da073b7d6C9d4cBf1Cbf576f0')
const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const WBTC_ADDRESS = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const BOB = Address.fromString('0x0000000000000000000000000000000000000b0b')

function setup(): void {}

function cleanup(): void {
  clearStore()
}

test("deposit multiple times increases the rebase's base and elastic values", () => {
  setup()

  let amount = BigInt.fromString('100001')
  let amountDecimal = BigDecimal.fromString('0.000000000000100001')
  let share = BigInt.fromString('55')
  let shareDecimal = BigDecimal.fromString('0.000000000000000055')
  let depositEvent = createDepositEvent(Address.fromString(WETH_ADDRESS), BENTOBOX, BOB, share, amount)

  createTokenMock(WETH_ADDRESS, 18, 'Wrapped Ether', 'WETH')
  onLogDeposit(depositEvent)

  assert.fieldEquals('Token', WETH_ADDRESS, 'id', WETH_ADDRESS)
  assert.fieldEquals('Rebase', WETH_ADDRESS, 'id', WETH_ADDRESS)
  assert.fieldEquals('Rebase', WETH_ADDRESS, 'base', amountDecimal.toString())
  assert.fieldEquals('Rebase', WETH_ADDRESS, 'elastic', shareDecimal.toString())

  let amount2 = BigInt.fromString('999999999999899999')
  let share2 = BigInt.fromString('999999999999999945')
  let depositEvent2 = createDepositEvent(Address.fromString(WETH_ADDRESS), BENTOBOX, BOB, share2, amount2)

  // When: Deposit a second time
  onLogDeposit(depositEvent2)

  // Then: the rebase's base and elastic value has increased
  assert.fieldEquals('Rebase', WETH_ADDRESS, 'base', '1')
  assert.fieldEquals('Rebase', WETH_ADDRESS, 'elastic', '1')

  let amount3 = BigInt.fromString('200000000')
  let share3 = BigInt.fromString('200000000')
  let depositEvent3 = createDepositEvent(Address.fromString(WBTC_ADDRESS), BENTOBOX, BOB, share3, amount3)

  // When: A third deposit is made
  createTokenMock(WBTC_ADDRESS, 8, 'Wrapped Bitcoin', 'WBTC')
  onLogDeposit(depositEvent3)

  // Then: the previous (WETH deposit) remains unchanged
  assert.fieldEquals('Rebase', WETH_ADDRESS, 'base', '1')
  assert.fieldEquals('Rebase', WETH_ADDRESS, 'elastic', '1')

  // And: "The third deposit created a new rebase"
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'id', WBTC_ADDRESS)
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'base', '2')
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'elastic', '2')

  cleanup()
})

test("Withdraw multiple times decreases the rebase's base and elastic values", () => {
  setup()
  let depositShare = BigInt.fromString('200000000')
  let depositAmount = BigInt.fromString('200000000')
  let depositEvent = createDepositEvent(Address.fromString(WBTC_ADDRESS), BENTOBOX, BOB, depositShare, depositAmount)

  createTokenMock(WBTC_ADDRESS, 8, 'Wrapped Bitcoin', 'WBTC')
  onLogDeposit(depositEvent)

  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'id', WBTC_ADDRESS)
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'base', '2')
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'elastic', '2')

  let withdrawShare = BigInt.fromString('50000000')
  let withdrawAmount = BigInt.fromString('50000000')
  let withdrawEvent = createWithdrawEvent(Address.fromString(WBTC_ADDRESS), BENTOBOX, BOB, withdrawShare, withdrawAmount)

  onLogWithdraw(withdrawEvent)

  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'id', WBTC_ADDRESS)
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'base', '1.5')
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'elastic', '1.5')

  let withdrawShare2 = BigInt.fromString('50000000')
  let withdrawAmount2 = BigInt.fromString('50000000')
  let withdrawEvent2 = createWithdrawEvent(
    Address.fromString(WBTC_ADDRESS),
    ALICE,
    BOB,
    withdrawShare2,
    withdrawAmount2
  )
  onLogWithdraw(withdrawEvent2)

  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'id', WBTC_ADDRESS)
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'base', '1')
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'elastic', '1')

  cleanup()
})

test('Flashloan increases the rebase elastic value with fee but share remains unchanged', () => {
  setup()
  let flashLoanFee = BigInt.fromString('50000')
  let amount = BigInt.fromString('200000000')
  let feeAmount = amount.div(flashLoanFee)
  let flashLoanEvent = createFlashLoanEvent(ALICE, Address.fromString(WBTC_ADDRESS), amount, feeAmount, ALICE)

  onLogFlashLoan(flashLoanEvent)

  let expectedElastic = BigDecimal.fromString('0.00004')
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'base', '0')
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'elastic', expectedElastic.toString())

  onLogFlashLoan(flashLoanEvent)

  expectedElastic = expectedElastic.times(BigDecimal.fromString("2"))
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'elastic', expectedElastic.toString())

  cleanup()
})


test('Strategies affect the elastic value', () => {
  setup()
  let amount = BigInt.fromString('50000')
  let profitEvent = createStrategyProfitEvent(Address.fromString(WBTC_ADDRESS), amount)
  let expectedElastic = BigDecimal.fromString('0.0005').toString()
  let lossEvent = createStrategyLossEvent(Address.fromString(WBTC_ADDRESS), amount)
  let investEvent = createStrategyInvestEvent(Address.fromString(WBTC_ADDRESS), amount)
  let divestEvent = createStrategyDivestEvent(Address.fromString(WBTC_ADDRESS), amount)

  // When: StragegyProfit event triggers
  onLogStrategyProfit(profitEvent)

  // Then: elastic value is increased
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'base', '0')
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'elastic', expectedElastic)

  // When: Loss event triggers
  onLogStrategyLoss(lossEvent)

  // Then: elastic value is decreased
  expectedElastic = BigDecimal.fromString('0').toString()
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'base', '0')
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'elastic', expectedElastic)

  // When: Invest event triggers
  onLogStrategyInvest(investEvent)

  //Then: elastic value is increased
  expectedElastic = BigDecimal.fromString('0.0005').toString()
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'base', '0')
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'elastic', expectedElastic)

  // When: Divest event triggers
  onLogStrategyDivest(divestEvent)

  // Then: elastic value is decreased
  expectedElastic = BigDecimal.fromString('0').toString()
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'base', '0')
  assert.fieldEquals('Rebase', WBTC_ADDRESS, 'elastic', expectedElastic)

  cleanup()
})


test('Deposit, transfer, transfer, withdraw', () => {
  setup()
  let share = BigInt.fromString('200000000')
  let amount = BigInt.fromString('200000000')

  let aliceDepositEvent = createDepositEvent(Address.fromString(WETH_ADDRESS), ALICE, BENTOBOX, share, amount)
  let aliceToBobEvent = createTransferEvent(Address.fromString(WETH_ADDRESS), ALICE, BOB, share.div(BigInt.fromString("2")))
  let bobToAliceEvent = createTransferEvent(Address.fromString(WETH_ADDRESS), BOB, ALICE, share.div(BigInt.fromString("2")))

  let aliceWithdrawEvent = createWithdrawEvent(Address.fromString(WETH_ADDRESS), BENTOBOX, ALICE, share, amount)
  let aliceUserTokenId = getUserTokenId(ALICE.toHex(), WETH_ADDRESS)
  let bobUserTokenId = getUserTokenId(BOB.toHex(), WETH_ADDRESS)

  // When: Alice deposits tokens
  onLogDeposit(aliceDepositEvent)

  // Then: Alice shares are increased
  assert.fieldEquals("User", ALICE.toHex(), "id", ALICE.toHex())
  assert.fieldEquals("UserToken", aliceUserTokenId, "id", aliceUserTokenId)
  assert.fieldEquals("UserToken", aliceUserTokenId, "share", share.toString())

  // When: Alice transfers half of her shares to bob
  onLogTransfer(aliceToBobEvent)

  // Then: Both have the same amount of shares
  let expectedShares = share.div(BigInt.fromString("2")).toString()
  assert.fieldEquals("User", BOB.toHex(), "id", BOB.toHex())
  assert.fieldEquals("UserToken", bobUserTokenId, "id", bobUserTokenId)
  assert.fieldEquals("UserToken", bobUserTokenId, "share", expectedShares)
  assert.fieldEquals("UserToken", aliceUserTokenId, "share", expectedShares)

  // When: Bob returns the shares to alice
  onLogTransfer(bobToAliceEvent)
  
  // Then: Alice are back to her original deposit and bob has no shares
  expectedShares = share.div(BigInt.fromString("2")).toString()
  assert.fieldEquals("UserToken", aliceUserTokenId, "share", share.toString())
  assert.fieldEquals("UserToken", bobUserTokenId, "share", "0")

  // When: Alice withdraws her funds
  onLogWithdraw(aliceWithdrawEvent)
  
  // Then: Alice has no shares left
  assert.fieldEquals("UserToken", aliceUserTokenId, "share", share.toString())

  cleanup()
})
