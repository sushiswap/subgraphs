import { User, _Subscription } from '../../generated/schema'

export function getOrCreateSubscription(userId: string, count: string): _Subscription {
  let id = getSubscriptionId(userId, count)
  let subscription = _Subscription.load(id)

  if (subscription === null) {
    subscription = new _Subscription(id)
    subscription.save()
  }

  return subscription as _Subscription
}

export function getSubscription(userId: string, count: string): _Subscription | null {
  let id = getSubscriptionId(userId, count)
  return _Subscription.load(id)
}

export function getSubscriptionId(userId: string, count: string): string {
  return userId.concat(':').concat(count)
}

export function getSubscriptionByIncentiveId(user: User, incentiveId: string): _Subscription | null {
  for (let i = 1; i <= user.totalSubscriptionCount.toI32(); i++) {
    let subscription = getSubscription(user.id, i.toString())
    if (subscription !== null && subscription.incentive == incentiveId) {
      return subscription
    }
  }
  return null
}
