import * as React from 'react'
import { noop } from 'lodash'
import classname from 'classnames'

import { Button, Icon } from '@skedulo/sked-ui'

import { IAppliedFilter, IFilterItem } from '../interfaces'

interface IFilterPillProps {
  onRemove: (filterId: string) => void
  onEdit: (filterId: string) => void
  isReadonly?: boolean
  removable?: boolean
  className?: string
}

export type FilterPillProps<T extends IFilterItem> = IFilterPillProps &
Omit<IAppliedFilter<T>, 'isReadonly' | 'removable'>

export class FilterPill<T extends IFilterItem> extends React.PureComponent<FilterPillProps<T>, {}> {
  static defaultProps = {
    onRemove: noop,
    onEdit: noop,
    removable: true
  }

  renderedSelectedItems = (selected: IFilterItem[]) => {
    if (selected.length > 2) {
      return `${selected.length} selected`
    }

    return selected.map(item => item.name).join(', ')
  }

  removeFilter = (filterId: string, onRemove: IFilterPillProps['onRemove']) => (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    // stop propogation so that the 'edit' control isn't triggered.
    e.stopPropagation()
    onRemove(filterId)
  }

  editFilter = (filterId: string, onEdit: IFilterPillProps['onRemove'], isReadonly: boolean) => () => {
    if (!isReadonly) {
      onEdit(filterId)
    }
  }

  renderCloseButton = (
    name: string,
    onRemove: IFilterPillProps['onRemove'],
    selected: IFilterItem[],
    removable: boolean,
    isReadonly?: boolean
  ) => {
    // if a filter is readonly or we have not selected any items yet, do not render a close option.
    if (isReadonly || !removable || !selected.length) {
      return null
    }

    return (
      <Button
        onClick={this.removeFilter(name, onRemove)}
        data-sk-name="sk-remove-filter"
        buttonType="transparent"
        className="sk-inline-block sk-pl-3 sk-pr-0 sk-py-1 sk-m-0 sk-border-0 sk-text-neutral-550 hover:sk-text-neutral-750 hover:sk-bg-transparent"
      >
        <Icon name="remove" size={8} />
      </Button>
    )
  }

  render () {
    const { id, name, selectedItems, className, onRemove, isReadonly, onEdit, removable } = this.props

    const pillClasses = classname(
      'sk-leading-normal sk-flex sk-h-8 sk-border sk-max-w-xs sk-rounded sk-items-center sk-mr-2 sk-cursor-default sk-border-transparent sk-px-3 sk-text-xs sk-font-regular sk-text-neutral-750',
      { 'hover:sk-cursor-not-allowed': isReadonly },
      { 'hover:sk-cursor-pointer hover:sk-bg-blue-100': !isReadonly },
      className
    )

    return (
      <div
        data-sk-name={`filter-pill-${id}`}
        className={pillClasses}
        onClick={this.editFilter(id, onEdit, !!isReadonly)}
      >
        <span className=" sk-truncate sk-inline-block">
          <span data-sk-name="filter-name">{name}</span>:&nbsp;
          <span data-sk-name="selected-options" className="sk-text-sm sk-font-medium sk-text-neutral-850 sk-max-w-full">
            {this.renderedSelectedItems(selectedItems)}
          </span>
        </span>
        {this.renderCloseButton(id, onRemove, selectedItems, !!removable, isReadonly)}
      </div>
    )
  }
}
