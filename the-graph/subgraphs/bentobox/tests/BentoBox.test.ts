import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { getStrategyHarvestId, getUserTokenId } from '../src/functions/index'
import {
  onLogDeposit,
  onLogFlashLoan,
  onLogRegisterProtocol,
  onLogSetMasterContractApproval,
  onLogStrategyDivest,
  onLogStrategyInvest,
  onLogStrategyLoss,
  onLogStrategyProfit,
  onLogStrategySet,
  onLogStrategyTargetPercentage,
  onLogTransfer,
  onLogWhiteListMasterContract,
  onLogWithdraw
} from '../src/mappings/bentobox'
import {
  createDepositEvent,
  createFlashLoanEvent,
  createMasterContractApprovalEvent,
  createRegisterProtocolEvent,
  createSetStrategyEvent,
  createStrategyDivestEvent,
  createStrategyInvestEvent,
  createStrategyLossEvent,
  createStrategyProfitEvent,
  createTargetPercentageEvent,
  createTokenMock,
  createTransferEvent,
  createWhitelistMasterContractEvent,
  createWithdrawEvent
} from './mocks'

const BENTOBOX = Address.fromString('0xc381a85ed7C7448Da073b7d6C9d4cBf1Cbf576f0')
const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const WBTC_ADDRESS = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const BOB = Address.fromString('0x0000000000000000000000000000000000000b0b')
const POOL_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000101')

function setup(): void {
  const approver = Address.fromString('0x00000000000000000000000000000000000b00b5')
  let approved = true
  let whitelistMasterContractEvent = createWhitelistMasterContractEvent(BENTOBOX, approved)
  onLogWhiteListMasterContract(whitelistMasterContractEvent)

  let masterContractApprovalEvent = createMasterContractApprovalEvent(BENTOBOX, approver, approved)
  onLogSetMasterContractApproval(masterContractApprovalEvent)
}

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
  let withdrawEvent = createWithdrawEvent(
    Address.fromString(WBTC_ADDRESS),
    BENTOBOX,
    BOB,
    withdrawShare,
    withdrawAmount
  )

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

  expectedElastic = expectedElastic.times(BigDecimal.fromString('2'))
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
  createTokenMock(WBTC_ADDRESS, 8, 'Wrapped Bitcoin', 'WBTC')

  let poolAddress = Address.fromString('0x0000000000000000000000000000000000000101')
  let setStrategyEvent = createSetStrategyEvent(Address.fromString(WBTC_ADDRESS), poolAddress)
  onLogStrategySet(setStrategyEvent)

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

  let aliceDepositEvent = createDepositEvent(Address.fromString(WETH_ADDRESS), BENTOBOX, ALICE, share, amount)
  let aliceToBobEvent = createTransferEvent(
    Address.fromString(WETH_ADDRESS),
    ALICE,
    BOB,
    share.div(BigInt.fromString('2'))
  )
  let bobToAliceEvent = createTransferEvent(
    Address.fromString(WETH_ADDRESS),
    BOB,
    ALICE,
    share.div(BigInt.fromString('2'))
  )

  let aliceWithdrawEvent = createWithdrawEvent(Address.fromString(WETH_ADDRESS), BENTOBOX, ALICE, share, amount)
  let aliceUserTokenId = getUserTokenId(ALICE.toHex(), WETH_ADDRESS)
  let bobUserTokenId = getUserTokenId(BOB.toHex(), WETH_ADDRESS)
  createTokenMock(WETH_ADDRESS, 18, 'Wrapped Ether', 'WETH')

  // When: Alice deposits tokens
  onLogDeposit(aliceDepositEvent)

  // Then: Alice shares are increased
  assert.fieldEquals('User', ALICE.toHex(), 'id', ALICE.toHex())
  assert.fieldEquals('UserToken', aliceUserTokenId, 'id', aliceUserTokenId)
  assert.fieldEquals('UserToken', aliceUserTokenId, 'share', share.toString())

  // When: Alice transfers half of her shares to bob
  onLogTransfer(aliceToBobEvent)

  // Then: Both have the same amount of shares
  let expectedShares = share.div(BigInt.fromString('2')).toString()
  assert.fieldEquals('User', BOB.toHex(), 'id', BOB.toHex())
  assert.fieldEquals('UserToken', bobUserTokenId, 'id', bobUserTokenId)
  assert.fieldEquals('UserToken', bobUserTokenId, 'share', expectedShares)
  assert.fieldEquals('UserToken', aliceUserTokenId, 'share', expectedShares)

  // When: Bob returns the shares to alice
  onLogTransfer(bobToAliceEvent)

  // Then: Alice are back to her original deposit and bob has no shares
  expectedShares = share.div(BigInt.fromString('2')).toString()
  assert.fieldEquals('UserToken', aliceUserTokenId, 'share', share.toString())
  assert.fieldEquals('UserToken', bobUserTokenId, 'share', '0')

  // When: Alice withdraws her funds
  onLogWithdraw(aliceWithdrawEvent)

  // Then: Alice has no shares left
  assert.fieldEquals('UserToken', aliceUserTokenId, 'share', share.toString())

  cleanup()
})

test('When a token strategy is set, profit/loss events creates StrategyHarvest entities', () => {
  setup()
  let profitAmount = BigInt.fromString('200000000')
  let profitAmountDecimal = BigDecimal.fromString('2')

  let setStrategyEvent = createSetStrategyEvent(Address.fromString(WBTC_ADDRESS), POOL_ADDRESS)
  let profitEvent = createStrategyProfitEvent(Address.fromString(WBTC_ADDRESS), profitAmount)
  profitEvent.block.number = BigInt.fromString('133337')
  profitEvent.block.timestamp = BigInt.fromString('1644492069')

  let lossAmount = BigInt.fromString('50000000')
  let lossEvent = createStrategyLossEvent(Address.fromString(WBTC_ADDRESS), lossAmount)

  let profitHarvestId = getStrategyHarvestId(POOL_ADDRESS.toHex(), profitEvent.block.number.toString())

  createTokenMock(WBTC_ADDRESS, 8, 'Wrapped Bitcoin', 'WBTC')

  // When: StrategySetEvent triggers
  onLogStrategySet(setStrategyEvent)

  // Then: A strategy entity is created with the expected fields
  assert.fieldEquals('Strategy', POOL_ADDRESS.toHex(), 'id', POOL_ADDRESS.toHex())
  assert.fieldEquals('Strategy', POOL_ADDRESS.toHex(), 'token', WBTC_ADDRESS)
  assert.fieldEquals('Strategy', POOL_ADDRESS.toHex(), 'balance', '0')
  assert.fieldEquals('Strategy', POOL_ADDRESS.toHex(), 'totalProfit', '0')

  // When: A stratagy profit event triggers
  onLogStrategyProfit(profitEvent)

  // Then: A StrategyHarvest entitiy is created
  assert.fieldEquals('StrategyHarvest', profitHarvestId, 'id', profitHarvestId)
  assert.fieldEquals('StrategyHarvest', profitHarvestId, 'strategy', POOL_ADDRESS.toHex())
  assert.fieldEquals('StrategyHarvest', profitHarvestId, 'tokenElastic', profitAmountDecimal.toString())
  assert.fieldEquals('StrategyHarvest', profitHarvestId, 'timestamp', profitEvent.block.timestamp.toString())
  assert.fieldEquals('StrategyHarvest', profitHarvestId, 'block', profitEvent.block.number.toString())

  // And: the strategys totalProfit is updated
  assert.fieldEquals('Strategy', POOL_ADDRESS.toHex(), 'totalProfit', profitAmount.toString())
  assert.fieldEquals('Strategy', POOL_ADDRESS.toHex(), 'balance', profitAmount.toString())

  lossEvent.block.number = BigInt.fromString('133338')
  lossEvent.block.timestamp = BigInt.fromString('1644492070')
  let lossHarvestId = getStrategyHarvestId(POOL_ADDRESS.toHex(), lossEvent.block.number.toString())
  // When: A strategy loss event triggers
  onLogStrategyLoss(lossEvent)

  // Then: Another StrategyHarvest entitiy is created
  assert.fieldEquals('StrategyHarvest', lossHarvestId, 'id', lossHarvestId)
  assert.fieldEquals('StrategyHarvest', lossHarvestId, 'strategy', POOL_ADDRESS.toHex())
  assert.fieldEquals('StrategyHarvest', lossHarvestId, 'tokenElastic', '1.5')
  assert.fieldEquals('StrategyHarvest', lossHarvestId, 'timestamp', profitEvent.block.timestamp.toString())
  assert.fieldEquals('StrategyHarvest', lossHarvestId, 'block', profitEvent.block.number.toString())

  // And: the strategys totalProfit is updated
  let expectedStrategyAmount = profitAmount.minus(lossAmount).toString()
  assert.fieldEquals('Strategy', POOL_ADDRESS.toHex(), 'totalProfit', expectedStrategyAmount)
  assert.fieldEquals('Strategy', POOL_ADDRESS.toHex(), 'balance', expectedStrategyAmount)
  cleanup()
})

test('Invest/Divest events creates Strategy entities', () => {
  setup()
  let investAmount = BigInt.fromString('50000000')
  let divestAmount = BigInt.fromString('15000000')
  let investEvent = createStrategyInvestEvent(Address.fromString(WETH_ADDRESS), investAmount)
  investEvent.block.number = BigInt.fromString('133337')
  investEvent.block.timestamp = BigInt.fromString('1644492069')
  let divestEvent = createStrategyDivestEvent(Address.fromString(WETH_ADDRESS), divestAmount)
  createTokenMock(WETH_ADDRESS, 18, 'Wrapped Ether', 'WETH')

  let poolAddress = Address.fromString('0x0000000000000000000000000000000000000101')
  let setStrategyEvent = createSetStrategyEvent(Address.fromString(WETH_ADDRESS), poolAddress)
  onLogStrategySet(setStrategyEvent)

  // Then: A strategy entity is created with the expected fields
  assert.fieldEquals('Strategy', poolAddress.toHex(), 'id', poolAddress.toHex())
  assert.fieldEquals('Strategy', poolAddress.toHex(), 'token', WETH_ADDRESS)
  assert.fieldEquals('Strategy', poolAddress.toHex(), 'balance', '0')
  assert.fieldEquals('Strategy', poolAddress.toHex(), 'totalProfit', '0')

  // When: Invest event triggers
  divestEvent.block.number = BigInt.fromString('133338')
  divestEvent.block.timestamp = BigInt.fromString('1644492070')
  onLogStrategyInvest(investEvent)

  // Then: the strategy is updated with increased balance
  assert.fieldEquals('Strategy', poolAddress.toHex(), 'balance', investAmount.toString())

  // When: Divest event triggers
  onLogStrategyDivest(divestEvent)

  // Then: the strategy is updated with decreased balance
  let expectedBalance = investAmount.minus(divestAmount).toString()
  assert.fieldEquals('Strategy', poolAddress.toHex(), 'balance', expectedBalance)

  cleanup()
})

test('onRegisterProtocol creates a Protocol and bentoboxs related fields are updated', () => {
  setup()

  let protocol = Address.fromString('0x0000000000000000000000000000000000001337')
  let registerProtocolEvent = createRegisterProtocolEvent(protocol)

  onLogRegisterProtocol(registerProtocolEvent)

  assert.fieldEquals('Protocol', protocol.toHex(), 'id', protocol.toHex())
  assert.fieldEquals('BentoBox', registerProtocolEvent.address.toHex(), 'id', registerProtocolEvent.address.toHex())
  assert.fieldEquals('BentoBox', registerProtocolEvent.address.toHex(), 'protocolCount', '1')

  cleanup()
})

test('On deposit, the token count is increased', () => {
  setup()
  let share = BigInt.fromString('200000000')
  let amount = BigInt.fromString('200000000')

  let depositEvent1 = createDepositEvent(Address.fromString(WETH_ADDRESS), BENTOBOX, ALICE, share, amount)
  let depositEvent2 = createDepositEvent(Address.fromString(WBTC_ADDRESS), BENTOBOX, ALICE, share, amount)

  createTokenMock(WETH_ADDRESS, 18, 'Wrapped Ether', 'WETH')
  createTokenMock(WBTC_ADDRESS, 8, 'Wrapped Bitcoin', 'WBTC')

  onLogDeposit(depositEvent1)

  assert.fieldEquals('BentoBox', BENTOBOX.toHex(), 'tokenCount', '1')

  onLogDeposit(depositEvent2)

  assert.fieldEquals('BentoBox', BENTOBOX.toHex(), 'tokenCount', '2')
})


test('Flashloans increase the BentoBoxs flashloanCount', () => {
  setup()
  let flashLoanFee = BigInt.fromString('50000')
  let amount = BigInt.fromString('200000000')
  let feeAmount = amount.div(flashLoanFee)
  let flashLoanEvent = createFlashLoanEvent(ALICE, Address.fromString(WBTC_ADDRESS), amount, feeAmount, ALICE)

  onLogFlashLoan(flashLoanEvent)
  assert.fieldEquals('BentoBox', BENTOBOX.toHex(), 'flashloanCount', '1')

  onLogFlashLoan(flashLoanEvent)

  assert.fieldEquals('BentoBox', BENTOBOX.toHex(), 'flashloanCount', '2')

  cleanup()
})

test('TargetPercentage event updates the token', () => {
  setup()

  let targetPercentage = BigInt.fromString('500')
  let targetPercentageEvent = createTargetPercentageEvent(Address.fromString(WBTC_ADDRESS), targetPercentage)

  onLogStrategyTargetPercentage(targetPercentageEvent)

  assert.fieldEquals('Token', WBTC_ADDRESS, 'strategyTargetPercentage', targetPercentage.toString())

  cleanup()
})