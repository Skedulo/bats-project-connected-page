import * as React from 'react'
import LoadingContext from './LoadingContext'
import LoadingOverlay from '../LoadingOverlay'

interface IGlobalLoadingProps {
  children: React.ReactNode,
}

const  GlobalLoading: React.FC<IGlobalLoadingProps> = ({ children }) => {
  const [counter, setCounter] = React.useState<number>(0)

  const increaseCounter = React.useCallback(() => {
    setCounter(prev => prev += 1)
  }, [])
  const decreaseCounter = React.useCallback(() => {
    setCounter(prev => prev > 0 ? prev -= 1 : 0)
  }, [])

  const contextValues = React.useMemo(() => ({
    startLoading: increaseCounter,
    endLoading: decreaseCounter
  }), [counter])

  return (
    <LoadingContext.Provider value={contextValues}>
      {counter > 0 && <LoadingOverlay />}
      {children}
    </LoadingContext.Provider>
  )
}

export default React.memo(GlobalLoading)
