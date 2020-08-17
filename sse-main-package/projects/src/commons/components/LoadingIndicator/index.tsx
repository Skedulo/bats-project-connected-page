import * as React from 'react'
import { Loading } from '@skedulo/sked-ui'

const LoadingIndicator: React.FC = () => {
  return (
    <div className="cx-inset-0 cx-absolute cx-z-99999 cx-flex cx-items-center">
      <div className="cx-fixed cx-bg-white cx-opacity-50 cx-inset-0" />
      <Loading />
    </div>
  )
}

export default React.memo(LoadingIndicator)
