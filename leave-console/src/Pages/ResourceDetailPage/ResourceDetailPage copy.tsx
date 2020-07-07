import React from 'react'
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

class ResourceDetailPage extends React.PureComponent<Props, ResourceDetailPageState> {
  state = {
    rescheduleModalVisible: false,
    originalTimeRange: this.props.timeRange,
    showConflictDetails: false,
    resource: this.getResourceData()
  }

  componentDidMount = () => {
    this.adjustTimeRangeToUnavailability()
  }

  componentWillUnmount = () => {
    const { originalTimeRange: { startDate, endDate } } = this.state
    this.props.setTimeRange(parseISO(startDate), parseISO(endDate))
  }

  componentDidUpdate = (prevProps: Props) => {
    const { match, unavailabilities } = this.props
    if (prevProps.match.params.availabilityId !== match.params.availabilityId && !!unavailabilities) {
      this.adjustTimeRangeToUnavailability()
      this.setState({ resource: this.getResourceData() })
    }
  }

  getResourceData() {
    if (this.props.unavailabilities && this.props.resources) {
      const resource = this.props.resources.find(resource => resource.UID === this.props.unavailability!.Resource.UID)
      if (resource) {
        return {
          ...resource,
          avatarUrl: resource.User ? resource.User.SmallPhotoUrl : getDefaultAvatar()
        }
      }
    }

    return null
  }

  adjustTimeRangeToUnavailability() {
    if (this.props.unavailability) {
      const timeRangeStart = startOfDay(startOfMonth(parseISO(this.props.unavailability.Start)))
      const timeRangeEnd = endOfDay(endOfMonth(timeRangeStart))
      this.props.setTimeRangeSimp(timeRangeStart, timeRangeEnd)
    }
  }

  toggleModalVisibility = () => (
    this.setState(prevState => ({
      rescheduleModalVisible: !prevState.rescheduleModalVisible
    }))
  )

  toggleConflictDetailsVisibility = () => (
    this.setState(prevState => ({
      showConflictDetails: !prevState.showConflictDetails
    }))
  )

  render() {
    return (
      this.props.unavailability &&
      <div className={ bem() }>
        <DetailsHeader 
          userData={ this.state.resource } 
          unavailabilityStatus={ this.props.unavailability.Status }
          onApprove={ () => this.props.updateAvailability({ UID: this.props.unavailability!.UID, Status: 'Approved' }) }
          onReject={ () => this.props.updateAvailability({ UID: this.props.unavailability!.UID, Status: 'Declined' }) }
          onRecall={ () => this.props.updateAvailability({ UID: this.props.unavailability!.UID, Status: 'Pending' }) }
        />
        <UnavailabilityDetails data={ this.props.unavailability } />
        <AbsenceTables
          data={ {
            ...TABLE_DATA,
            unavailability: this.props.unavailability
          } }
        />
        { /* TODO: move to Work Conflicts table */ }
        { this.state.rescheduleModalVisible &&
            <RescheduleModal
              resources={ RESOURCES }
              job={ JOB }
              toggleModalVisibility={ this.toggleModalVisibility }
            />
        }
        { /* TODO: remove this button after adding Work conflicts table it's for delelopment/demo purpose only */ }
        <Button buttonType="primary" onClick={ () => this.toggleModalVisibility() }>show reschedule modal</Button>
      </div >
    )
  }
}

const mapStateToProps = (state: State, ownProps: Props) => ({
  resources: state.resources,
  availabilities: state.availabilities,
  timeRange: state.timeRange,
  unavailabilities: state.unavailabilities
})

const mapDispatchToProps = {
  setTimeRange,
  setTimeRangeSimp,
  updateAvailability
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceDetailPage)
