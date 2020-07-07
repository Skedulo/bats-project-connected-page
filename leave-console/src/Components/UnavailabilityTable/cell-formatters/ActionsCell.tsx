import * as React from 'react'
import { Link } from 'react-router-dom'

import { routes } from '../../../Pages'
import { Button } from '@skedulo/sked-ui'
import { AvailabilityStatus } from '../UnavailabilityTable'

interface IActionsCell {
  availabilityId: string
  availabilityStatus: AvailabilityStatus
  onRecall: (id: string) => void
}

const ActionsCell: React.FC<IActionsCell> = ({ availabilityId, availabilityStatus, onRecall }) => {
  return (
    <div className="cx-flex cx-items-center cx-justify-end">
      <Button
        className="cx-mr-2"
        buttonType="secondary"
        onClick={() => onRecall(availabilityId)}
        disabled={availabilityStatus === 'Pending'}
        compact
      >
        Recall
      </Button>
      <Link to={routes.resourceDetail(availabilityId) }>
        <Button buttonType={'primary'} compact>View</Button>
      </Link>
    </div>
  )
}

export default React.memo(ActionsCell)
