import * as React from 'react'

export interface ILoadingContext {
  startLoading: () => void,
  endLoading: () => void,
}

// Do not invoke startLoading/endLoading function from this context directly
// Please use <LoadingTrigger /> component or useGlobalLoading() hook instead
const _LoadingContext = React.createContext<ILoadingContext>({
  startLoading: () => {
    throw new Error('Please wrap your component in withGlobalLoading!')
  },
  endLoading: () => {
    throw new Error('Please wrap your component in withGlobalLoading!')
  },
})

export default _LoadingContext
