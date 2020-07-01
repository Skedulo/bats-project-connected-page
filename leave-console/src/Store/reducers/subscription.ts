import { Dispatch } from 'redux'

import {
  makeActionsSet,
  makeReducers,
  makeAsyncActionCreatorSimp,
  makeActionCreator } from '../../common/utils/redux-helpers'
import insertByKey from '../../common/utils/insertByKey'

import * as Queries from '../queries'
import { State } from '../types'
import Subscriptions from '../../Services/Subscriptions'
import { getAvailabilities } from './availabilities'

const SUBSCRIPTION_INIT = makeActionsSet('SUBSCRIPTION_INIT')
const SUBSCRIPTION_UPDATE = 'SUBSCRIPTION_UPDATE'

const auth = JSON.parse(window.localStorage.auth)
const wsSubscriptions = new Subscriptions(auth.skedApiAccessToken)

export const initSubscriptionService = makeAsyncActionCreatorSimp(
  SUBSCRIPTION_INIT, () => async () => {
    try {
      const resp = await wsSubscriptions.initConnection()
      return resp
    // tslint:disable-next-line: no-console
    } catch (error) { console.warn('Couldn\'t connect to WS', error) }
  }
)

export const handleUpdateMessage = makeActionCreator(SUBSCRIPTION_UPDATE)

export const registerNewSubscription = (subscriptionName: string, variables?: {}, fetch: boolean = false) => {
  return (dispatch: Dispatch) => {
    wsSubscriptions.registerSubscription({
      subscriptionName,
      dispatch,
      query: Queries.subscriptions[subscriptionName],
      variables: variables || {},
      fetchMore: fetch
    })
  }
}

enum Operation {
  Insert = 'INSERT',
  Update = 'UPDATE',
  Delete = 'DELETE'
}

export const fetchMoreHandler:
  {[key: string]: (data: any) => (dispatch: Dispatch, getState: () => State) => void} = {
    AvailabilityUpdate: (data: any) => dispatch => {
      const { schemaAvailabilities: { operation } } = data
      dispatch(handleUpdateMessage({
        data,
        subscriptionName: 'AvailabilityUpdate'
      }))
      if (operation === Operation.Insert) {
        dispatch(getAvailabilities())
      }
    }
  }

const updateHandlers: {[key: string]: any} = {
  AvailabilityUpdate: (data: any, state: State) => {
    const {
      schemaAvailabilities: {
        operation,
        data: {
          Status,
          UID
        }
      }
    } = data

    if (operation === Operation.Insert) {
      return state
    }
    const { availabilities } = state

    if (availabilities && availabilities.length) {
      const availability = availabilities.find(({ UID: savedUID }) => UID === savedUID)
      if (availability) {
        const newData = {
          ...availability,
          Status: Status || availability.Status
        }
        return {
          ...state,
          availabilities: insertByKey(availabilities, 'UID', newData)
        }
      }
    }
    return state
  }
}

export default {
  ...makeReducers(SUBSCRIPTION_INIT, { transform: ({ connectionStatus }: { connectionStatus: string }) => ({ subscriptionStatus: connectionStatus }) }),
  [SUBSCRIPTION_UPDATE]: (state: State, message: {subscriptionName: string, data: {}}) => {
    const { subscriptionName, data } = message
    return updateHandlers[subscriptionName](data, state)
  }
}
