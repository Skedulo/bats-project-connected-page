import * as React from 'react'
import SearchBox from '../../SearchBox'
import { IFilterItem } from '../interfaces'

export interface IFilterSearchProps<T> {
  items: T[]
  children: React.SFC<{
    filteredItems: T[]
  }>
  placeholder?: string
  className?: string
}

interface IFilterSearchState<T> {
  itemsWithSearchTermApplied: T[]
}

export class FilterSearch<T extends IFilterItem> extends React.PureComponent<
  IFilterSearchProps<T>,
  IFilterSearchState<T>
> {
  constructor(props: IFilterSearchProps<T>) {
    super(props)

    this.state = {
      itemsWithSearchTermApplied: this.props.items,
    }
  }

  onFilterSearch = (value: string) => {
    if (!value.length) {
      return this.setState({
        itemsWithSearchTermApplied: this.props.items,
      })
    }

    const searchedFilters = this.props.items.filter(item => {
      return item.name.toLowerCase().indexOf(value.toLowerCase()) > -1
    })

    return this.setState({
      itemsWithSearchTermApplied: searchedFilters,
    })
  }

  render() {
    const { itemsWithSearchTermApplied } = this.state

    return (
      <>
        <SearchBox
          placeholder={this.props.placeholder || ''}
          onChange={this.onFilterSearch}
          className={this.props.className}
        />
        {this.props.children({ filteredItems: itemsWithSearchTermApplied })}
      </>
    )
  }
}
