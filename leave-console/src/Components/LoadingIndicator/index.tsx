import * as React from 'react'
import { Loading } from '@skedulo/sked-ui'

const LoadingIndicator: React.FC = () => {
  return (
    <div className="sk-inset-0 sk-absolute sk-z-99999 sk-flex sk-items-center">
      <div className="sk-fixed sk-bg-white sk-opacity-50 sk-inset-0" />
      <Loading />
    </div>
  )
}

export default React.memo(LoadingIndicator)
