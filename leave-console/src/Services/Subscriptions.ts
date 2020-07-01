import { ApolloClient } from 'apollo-client'
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { WebSocketLink } from 'apollo-link-ws'
import gql from 'graphql-tag'
import { Dispatch } from 'redux'

import {
  fetchMoreHandler,
  handleUpdateMessage } from '../Store/reducers/subscription'
import { GRAPHQL_WS_ENDPOINT } from '../config'

interface RegisterOptions {
  query: string,
  subscriptionName: string,
  dispatch: Dispatch
  variables?: {}
  fetchMore: boolean
}

export class Subscriptions {
  wsClient?: SubscriptionClient
  apolloClient?: ApolloClient<NormalizedCacheObject>
  isConnected: boolean = false

  private authToken: string
  private ENDPOINT: string = GRAPHQL_WS_ENDPOINT
  private ongoingSubscriptions: string[]

  constructor(token: string, connect: boolean = false) {
    this.authToken = token
    this.ongoingSubscriptions = []
    if (connect) {
      try {
        this.initConnection()
      } catch (error) {
        // tslint:disable-next-line: no-console
        console.warn(error)
      }
    }
  }

  initConnection(reconnect: boolean = true) {
    return new Promise((resolve, reject) => {
      this.wsClient = new SubscriptionClient(this.ENDPOINT, {
        reconnect,
        connectionParams: {
          Authorization: `Bearer ${this.authToken}`
        },
        connectionCallback: err => {
          if (err) {
            // tslint:disable-next-line: no-console
            console.warn('Couldn\'t connect to WS', err)
            reject({ connectionStatus: 'Subscription connection error', error: err })
          } else {
            this.isConnected = true
            resolve({ connectionStatus: 'connected' })
          }
        }
      })
      this.apolloClient = new ApolloClient({
        link: new WebSocketLink(this.wsClient),
        cache: new InMemoryCache()
      })
      // tslint:disable-next-line: no-console
      this.wsClient.onError((...args) => console.warn('onError', args))
    })
  }

  registerSubscription(options: RegisterOptions) {
    const { subscriptionName } =  options
    if (this.isConnected) {
      if (this.ongoingSubscriptions.indexOf(subscriptionName) === -1) {
        this.ongoingSubscriptions.push(subscriptionName)
        this.register(options)
      }
    } else {
      // tslint:disable-next-line: no-console
      console.error('Init connection before registering new subscription')
    }
  }

  register({ query, subscriptionName, dispatch, variables, fetchMore }: RegisterOptions) {
    this.apolloClient!
      .subscribe({
        query: gql(query),
        variables: variables || {}
      }).subscribe({
        next({ data }) {
          if (fetchMore) {
            dispatch(fetchMoreHandler[subscriptionName](data) as any)
          } else {
            dispatch(handleUpdateMessage({ subscriptionName, data }))
          }
        },
        error: this.registerErrorHandler(subscriptionName)
      })
  }

  // tslint:disable-next-line: no-console
  registerErrorHandler = (name: string) => (err: any) => console.warn(name, err)
}

export default Subscriptions
