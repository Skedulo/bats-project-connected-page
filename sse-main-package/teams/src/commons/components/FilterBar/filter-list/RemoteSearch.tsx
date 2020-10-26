import * as React from 'react'
import { debounce, uniqBy } from 'lodash'

import { Loading } from '@skedulo/sked-ui'

import { IFilterItem } from '../interfaces'

import SearchBox from '../../SearchBox'

export interface IRemoteSearchProps<T> {
  useFetch: (searchTerm: string) => Promise<T[]>
  children: React.SFC<{
    fetchedItems: T[]
    searchTerm: string
    isFetching: boolean
  }>
  preSelectedItems: T[]
  placeholder?: string
  className?: string
}

export interface IRemoteSearchState {
  loading: boolean
  searchTerm: string
}

export const DEBOUNCE_TIME = 700

export class RemoteSearch<T extends IFilterItem> extends React.PureComponent<
IRemoteSearchProps<T>,
IRemoteSearchState
> {
  private _fetchedItems: T[] = []

  private readonly _debouncedSearch = debounce(async (searchTerm: string, preSelectedItems) => {
    return await this.props.useFetch(searchTerm).then(returnedItems => {
      this._fetchedItems = searchTerm.length
        ? uniqBy([...returnedItems, ...preSelectedItems], item => item.id).filter(item => {
          return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
        })
        : returnedItems

      this.setState({
        loading: false,
        searchTerm
      })
    })
  }, DEBOUNCE_TIME)

  constructor (props: IRemoteSearchProps<T>) {
    super(props)

    this.state = {
      loading: false,
      searchTerm: ''
    }

    this._fetchedItems = [...props.preSelectedItems]
  }

  onFilterSearch = (value: string) => {
    this._fetchedItems = [...this.props.preSelectedItems]

    // if there is no search value, just reset everything.
    if (!value) {
      this._debouncedSearch.cancel()

      this.setState({
        loading: false,
        searchTerm: ''
      })

      return
    }

    // set us into a loading state on search change state and then set correct values after debounce finishes.
    this.setState(
      {
        loading: true,
        searchTerm: ''
      },
      () => {
        this._debouncedSearch(value, this.props.preSelectedItems)
      }
    )
  }

  render () {
    const { placeholder = '', className } = this.props
    const { loading } = this.state

    return (
      <>
        <SearchBox placeholder={placeholder} onChange={this.onFilterSearch} className={className} />

        {this.state.loading && (
          <div className="sk-bg-white sk-leading-normal sk-border sk-border-neutral-350">
            <Loading className="sk-text-base sk-py-2" />
          </div>
        )}

        {this.props.children({
          fetchedItems: this._fetchedItems,
          searchTerm: this.state.searchTerm,
          isFetching: loading
        })}
      </>
    )
  }
}
