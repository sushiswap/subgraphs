import { Subscription } from '../../generated/schema'

export function getOrCreateSubscription(userId: string, incentiveId: string): Subscription {
  let id = getSubscriptionId(userId, incentiveId)
  let subscription = Subscription.load(id)

  if (subscription === null) {
    subscription = new Subscription(id)
    subscription.save()
  }

  return subscription as Subscription
}

export function getSubscriptionId(userId: string, incentiveId: string): string {
  return userId.concat(':').concat(incentiveId)
}

export function isSubscribed(userId: string, incentiveId: string): boolean {
  let id = getSubscriptionId(userId, incentiveId)
  let subscription = Subscription.load(id)

  return subscription !== null
}