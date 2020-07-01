import React from 'react'
import { connect } from 'react-redux'
import { initSubscriptionService, registerNewSubscription } from '../../Store/reducers/subscription'
import { getResources } from '../../Store/reducers/fetch'
import { updateAvailability } from '../../Mutations/input'
import { State } from '../../Store/types'
import { classes } from '../../common/utils/classes'
import TimeRangeControl from '../../Components/TimeRangeControl'
import Filters from '../../Components/Filters'
import DashboardSummary from '../../Components/DashboardSummary'
import UnavailabilityTable from '../../Components/UnavailabilityTable'

import './DashboardPage.scss'
import { IconButton } from '@skedulo/sked-ui'
import { routes } from '..'
import { Link } from 'react-router-dom'

const bem = classes('dashboard-page')

type ReduxProps = Pick<State,
  'resources' | 'availabilities' | 'subscriptionStatus'
>
interface IProps extends ReduxProps {
  getResources: typeof getResources
  updateAvailability: typeof updateAvailability
  initSubscriptionService: typeof initSubscriptionService
  registerNewSubscription: typeof registerNewSubscription
}

class DashboardPage extends React.PureComponent<IProps, {}> {
  constructor(props: IProps) {
    super(props)
  }

  componentDidMount() {
    this.props.getResources()
    this.props.initSubscriptionService()
  }

  componentDidUpdate(prevProps: IProps) {
    if (prevProps.subscriptionStatus !== 'connected' && this.props.subscriptionStatus === 'connected') {
      this.props.registerNewSubscription('AvailabilityUpdate', undefined, true)
    }
  }

  onApprove = (id: string) => {
    this.props.updateAvailability({ UID: id, Status: 'Approved' })
  }

  onReject = (id: string) => {
    this.props.updateAvailability({ UID: id, Status: 'Declined' })
  }

  onRecall = (id: string) => {
    this.props.updateAvailability({ UID: id, Status: 'Pending' })
  }

  render() {
    return (
      <>
        <section className={ bem('filters') }>
          <Link to={ routes.settings() }>
            <IconButton icon="settings" tooltipContent="Setting" />
          </Link>
          <TimeRangeControl />
          <Filters />
        </section>
        <section>
          <DashboardSummary />
        </section>
        {/* <section>
          <UnavailabilityTable
            onApprove={ this.onApprove }
            onReject={ this.onReject }
            onRecall={ this.onRecall }
          />
        </section> */}
      </>
    )
  }
}

const mapStateToProps = (state: State) => ({
  resources: state.resources,
  availabilities: state.availabilities,
  subscriptionStatus: state.subscriptionStatus
})

const mapDispatchToProps = {
  getResources,
  updateAvailability,
  initSubscriptionService,
  registerNewSubscription
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardPage)
