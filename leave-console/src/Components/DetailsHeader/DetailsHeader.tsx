import React from 'react'
import { Link } from 'react-router-dom'

import { routes } from '../../Pages'
import { classes } from '../../common/utils/classes'
import { Icon, Button } from '@skedulo/sked-ui'

import './DetailsHeader.scss'
import { Resource } from '../../Store/types'
import { getDefaultAvatar } from '../../common/utils/avatars';

const bem = classes('details-header')

interface DetailsHeaderProps {
  userData: Resource,
  onApprove: () => void
  onReject: () => void,
  onRecall: () => void,
  unavailabilityStatus: string
}

const DetailsHeader: React.FC<DetailsHeaderProps> = ({
  userData,
  onApprove,
  onReject,
  onRecall,
  unavailabilityStatus
}) => {
  const approved = unavailabilityStatus === 'Approved'
  const rejected = unavailabilityStatus === 'Declined'
  const pending = unavailabilityStatus === 'Pending'

  return (
    <>
      <Link to={routes.dashboard()} className="cx-flex cx-items-center cx-text-xs cx-p-4">
        <Icon name="chevronLeft" className="cx-text-primary" />
        <span className="cx-text-primary cx-capitalize">Go back</span>
      </Link>
      <div className="cx-flex cx-justify-between cx-px-4 ">
        <div className="cx-flex cx-items-center">
          <div className="cx-mr-4">
            <img
              className="cx-rounded-full"
              src={userData.User?.SmallPhotoUrl || getDefaultAvatar()}
              alt="avatar"
            />
          </div>
          <div className="cx-mr-8">
            <h1 className="cx-font-bold cx-text-xl cx-mb-2">{userData.Name}</h1>
            <div className="cx-flex cx-items-center">
              <div className="cx-mr-4 cx-flex cx-items-center">
                <Icon name="jobs" className="cx-text-neutral-700 cx-mr-2" />
                {userData.CoreSkill || '--'}
              </div>
              <div className="cx-mr-4 cx-flex cx-items-center">
                <Icon name="pin" className="cx-text-neutral-700 cx-mr-2" />
                {userData.PrimaryRegion?.Name || '--'}
              </div>
              <div className="cx-flex cx-items-center">
                <Icon name="tag" className="cx-text-neutral-700 cx-mr-2" />
                {userData.Depot?.Name || '--'}
              </div>
            </div>
          </div>
        </div>
        <div className={ bem('buttons') }>
          {!pending && <Button buttonType="secondary" onClick={ onRecall }>Recall</Button> }
          {pending && <Button buttonType="secondary" onClick={onReject}>Reject</Button> }
          {pending && <Button buttonType="primary" onClick={onApprove}>Approve</Button> }
        </div>
      </div>
    </>
  )
}

export default DetailsHeader
