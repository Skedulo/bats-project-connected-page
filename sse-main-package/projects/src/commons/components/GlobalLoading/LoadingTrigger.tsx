import * as React from 'react'
import LoadingContext from './LoadingContext'

const  LoadingTrigger: React.FC = () => {
  const values = React.useContext(LoadingContext)
  const { startLoading, endLoading } = values

  React.useEffect(() => {
    startLoading()
    return () => endLoading()
  }, [])
  return null
}

export default React.memo(LoadingTrigger)
