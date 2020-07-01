import React from 'react'
import './ActionBar.scss'

interface IProps {
  onSearch: (searchPhrase: string) => void,
  onSearchClear: () => void,
}

const ActionBar: React.FunctionComponent<IProps> = ({ onSearch, onSearchClear }) => {
  return (
    <div className="action-bar">
      <div className="action-bar__left">
        <span className="action-bar__title">
          Unavailability Requests
        </span>
      </div>
      {/* <div className="action-bar__right">
        <div className="action-bar__items">
          <ActionBarSearch
            onSearch={ onSearch }
            onClear={ onSearchClear }
          />
        </div>
      </div> */}
    </div>
  )
}

export default ActionBar
