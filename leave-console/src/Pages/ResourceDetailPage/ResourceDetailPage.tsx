import React, { memo } from 'react'
import { startOfDay, startOfMonth, parseISO, endOfDay, endOfMonth } from 'date-fns'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router-dom'

import { classes } from '../../common/utils/classes'
import { Button } from '@skedulo/sked-ui'
import AbsenceTables from '../../Components/AbsenceTables'
import UnavailabilityDetails from '../../Components/UnvailabilityDetails'
import DetailsHeader from '../../Components/DetailsHeader'
import RescheduleModal from '../../Components/RescheduleModal'
import { State, Resource, UnavailabilityTableItem, TimeRange } from '../../Store/types'
import { setTimeRange, setTimeRangeSimp } from '../../Store/reducers/timeRange'
import { updateAvailability } from '../../Mutations/input'

import './ResourceDetailPage.scss'
import { getDefaultAvatar } from '../../common/utils/avatars'

const bem = classes('resource-detail-page')

const TABLE_DATA = {
  resourcesOff: 5
}

const RESOURCES = [
  'Resource 1', 'Resource 2', 'Resource 3'
]
const JOB = 'JOB-1862'

type RouteProps = RouteComponentProps<{availabilityId?: string}>

interface Props extends RouteProps {
  resources?: Resource[]
  unavailabilities?: UnavailabilityTableItem[]
  setTimeRange: typeof setTimeRange
  setTimeRangeSimp: typeof setTimeRangeSimp
  timeRange: TimeRange
  unavailability?: UnavailabilityTableItem
  updateAvailability: typeof updateAvailability
}

interface ResourceDetailPageState {
  rescheduleModalVisible: boolean,
  customState?: string,
  originalTimeRange: TimeRange
  showConflictDetails: boolean,
  resource?: Resource
}

const ResourceDetailPage: FC<Props, ResourceDetailPageState> = ({ }) => {
  return (
    // <div className={ bem() }>
    //   <DetailsHeader 
    //     userData={ this.state.resource } 
    //     unavailabilityStatus={ this.props.unavailability.Status }
    //     onApprove={ () => this.props.updateAvailability({ UID: this.props.unavailability!.UID, Status: 'Approved' }) }
    //     onReject={ () => this.props.updateAvailability({ UID: this.props.unavailability!.UID, Status: 'Declined' }) }
    //     onRecall={ () => this.props.updateAvailability({ UID: this.props.unavailability!.UID, Status: 'Pending' }) }
    //   />
    //   <UnavailabilityDetails data={ this.props.unavailability } />
    //   <AbsenceTables
    //     data={ {
    //       ...TABLE_DATA,
    //       unavailability: this.props.unavailability
    //     } }
    //   />
    //   { /* TODO: move to Work Conflicts table */ }
    //   { this.state.rescheduleModalVisible &&
    //       <RescheduleModal
    //         resources={ RESOURCES }
    //         job={ JOB }
    //         toggleModalVisibility={ this.toggleModalVisibility }
    //       />
    //   }
    //   { /* TODO: remove this button after adding Work conflicts table it's for delelopment/demo purpose only */ }
    //   <Button buttonType="primary" onClick={ () => this.toggleModalVisibility() }>show reschedule modal</Button>
    // </div >
    <div>hello</div>
  )
}

export default memo(ResourceDetailPage)
