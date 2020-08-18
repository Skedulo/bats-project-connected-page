import * as React from 'react'
import Promise from 'bluebird'

import { StringSearchBold } from './StringSearchBold'
import { AutoComplete, AutocompleteProps as IAutoCompleteProps, OptionPromise, IOption } from '../Autocomplete'

interface ObjectSearchPropsDataShape<T> {
  value: T
  label: string
}

export interface ObjectSearchProps<T>
  extends Pick<
    IAutoCompleteProps<T>,
    'displayName' | 'onSelect' | 'onClear' | 'inputClassName' | 'disabled' | 'placeholder' | 'name' | 'className'
  > {
  data: ObjectSearchPropsDataShape<T>[]
}

interface ObjectSearchState<T> {
  computedData: {
    [label: string]: T
  }
}

/**
 * General component designed to search through an array of objects passed in upstream.
 * Filter based on the label key.
 */
export class ObjectSearch<T> extends React.PureComponent<ObjectSearchProps<T>, ObjectSearchState<T>> {
  constructor(props: ObjectSearchProps<T>) {
    super(props)

    this.state = {
      computedData: this.calcComputedData(this.props.data),
    }
  }

  componentDidMount() {
    this.setState({
      computedData: this.calcComputedData(this.props.data),
    })
  }

  componentDidUpdate(prevProps: ObjectSearchProps<T>) {
    if (prevProps.data !== this.props.data) {
      this.setState({
        computedData: this.calcComputedData(this.props.data),
      })
    }
  }

  /**
   * To avoid making expensive time calculations in the filter itself, we create a modified
   * data object when the props update. This allows us to hit the values by key rather than
   * filtering through them all on filter runtime.
   *
   * @param data Props passed in from upstream.
   */
  calcComputedData(data: ObjectSearchPropsDataShape<T>[]) {
    return data.reduce(
      // tslint:disable-next-line: prefer-object-spread
      (acc, option) => Object.assign(acc, { [option.label]: option.value }),
      // tslint:disable-next-line: no-object-literal-type-assertion
      {} as ObjectSearchState<T>['computedData']
    )
  }

  /**
   * Basic filter function that filters the data on props based on use input. We return a
   * promise so we can use the AutoComplete widget.
   *
   * @param String current parameter we are trying to filter on.
   */
  filterFn = (query: string): OptionPromise[] => {
    const { data } = this.props

    const dataToFilterOn = data.map(obj => obj.label) || []

    const filteredData = dataToFilterOn.filter(item => {
      return item.toLowerCase().indexOf(query.toLowerCase()) > -1
    })

    const options: IOption[] = filteredData.map((option, idx) => {
      const key = `objectSearch-${option}-${idx}`
      const value = this.state.computedData[option]

      return {
        key,
        label: option,
        value,
        renderedItem: <StringSearchBold text={option} search={query} />,
      }
    })

    return [Promise.resolve({ options })]
  }

  render() {
    const { displayName, name, placeholder, onSelect, onClear, disabled, inputClassName, className } = this.props

    const defaultPlaceholder = 'Select'

    return (
      <AutoComplete
        inputClassName={inputClassName}
        name={name}
        placeholder={placeholder || defaultPlaceholder}
        debounce={0}
        getOptions={this.filterFn}
        displayName={displayName}
        onSelect={onSelect}
        onClear={onClear}
        disabled={disabled}
        isDropDown={true}
        alwaysOpen={true}
        className={className}
      />
    )
  }
}

export default ObjectSearch
