import React from 'react'
import isEqual from 'lodash/isEqual'
import { connect } from 'react-redux'
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import parseISO from 'date-fns/parseISO'
import addDays from 'date-fns/addDays'

import { classes } from '../../common/utils/classes'
import Tile from '../Tile'
import AbsenceChart from '../AbsenceChart'
import UnavailabilityChart from '../UnavailabilityChart'
import { State, AbsenceData } from '../../Store/types'
import './DashboardSummary.scss'

const bem = classes('dashboard-summary')

type ReduxProps = Pick<State, 'availabilities' | 'filters' | 'resources' |'timeRange' >

interface UnavailabilityData {
  type: string
}

interface IState {
  absenceData: AbsenceData[],
  unavailabilityData: UnavailabilityData[],
  requestsStats: string
  conflictsStat: string
}

class DashboardSummary extends React.Component<ReduxProps, IState> {
  constructor(props: ReduxProps) {
    super(props)
    const daysDiff = Math.abs(differenceInCalendarDays(parseISO(this.props.timeRange.startDate), parseISO(this.props.timeRange.endDate))) 

    this.state = {
      absenceData: Array.from({length: daysDiff}, (_, i)=>({
        resources: 0,
        date: addDays(parseISO(this.props.timeRange.startDate),i)
      })),
      unavailabilityData: [],
      requestsStats: '-',
      conflictsStat: '-'
    }
  }

  componentDidMount(){
    this.populateDashboardSummary()
  }

  populateDashboardSummary() {
    if(this.props.availabilities === undefined || !this.props.availabilities.length){
      this.setState({
        absenceData: this.calculateAbsenceData() as AbsenceData[],
        unavailabilityData: [],
        requestsStats: '-',
        conflictsStat: '-'
      })
    } else if(this.props.availabilities !== undefined && this.props.availabilities.length) {
      this.setState({
        absenceData: this.calculateAbsenceData() as AbsenceData[],
        unavailabilityData: this.props.availabilities.map(availability => {return {type: availability.Type}}),
        requestsStats: this.calculateRequestsStats(),
        conflictsStat: this.calculateConflictsCount()
      })
    }
  }

  calculateAbsenceData(){
    const daysBetween = Math.abs(differenceInCalendarDays(parseISO(this.props.timeRange.startDate), parseISO(this.props.timeRange.endDate)))
    const absenceData = Array.from({length: daysBetween})

    for(let i=0; i < daysBetween; i++){
      const date = addDays(parseISO(this.props.timeRange.startDate),i)
      let resourcesCount = 0

      if(this.props.availabilities === undefined || !this.props.availabilities.length){
        resourcesCount = 0
      } else {
        this.props.availabilities.map((availability) => {
          if(new Date(date) >= new Date(parseISO(availability.Start)) && new Date(date) <= new Date(parseISO(availability.Finish))) {
            resourcesCount+=1
          }
        })
      }

      const absenceChartItem = {
        resources: resourcesCount,
        date
      }
      absenceData[i] = absenceChartItem
    }
    return absenceData
  }

  calculateRequestsStats(){
    let requestsCount = 0
    let approvedCount = 0

    this.props.availabilities!.map(availability => {
      requestsCount+= 1
      if(availability.Status === 'Approved'){
        approvedCount +=1
      }
    })

    const tileValue = `${approvedCount} / ${requestsCount} approved`
    return tileValue
  }

  calculateConflictsCount() {
    let conflictsCount = 0
    this.props.availabilities!.map(availability => {
      conflictsCount += availability.conflicts!
    })

    return conflictsCount.toString()
  }

  componentDidUpdate(prevProps: ReduxProps) {
    if(!isEqual(prevProps.filters, this.props.filters) ||
       !isEqual(prevProps.timeRange, this.props.timeRange) ||
       !isEqual(prevProps.availabilities, this.props.availabilities)){
        this.populateDashboardSummary()
    }
  }

  render(){
    return (
      <div className={ bem() }>
        <Tile
          className={ bem('tile') }
          title="Total Resources"
          amount={this.props.resources ? this.props.resources.length : 0}
          iconName="resource"
        />
        <Tile
          className={ bem('tile') }
          title="Resources on Leave"
          amount={this.props.availabilities ? this.props.availabilities.length : 0}
          iconName="resourceRemove"
        />
        <Tile
          className={ bem('tile') }
          title="Number of Requests"
          amount={this.state.requestsStats}
          iconName="availability"
        />
        <Tile
          className={ bem('tile') }
          title="Conflicts"
          amount={this.state.conflictsStat}
          iconName="warning"
          warning
        />
        <AbsenceChart className={ bem('absence-chart') } data={ this.state.absenceData } />
        <UnavailabilityChart className={ bem('unavailability-chart') } data={ this.state.unavailabilityData } />
      </div>
    )
  }
}

const mapStateToProps = (state: State) => ({
  availabilities: state.availabilities,
  filters: state.filters,
  resources: state.resources,
  timeRange: state.timeRange,
})

export default connect(mapStateToProps)(DashboardSummary)
