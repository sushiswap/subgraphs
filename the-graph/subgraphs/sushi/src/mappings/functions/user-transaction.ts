import { UserTransaction } from '../../../generated/schema'

export function getOrCreateUserTransaction(userId: string, transactionId: string): UserTransaction {
  const userTransaction = UserTransaction.load(userId.concat(':').concat(transactionId))

  if (userTransaction === null) {
    return createUserTransaction(userId, transactionId)
  }

  return userTransaction as UserTransaction
}

function createUserTransaction(userId: string, transactionId: string): UserTransaction {
  const userTransaction = new UserTransaction(userId.concat(':').concat(transactionId))
  userTransaction.user = userId
  userTransaction.user = transactionId
  userTransaction.save()

  return userTransaction as UserTransaction
}
