import React from 'react'
import { connect } from 'react-redux'

import { State } from '../../Store/types'
import { setupFilters, setFiltersValues } from '../../Store/reducers/filter'

import './Filters.scss'

type ReduxProps = Pick<State,
  'availabilities' | 'filters' | 'timeRange'
>
interface IProps extends ReduxProps {
  setupFilters: () => void,
  setFiltersValues: (values: { name: string, value: any }[]) => void
}

class Filters extends React.PureComponent<IProps, {}> {
  componentDidMount() {
    this.props.setupFilters()
  }

  filterDescriptionToName(description: string) {
    return this.props.filters.find(filter => filter.description === description)!.name
  }

  render() {
    return (
      <div>
        {
          // this.props.filters.length > 0 && <Filter { ...this.getFilterProps() } />
        }
        filter
      </div>
    )
  }
}

const mapStateToProps = (state: State) => ({
  availabilities: state.availabilities,
  filters: state.filters,
  timeRange: state.timeRange
})

const mapDispatchToProps = { setupFilters, setFiltersValues }

export default connect(mapStateToProps, mapDispatchToProps)(Filters)
