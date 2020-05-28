import * as React from 'react'
import defaultTo from 'lodash/defaultTo'
import isEqual from 'lodash/isEqual'
import { FilterPill } from './filter-pill/FilterPill'
import { PopOut, Button } from '@skedulo/sked-ui'
import { IFilter, IAppliedFilter as AppliedFilter, IFilterItem as FilterItem, IAddedFilter } from './interfaces'
import { FilterList } from './filter-list/FilterList'
import { FilterListWithApply } from './filter-list/FilterListWithApply'
import { FilterSearch } from './filter-list/FilterSearch'
import { RemoteSearch } from './filter-list/RemoteSearch'

export type IAppliedFilter<T extends FilterItem> = AppliedFilter<T>
export type IFilterItem = FilterItem

export interface IFilterBarProps<T extends IFilterItem> {
  /**
   * An array of filter options.
   * If a filter item is set to 'static' then it is permanently fixed and unable to be edited.
   */
  filters: IFilter<T>[]
  onFilter: (filters: IFilterBarState<T>['appliedFilters']) => void
  /**
   * Apply custom styles to the content of the filter list.
   */
  scrollableContentClasses?: string
  forceUpdate?: boolean
}

interface IFilterBarState<T extends IFilterItem> {
  appliedFilters: IAppliedFilter<T>[]
  addedFilter: IAddedFilter | null
  editFilterId: string | null
}

export class FilterBar<T extends IFilterItem> extends React.PureComponent<IFilterBarProps<T>, IFilterBarState<T>> {
  constructor(props: IFilterBarProps<T>) {
    super(props)

    this.state = {
      appliedFilters: [],
      addedFilter: null,
      editFilterId: null,
    }
  }

  async componentDidMount() {
    // add any filters that are already set.
    const appliedFilters = this.props.filters
      .filter((filter) => filter.isReadonly || filter.selectedIds.length)
      .map((filter) => {
        return {
          id: filter.id,
          name: filter.name,
          isReadonly: filter.isReadonly || false,
          removable: defaultTo(filter.removable, true),
          selectedItems: filter.items.filter((item) => filter.selectedIds.find((selectedId) => selectedId === item.id)),
        }
      })

    this.setState({
      appliedFilters,
    })
  }

  componentDidUpdate(prevProps: IFilterBarProps<T>) {
    if (!isEqual(prevProps.filters, this.props.filters) && prevProps.filters.length && this.props.filters.length) {
      // add any filters that are already set.
      const appliedFilters = this.props.filters
        .filter((filter) => filter.isReadonly || filter.selectedIds.length)
        .map((filter) => {
          return {
            id: filter.id,
            name: filter.name,
            isReadonly: filter.isReadonly || false,
            removable: defaultTo(filter.removable, true),
            selectedItems: filter.items.filter((item) =>
              filter.selectedIds.find((selectedId) => selectedId === item.id)
            ),
          }
        })

      this.setState({
        appliedFilters,
      })
    }
    if (!prevProps.forceUpdate && !!this.props.forceUpdate) {
      const appliedFilters = this.props.filters
        .filter((filter) => filter.isReadonly || filter.selectedIds.length)
        .map((filter) => {
          return {
            id: filter.id,
            name: filter.name,
            isReadonly: filter.isReadonly || false,
            removable: defaultTo(filter.removable, true),
            selectedItems: filter.items.filter((item) =>
              filter.selectedIds.find((selectedId) => selectedId === item.id)
            ),
          }
        })

      this.setState({
        appliedFilters,
      })
    }
  }

  /**
   * When we 'add' a filter, we add a pill item to the filter bar and then list the options for it.
   * It is not yet 'applied' until we select options.
   * If we click on the add button for a filter that is already added, we want to launch an edit mode for it.
   */
  addFilter = (hideAddFilterDropdownList: () => void, filterToAdd: IAddedFilter) => () => {
    // edit existing filter if applicable
    if (this.state.appliedFilters.find((appliedFilter) => appliedFilter.id === filterToAdd.id)) {
      this.editFilter(filterToAdd.id)
    } else {
      // add it otherwise
      this.setState({
        addedFilter: filterToAdd,
      })
    }

    // hide add filter dropdown list
    hideAddFilterDropdownList()
  }

  applyChangesToExistingFilter = (editFilterId: string, selectedItems: T[], existingFilters: IAppliedFilter<T>[]) => {
    return existingFilters.map((existingFilter) => {
      if (existingFilter.id === editFilterId) {
        return {
          ...existingFilter,
          selectedItems,
        }
      }

      return existingFilter
    })
  }

  applyChangesToNewFilter = (filter: IFilter<T>, selectedItems: T[], existingFilters: IAppliedFilter<T>[]) => {
    return [
      ...existingFilters,
      {
        name: filter.name,
        id: filter.id,
        isReadonly: false,
        removable: defaultTo(filter.removable, true),
        selectedItems,
      },
    ]
  }

  /**
   *  Apply a filter to the filter bar with the options we have selected.
   */
  applySelectedItemsToFilter = (filter: IFilter<T>, selectedFilterItems: T[]) => {
    const { appliedFilters, editFilterId } = this.state

    const newlyAppliedFilters = editFilterId
      ? this.applyChangesToExistingFilter(editFilterId, selectedFilterItems, appliedFilters)
      : this.applyChangesToNewFilter(filter, selectedFilterItems, appliedFilters)

    this.setState({
      appliedFilters: newlyAppliedFilters,
      // Given we have now applied the filter we have added, we now want to clear it.
      // Doing so will remove the 'temporary' pill.
      addedFilter: null,
      editFilterId: null,
    })

    return newlyAppliedFilters
  }

  applyAndSaveFilters = (filter: IFilter<T>) => (selectedFilterItems: T[]) => {
    // apply filters into state
    const appliedFilters = this.applySelectedItemsToFilter(filter, selectedFilterItems)

    // save
    this.saveFilters(appliedFilters)
  }

  saveFilters = (filters: IAppliedFilter<T>[]) => {
    this.props.onFilter(filters)
  }

  renderAddFilterButton = () => {
    return (
      <Button
        data-sk-name="filter-add-button"
        buttonType="transparent"
        icon="zoomIn"
        className="sk-px-3 sk-text-blue-600 hover:sk-text-blue-700 hover:sk-bg-transparent sk-py-1 sk-mr-2 sk-leading-normal sk-mt-px"
      >
        Add filter
      </Button>
    )
  }

  /**
   * Render the add filter control button.
   */
  renderAddFilterControl = () => {
    const filterNames = this.props.filters
      // If a filter is readonly then we don't need to show it in the list of selectable filters.
      .filter((propFilter) => !propFilter.isReadonly)
      .map((propFilter) => ({ id: propFilter.id, name: propFilter.name }))

    if (!filterNames.length) {
      return null
    }

    // item renderer when adding a filter.
    const renderItem = (toggleDropdown: () => void) => (filter: IFilterItem) => {
      const appliedFilter = this.state.appliedFilters.find((appFilter) => appFilter.id === filter.id)

      return (
        <div
          onClick={this.addFilter(toggleDropdown, { ...filter, preSelectedItems: [] })}
          className="sk-flex sk-flex-grow sk-justify-between sk-items-center filter-list-item-min-height"
        >
          {filter.name}
          {appliedFilter && (
            <div className="sked-badge-min-w sk-text-xxs sk-font-medium sk-tracking-wide sk-h-5 sk-pb-px sk-rounded-full sk-inline-flex sk-items-center sk-justify-center sk-text-blue-600 sk-bg-blue-100 sk-mx-2">
              {appliedFilter.selectedItems.length}
            </div>
          )}
        </div>
      )
    }

    // if we have filters to render, display them.
    return (
      <PopOut trigger={this.renderAddFilterButton} popOutContainer={(container) => container} closeOnOuterClick>
        {(toggleDropdown) => (
          <div className="sk-shadow sk-mt-1">
            <FilterSearch placeholder="filter" className="sk-rounded-t" items={filterNames}>
              {({ filteredItems }) => (
                <FilterList
                  className="sk-rounded-b"
                  itemRenderer={renderItem(toggleDropdown)}
                  items={filteredItems}
                  scrollableContentClasses={this.props.scrollableContentClasses}
                />
              )}
            </FilterSearch>
          </div>
        )}
      </PopOut>
    )
  }

  clearTemporaryPill = () => {
    this.setState({
      addedFilter: null,
      editFilterId: null,
    })
  }

  closeTemporaryPill = () => () => {
    return this.clearTemporaryPill()
  }

  renderFilterItemSearch = (filter: IFilter<T>, preSelectedItems: T[], scrollableContentClasses?: string) => {
    // render remote search if applicable
    if (filter.useFetch) {
      return (
        <RemoteSearch
          useFetch={filter.useFetch}
          placeholder={filter.name}
          className="sk-rounded-t"
          preSelectedItems={preSelectedItems}
        >
          {({ fetchedItems, searchTerm, isFetching }) => (
            <FilterListWithApply
              applyFilter={this.applyAndSaveFilters(filter)}
              items={fetchedItems as T[]}
              inputType={filter.inputType}
              isListCollapsed={(!searchTerm.length && !preSelectedItems.length) || isFetching}
              preSelectedItems={preSelectedItems}
              scrollableContentClasses={scrollableContentClasses}
            />
          )}
        </RemoteSearch>
      )
    }

    // render local search if applicable
    if (filter.searchable) {
      return (
        <FilterSearch placeholder={filter.name} className="sk-rounded-t" items={filter.items}>
          {({ filteredItems }) => (
            <FilterListWithApply
              applyFilter={this.applyAndSaveFilters(filter)}
              items={filteredItems as T[]}
              inputType={filter.inputType}
              preSelectedItems={preSelectedItems}
              scrollableContentClasses={scrollableContentClasses}
            />
          )}
        </FilterSearch>
      )
    }

    // render base list if all else fails
    return (
      <FilterListWithApply
        applyFilter={this.applyAndSaveFilters(filter)}
        items={filter.items}
        inputType={filter.inputType}
        preSelectedItems={preSelectedItems}
        scrollableContentClasses={scrollableContentClasses}
      />
    )
  }

  /**
   * After we 'add' a filter, we want to render this 'temporary' pill in the filter bar.
   * This temporary pill will be removed once we hit apply or exit out of the dropdown.
   */
  renderTemporaryPill = (filterName: string, filterId: string, preSelectedItems: T[]) => {
    const filterSelected = this.props.filters.find((propFilter) => propFilter.id === filterId)
    const temporaryPill = (
      <FilterPill
        key={`filter-${filterId}`}
        id={filterId}
        name={filterName}
        selectedItems={preSelectedItems}
        removable={filterSelected?.removable}
        onRemove={this.removeFilter}
        className="sk-border-blue-600 sk-bg-blue-100"
      />
    )

    return (
      <PopOut
        onClose={this.closeTemporaryPill()}
        trigger={() => temporaryPill}
        key={`${filterName}-${filterId}`}
        popOutContainer={(container) => container}
        openOnMount
        closeOnOuterClick
      >
        {() => (
          <div className="sk-shadow sk-mt-1">
            {filterSelected &&
              this.renderFilterItemSearch(filterSelected, preSelectedItems, this.props.scrollableContentClasses)}
          </div>
        )}
      </PopOut>
    )
  }

  removeFilter = (filterId: string) => {
    const { appliedFilters } = this.state

    const updatedAppliedFilters = appliedFilters.filter((appliedFilter) => appliedFilter.id !== filterId)

    this.setState({
      appliedFilters: updatedAppliedFilters,
    })

    this.saveFilters(updatedAppliedFilters)
  }

  editFilter = (filterId: string) => {
    this.setState({
      editFilterId: filterId,
    })
  }

  render() {
    const { renderAddFilterControl, renderTemporaryPill, removeFilter, editFilter, state } = this
    const { appliedFilters, addedFilter, editFilterId } = state

    return (
      <div data-sk-name="filter-bar" className="sk-flex">
        {appliedFilters.map((filter) => {
          if (filter.id === editFilterId) {
            // return in edit mode if necessary
            return this.renderTemporaryPill(filter.name, filter.id, filter.selectedItems)
          }

          return (
            <FilterPill
              onEdit={editFilter}
              onRemove={removeFilter}
              className="sk-bg-neutral-200"
              key={`filter-${filter.id}`}
              id={filter.id}
              name={filter.name}
              selectedItems={filter.selectedItems}
              isReadonly={filter.isReadonly}
              removable={filter.removable}
            />
          )
        })}

        {/* If we are adding a new filter, render a temporary pill with options for that filter */}
        {addedFilter && renderTemporaryPill(addedFilter.name, addedFilter.id, [])}

        {renderAddFilterControl()}
      </div>
    )
  }
}
