import React from 'react'
import { connect } from 'react-redux'
import isEqual from 'lodash/isEqual'

import { DynamicTable, IDynamicTable, Pagination } from '@skedulo/sked-ui'
import { State, UnavailabilityTableItem } from '../../Store/types'
import { filterBySearchPhrase } from './tableFilters'
import { getColumns } from './TableConfig'

import './UnavailabilityTable.scss'
import { IDynamicTableColumn } from '@skedulo/sked-ui/dist/components/dynamic-table/interfaces'
import SearchBox from '../SearchBox'

export type AvailabilityStatus = 'Pending' | 'Approved' | 'Declined'

type ReduxProps = Pick<State,
  'unavailabilities'
>

const itemsPerPage = 20

interface IProps extends ReduxProps {
  onRecall: (unavailability: UnavailabilityTableItem) => void,
}

interface IState {
  tableColumns: IDynamicTableColumn<UnavailabilityTableItem>[],
  filteredItems?: UnavailabilityTableItem[],
  currentPage: number,
  selectedAvailabilityUIDs: Set<string>,
  isBatchApproveModalOpened: boolean,
  isBatchRejectModalOpened: boolean,
  updateStatusModalProps: any
}

class UnavailabilityTable extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      tableColumns: getColumns({
        onRecall: (unavailability: UnavailabilityTableItem) => this.props.onRecall(unavailability),
      }),
      currentPage: 1,
      selectedAvailabilityUIDs: new Set(),
      isBatchApproveModalOpened: false,
      isBatchRejectModalOpened: false,
      updateStatusModalProps: { isOpened: false }
    }
  }

  populateUnavailabilityTable() {
    if (this.props.unavailabilities !== undefined) {
      this.setState({
        filteredItems: this.props.unavailabilities as UnavailabilityTableItem[]
      })
    } else {
      this.setState({ filteredItems: [] })
    }
  }

  componentDidMount() {
    this.populateUnavailabilityTable()
  }

  componentDidUpdate(prevProps: any) {
    if (!isEqual(prevProps.unavailabilities, this.props.unavailabilities)) {
      this.populateUnavailabilityTable()
    }
  }

  onSearch = (searchPhrase: string) => {
    if (this.props.unavailabilities !== undefined && this.props.unavailabilities.length) {
      this.setState({
        filteredItems: filterBySearchPhrase(this.props.unavailabilities, searchPhrase),
        currentPage: 1
      })
    }
  }

  onSearchClear = () => {
    this.setState({
      filteredItems: this.props.unavailabilities
    })
  }

  onPageChange = (page: number) => {
    this.setState({
      currentPage: page
    })
  }

  getDisplayedItems() {
    if (this.state.filteredItems) {
      return this.state.filteredItems!.slice(
          (this.state.currentPage - 1) * itemsPerPage,
          this.state.currentPage * itemsPerPage
        )
    }
    return []
  }

  renderNoTimesheetsPlaceholder() {
    return (
      <div className="cx-flex cx-items-center cx-justify-center cx-w-full">
        <span className="cx-text-xs cx-mt-12 cx-mb-8">No timesheets available</span>
      </div>
    )
  }

  render() {
    const displayedItems = this.getDisplayedItems()

    if (displayedItems) {
      return (
        <div className="unavailabilities-table">
          <section className="cx-p-4 cx-flex cx-justify-between cx-items-center">
            <h2 className="cx-text-lg cx-font-bold">Unavailability Request</h2>
            <SearchBox
              className="cx-w-1/4 cx-border-b"
              placeholder="unavailabilities"
              onChange={this.onSearch}
              autoFocus={false}
            />
          </section>
          <section>
            <DynamicTable
              data={displayedItems}
              columns={this.state.tableColumns}
              initialRowStateKey="id"
            />
            { displayedItems.length === 0 && this.renderNoTimesheetsPlaceholder() }
          </section>
          {
            displayedItems.length > 0 && (
              <section>
                <Pagination
                  itemsTotal={ this.state.filteredItems!.length }
                  itemsPerPage={ itemsPerPage }
                  currentPage={ this.state.currentPage }
                  onPageChange={ this.onPageChange }
                />
              </section>
            )
          }
        </div>
      )
    }

    return (<div>Loading...</div>)
  }
}

const mapStateToProps = (state: State) => ({
  unavailabilities: state.unavailabilities || []
})

export default connect(mapStateToProps)(UnavailabilityTable)

