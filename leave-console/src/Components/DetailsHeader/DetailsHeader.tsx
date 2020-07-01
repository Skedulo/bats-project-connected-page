import React from 'react'
import { Link } from 'react-router-dom'

import { routes } from '../../Pages'
import { classes } from '../../common/utils/classes'
import { Icon, Button } from '@skedulo/sked-ui'

import './DetailsHeader.scss'

const bem = classes('details-header')

interface DetailsHeaderProps {
  userData: {
    Name: string,
    avatarUrl: string,
    isActive: boolean,
    Category: string,
    PrimaryRegion: {
      Name: string
    },
    Rating?: number,
    ResourceTags: {
      Tag: {
        Name: string
      }
    }[]
  },
  onApprove: () => void
  onReject: () => void,
  onRecall: () => void,
  unavailabilityStatus: string
}

const DetailsHeader: React.FC<DetailsHeaderProps> = ({ 
  userData: {
    Name,
    avatarUrl,
    isActive,
    Category,
    PrimaryRegion,
    Rating,
    ResourceTags
  },
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
      <Link className={ bem('nav') } to={ routes.dashboard() }>
        <Icon name="arrowLeft" size={ 12 } /> Go Back
      </Link>
      <div className={ bem('resource') }>
        <div className={ bem('user-info-wrapper') }>
          <div className={ bem('avatar') }>
            <img
              className={ bem('avatar') }
              src={ avatarUrl }
              alt="avatar"
            />
            <div className={ bem('status', { active: isActive }) } />
          </div>
          <div className={ bem('main-info') }>
            <h1 className={ bem('name') }>{ Name }</h1>
            <div className={ bem('details') }>
              <div>
                <Icon name="jobs" size={ 14 } />
                { Category }
              </div>
              <div>
                <Icon name="pin" size={ 14 } />
                { PrimaryRegion.Name }
              </div>
              <div>
                <Icon name="attribute" size={ 14 } />
                { ((Rating ? Rating + ',' : 'No Rating')) }
                { ResourceTags.length
                  ? ResourceTags.map((e, index) => (
                    <span key={ index }>{ ', ' + e.Tag.Name }</span>
                  ))
                  : null
                }
              </div>
            </div>
          </div>
        </div>
        <div className={ bem('buttons') }>
          { !pending && <Button buttonType="secondary" onClick={ onRecall }>Recall</Button> }
          { !rejected && <Button buttonType="secondary" onClick={ onReject }>Reject</Button> }
          { !approved && <Button buttonType="primary" onClick={ onApprove }>Approve</Button> }
        </div>
      </div>
    </>
  )
}

export default DetailsHeader
