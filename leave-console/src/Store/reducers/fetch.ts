import { Dispatch } from 'redux'

import {
  makeActionsSet,
  makeReducers,
  makeAsyncActionCreatorSimp,
  makeActionCreator } from '../../common/utils/redux-helpers'

import * as Queries from '../queries'

import { Avatars, UID, Resource, State } from '../types'

import { Services } from '../../Services/Services'

const RESOURCE = makeActionsSet('RESOURCE')
const CLEAR_NEW_ENTRY_STATE = 'CLEAR_NEW_ENTRY_STATE'
const USERS_AVATARS = makeActionsSet('USERS_AVATARS')
const JOBS = makeActionsSet('JOBS')

export const clearNewEntrState = makeActionCreator(CLEAR_NEW_ENTRY_STATE)

export const getResources = makeAsyncActionCreatorSimp(
  RESOURCE, () => async (dispatch: Dispatch) => {
    const resp = await Services.graphQL.fetch<{resources: Resource[]}>({
      query: Queries.AllResourcesQuery
    })
    dispatch(getUsersAvatars(resp.resources.reduce((acc, { UID }) => UID ? [...acc, UID] : acc , [] as UID[])))
    return resp
  }
)

export const getUsersAvatars = makeAsyncActionCreatorSimp(
  USERS_AVATARS, (ids: UID[]) => async (dispatch: Dispatch, getState: () => State) => {
    if (ids.length > 0) {
      const resp = await Services.metadata._apiService.get(
        `files/avatar?user_ids=${[...new Set(ids)]}`
      )
      return resp
    }
    return {}
  }
)

export const getJobs = makeAsyncActionCreatorSimp(
  JOBS, () => async (dispatch: Dispatch) => {
    const resp = await Services.graphQL.fetch<{ jobs: object[] }>({
      query: Queries.JobsQuery
    })
    return resp
  }
)

const userAvatarsTransform = (avatars: Avatars, store: State) => {
  delete avatars.type
  return {
    avatars
  }
}

export default {
  ...makeReducers(USERS_AVATARS, { transform: userAvatarsTransform }),
  ...makeReducers(RESOURCE, { dataField: 'resources' }),
  ...makeReducers(JOBS, { dataField: 'jobs' })
}
