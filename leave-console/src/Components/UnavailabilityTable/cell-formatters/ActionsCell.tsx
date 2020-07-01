import * as React from 'react'
import { Link } from 'react-router-dom'

import { routes } from '../../../Pages'
import { classes } from '../../../common/utils/classes'
import { Button, ButtonDropdown, Menu, MenuItem } from '@skedulo/sked-ui'
import { AvailabilityStatus } from '../UnavailabilityTable'

import './ActionsCell.scss'

const bem = classes('actions-cell')

interface IActionsCell {
  availabilityId: string
  availabilityStatus: AvailabilityStatus
  onApprove: (id: string) => void,
  onReject: (id: string) => void,
  onRecall: (id: string) => void
}

export const ActionsCell: React.FC<IActionsCell> = ({ availabilityId, availabilityStatus, onReject, onApprove, onRecall }) => {
  const statusActions = {
    Pending: [
      { label: 'Approve', type: 'secondary', onClick: () => onApprove(availabilityId) },
      { label: 'Decline', type: 'secondary', onClick: () => onReject(availabilityId) }
    ],
    Approved: [
      { label: 'Decline', type: 'secondary', onClick: () => onRecall(availabilityId) }
    ],
    Declined: [
      { label: 'Recall', type: 'secondary', onClick: () => onRecall(availabilityId) }
    ]
  }
  const availableActions = statusActions[availabilityStatus]

  return (
    <div className={ bem() }>
      { availableActions.length > 1 ? (
          <ButtonDropdown
            label="Actions"
            compact={ true }
            disabled={ false }
            buttonType="secondary"
          >
            <Menu>
              { availableActions.map(action => (
                <MenuItem key={ action.label } onClick={ action.onClick }>
                  { action.label }
                </MenuItem>
              )) }
            </Menu>
          </ButtonDropdown>
        ) : (
          <Button
            buttonType={ 'secondary' }
            compact
            onClick={ () => onRecall(availabilityId) }
          >
            Recall
          </Button>
        )
      }
      <Link to={ routes.resourceDetail(availabilityId) }>
        <Button buttonType={ 'primary' } compact>View</Button>
      </Link>
    </div>
  )
}
