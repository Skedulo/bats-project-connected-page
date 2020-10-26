import * as React from 'react'
import * as ReactDOM from 'react-dom'

import LoadingIndicator from '../LoadingIndicator'

const LoadingOverlay: React.FC = () => {
  return (
    ReactDOM.createPortal(
      <LoadingIndicator />,
      document.getElementsByTagName('body')[0]
    )
  )
}

export default React.memo(LoadingOverlay)
