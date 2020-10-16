import * as React from 'react'

import { useGlobalLoading } from './hooks'

const LoadingTrigger: React.FC = () => {
  const { startGlobalLoading, endGlobalLoading } = useGlobalLoading()

  React.useEffect(() => {
    startGlobalLoading()
    return () => endGlobalLoading()
  }, [startGlobalLoading, endGlobalLoading])

  return null
}

export default React.memo(LoadingTrigger)
