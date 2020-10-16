export type InputType = 'checkbox' | 'radio'

export interface IFilterItem {
  id: string
  name: string
}

export interface IAddedFilter {
  id: string
  name: string
  preSelectedItems: IFilterItem[]
}

export interface IAppliedFilter<T extends IFilterItem> {
  name: string
  id: string
  selectedItems: T[]
  removable: boolean
  isReadonly: boolean
}

export interface IFilter<T extends IFilterItem> {
  name: string
  id: string
  items: T[]
  /**
   * Provide an array of filter item IDs that are already selected.
   */
  selectedIds: string[]
  inputType: InputType
  isReadonly?: boolean
  /**
   * Defaults to true
   */
  removable?: boolean
  /**
   * Provide a search term that will return results back based on that term.
   */
  useFetch?: (searchTerm: string) => Promise<Array<{ id: string, name: string }>>
  /**
   * Provide a boolean that determines if the filter list is searchable or not.
   */
  searchable?: boolean
}
