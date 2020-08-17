import * as React from 'react'
import LoadingContext from './LoadingContext'

export const useGlobalLoading = () => {
  const { startLoading, endLoading } = React.useContext(LoadingContext)

  return React.useMemo(() => ({
    startGlobalLoading: startLoading,
    endGlobalLoading: endLoading
  }), [startLoading, endLoading])
}
