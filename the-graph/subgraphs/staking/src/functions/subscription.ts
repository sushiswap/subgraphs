import { Subscription } from '../../generated/schema'

export function getOrCreateSubscription(userId: string, count: string): Subscription {
  let id = getSubscriptionId(userId, count)
  let subscription = Subscription.load(id)

  if (subscription === null) {
    subscription = new Subscription(id)
    subscription.save()
  }

  return subscription as Subscription
}

export function getSubscription(userId: string, count: string): Subscription | null {
  let id = getSubscriptionId(userId, count)
  return Subscription.load(id)
}

export function getSubscriptionId(userId: string, count: string): string {
  return userId.concat(':').concat(count)
}

export function isSubscribed(userId: string, count: string): boolean {
  let id = getSubscriptionId(userId, count)
  let subscription = Subscription.load(id)

  return subscription !== null
}