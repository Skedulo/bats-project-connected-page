import React from 'react'
import { connect } from 'react-redux'
import isEqual from 'lodash/isEqual'

import { DynamicTable, IDynamicTable, Pagination } from '@skedulo/sked-ui'
import { State, UnavailabilityTableItem } from '../../Store/types'
import ActionBar from '../ActionBar'
import { filterBySearchPhrase } from './tableFilters'
import { getColumns } from './TableConfig'

import './UnavailabilityTable.scss'
import { IDynamicTableColumn } from '@skedulo/sked-ui/dist/components/dynamic-table/interfaces'

export type AvailabilityStatus = 'Pending' | 'Approved' | 'Declined'

type ReduxProps = Pick<State,
  'unavailabilities'
>

const itemsPerPage = 20

interface IProps extends ReduxProps {
  onReject: (id: string) => void,
  onApprove: (id: string) => void,
  onRecall: (id: string) => void,
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
        onApprove: (id: string) => this.props.onApprove(id),
        onRecall: (id: string) => this.props.onRecall(id),
        onReject: (id: string) => this.props.onReject(id)
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
          <section>
            <ActionBar
              onSearch={ this.onSearch }
              onSearchClear={ this.onSearchClear }
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
