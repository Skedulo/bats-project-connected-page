import * as React from 'react'

export interface LoadingContextInterface {
  startLoading: () => void
  endLoading: () => void
}

// Do not invoke startLoading/endLoading function from this context directly
// Please use <LoadingTrigger /> component or useGlobalLoading() hook instead
const _LoadingContext = React.createContext<LoadingContextInterface>({
  startLoading: () => {
    throw new Error('Please wrap your component in GlobalLoading!')
  },
  endLoading: () => {
    throw new Error('Please wrap your component in GlobalLoading!')
  }
})

export default _LoadingContext
