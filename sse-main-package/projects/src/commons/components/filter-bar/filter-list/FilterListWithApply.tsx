import * as React from 'react'
import classnames from 'classnames'

import { FilterList, IFilterListProps } from './FilterList'
import { FormInputElement, Button } from '@skedulo/sked-ui'
import { InputType, IFilterItem } from '../interfaces'

interface IFilterListWithApplyProps<T> {
  items: T[]
  preSelectedItems: T[]
  inputType: InputType
  applyFilter: (selectedFilterItems: T[]) => void
  isListCollapsed?: boolean
  scrollableContentClasses?: IFilterListProps<T>['scrollableContentClasses']
}

interface IFilterListWithApplyState<T extends IFilterItem> {
  selected: T[]
}

export class FilterListWithApply<T extends IFilterItem> extends React.PureComponent<
  IFilterListWithApplyProps<T>,
  IFilterListWithApplyState<T>
> {
  constructor(props: IFilterListWithApplyProps<T>) {
    super(props)
    this.state = {
      selected: props.preSelectedItems || [],
    }
  }

  getSelectedItems = (item: T, checked = false): T[] => {
    const { selected } = this.state
    const { inputType } = this.props
    switch (inputType) {
      case 'checkbox':
        return checked ? [...selected, item] : selected.filter(({ id }) => id !== item.id)
      case 'radio':
        return [item]
      default:
        return selected
    }
  }

  onItemChange = (item: T) => ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const selected = this.getSelectedItems(item, target.checked)

    this.setState({ selected })
  }

  itemRenderer = (item: T) => {
    const { inputType } = this.props
    const { selected } = this.state
    const isChecked = selected.some(({ id }) => id === item.id)

    return (
      <FormInputElement
        inlineLabelClassName="sk-pr-3 sk-flex-grow sk-flex sk-justify-between sk-items-center filter-list-item-min-height"
        inputAndInlineLabelWrapperClassName="sk-flex-grow"
        className="filter-list-input-min-width"
        name="filter-item"
        id={item.id}
        type={inputType}
        onChange={this.onItemChange(item)}
        inlineLabel={item.name}
        checked={isChecked}
      />
    )
  }

  applyFilters = () => {
    const { selected } = this.state
    this.props.applyFilter(selected)
  }

  render() {
    const { isListCollapsed, items, scrollableContentClasses } = this.props
    const { selected } = this.state

    const disabledClasses = 'disabled:sk-text-blue-200'
    const hoverClasses = 'hover:sk-bg-neutral-250 hover:sk-text-blue-600'
    const classes =
      'sk-w-full sk-flex sk-justify-center sk-bg-white sk-border sk-border-b-0 sk-border-neutral-350 sk-rounded-none sk--mt-px sk-text-blue-600'

    return (
      <>
        {!isListCollapsed && (
          <FilterList
            items={items}
            itemRenderer={this.itemRenderer}
            scrollableContentClasses={scrollableContentClasses}
          />
        )}
        <Button
          disabled={!selected.length}
          data-sk-name="sk-filter-apply"
          className={classnames(classes, disabledClasses, hoverClasses)}
          onClick={this.applyFilters}
          buttonType="transparent"
        >
          Apply
        </Button>
      </>
    )
  }
}
