import * as React from 'react'

import LoadingContext from './LoadingContext'

export const useGlobalLoading = () => {
  const selfCounter = React.useRef(0)

  const { startLoading, endLoading } = React.useContext(LoadingContext)

  return React.useMemo(() => ({
    startGlobalLoading: () => {
      if (!selfCounter.current) {
        startLoading()
      }
      selfCounter.current++
    },
    endGlobalLoading: () => {
      if (selfCounter.current > 0) {
        selfCounter.current--
        if (!selfCounter.current) {
          endLoading()
        }
      } else {
        console.warn('Should not call endGlobalLoading more time than startGlobalLoading')
      }
    }
  }), [selfCounter, startLoading, endLoading])
}
