import * as React from 'react'
import classnames from 'classnames'
import { IFilterItem } from '../interfaces'

export interface IFilterListProps<T> {
  items: T[]
  itemRenderer: (item: T) => JSX.Element
  className?: string
  scrollableContentClasses?: string
}

const renderFilterData = <T extends IFilterItem>(items: T[], itemRenderer: IFilterListProps<T>['itemRenderer']) => {
  const baseClasses = classnames('sk-leading-normal sk-text-sm sk-flex sk-items-center sk-py-1 sk-text-neutral-850 sk-pl-3 sk-break-word')
  const resultsClasses = classnames('hover:sk-bg-neutral-250', baseClasses)
  const noResultsClasses = classnames('hover:sk-cursor-default', baseClasses)

  return (
    <ul className="sk-cursor-pointer sk-my-1">
      {items.length ? (
        items.map(item => {
          return (
            <li data-sk-name={`filter-list-item-${item.id}`} key={`filter-list-item-${item.id}}`} className={resultsClasses}>
              {itemRenderer(item)}
            </li>
          )
        })
      ) : (
        <li data-sk-name="sk-filter-list-empty-state" className={noResultsClasses}>
          <div className="sk-flex sk-text-neutral-550 sk-items-center filter-list-item-min-height">No results found</div>
        </li>
      )}
    </ul>
  )
}

export const FilterList = <T extends IFilterItem>({ items, itemRenderer, className, scrollableContentClasses }: IFilterListProps<T>) => {
  return (
    <div data-sk-name="sk-filter-list" className={classnames('filter-list', className, scrollableContentClasses)}>
      {renderFilterData(items, itemRenderer)}
    </div>
  )
}
