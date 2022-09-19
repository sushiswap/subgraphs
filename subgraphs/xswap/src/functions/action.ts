
import { ACTIONS, UNKNOWN_ACTION } from '../constants'
import { Action } from '../../generated/schema'


export function getOrCreateAction(id: i32): Action {
  let action = Action.load(id.toString())
  if (action === null) {
    action = new Action(id.toString())
    action.name = ACTIONS.has(id) ? ACTIONS.get(id) : UNKNOWN_ACTION
    action.save()
  }

  return action
}
