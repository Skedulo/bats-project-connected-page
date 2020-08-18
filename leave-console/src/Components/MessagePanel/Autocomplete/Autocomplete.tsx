import { debounce, flatten, isNull, noop, Cancelable } from 'lodash'
import * as React from 'react'
import Promise from 'bluebird'
import * as classNames from 'classnames'

import { List, ListProps as IListProps } from './List'
import { PortalDropDown } from './PortalDropDown'
import { IOption, IOptionList, OptionPromise } from './types'

export { IOption, IOptionList, OptionPromise } from './types'

export function stripDoubleQuotesFromString(stringToStrip: string) {
  return stringToStrip.replace(/["]+/g, '')
}

export function stripBackSlashesFromString(stringToStrip: string) {
  return stringToStrip.replace(/[\\]+/g, '')
}

export const DEFAULT_QUERY_LIMIT = 40
export const DEFAULT_NO_RESULTS_TEXT = 'No results found'

// Props that are used internally for testing purposes
interface AutocompletePropsInternal {
  // This callback is fired when an optionList resolves
  // with results. Used in unit-tests to verify
  // loaded resolution
  optionListLoaded?: (options: IOptionList) => void
}

// eslint-disable-next-line
export interface AutocompleteProps<T = any>
  extends AutocompletePropsInternal,
    Pick<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'placeholder'> {
  getOptions: (term: string, offset: number) => OptionPromise[]
  displayName: string | null
  onBlur?: (term: string) => void
  onSelect: (val: T) => void
  onClear?: () => void

  preventAutoSelectFirst?: boolean
  preventAutoPosition?: boolean
  alwaysOpen?: boolean
  debounce?: number
  minChars?: number
  isValidating?: boolean
  validSelection?: boolean
  className?: string
  dropDownClassName?: string
  inputClassName?: string
  disabled?: boolean
  isDropDown?: boolean
  hideDropDownChevron?: boolean
  infiniteScrollEnabled?: boolean
  hasNextPage?: boolean
  noResultsText?: string
}

export interface AutocompleteState extends Pick<IListProps, 'options' | 'highlighted'> {
  loading: boolean
  highlightCount: number | null
  term: string
  inFocus: boolean
  focusClass: boolean
}

function getDefaultState(): Pick<AutocompleteState, 'options' | 'loading' | 'highlighted' | 'highlightCount'> {
  return {
    options: [],
    loading: false,
    // @ts-ignore
    highlighted: null,
    highlightCount: null,
  }
}

export class AutoComplete<T> extends React.PureComponent<AutocompleteProps<T>, AutocompleteState> {
  // eslint-disable-next-line
  static defaultProps: Partial<AutocompleteProps<any>> = {
    debounce: 300,
    minChars: 1,
    alwaysOpen: false,
    preventAutoSelectFirst: false,
    optionListLoaded: noop,
    onClear: noop,
    onBlur: noop,
    className: '',
    disabled: false,
    isDropDown: false,
  }

  private _activePromise: Promise<void> | null = null

  private _throttledGetOptions: ((term: string) => void) & Cancelable

  // @ts-ignore
  private _inputRef: HTMLInputElement = null

  private _ignoreBlur = false

  constructor(props: AutocompleteProps<T>) {
    super(props)

    this.state = {
      ...getDefaultState(),
      term: props.displayName ? props.displayName : '',
      inFocus: false,
      focusClass: false,
    }

    // @ts-ignore
    this._throttledGetOptions = debounce(this.getOptions, props.debounce, { maxWait: props.debounce * 5 })
  }

  componentDidMount() {
    document.addEventListener('click', this.handleBodyClick, true)
    // @ts-ignore
    document.addEventListener('keydown', this.handleKeyDown, true)
  }

  componentDidUpdate(prevProps: AutocompleteProps<T>) {
    if (this.props !== prevProps) {
      if (!this.state.inFocus) {
        this.setState({
          term: this.props.displayName || '',
        })
      }
    }
  }

  // Cancel all pending promises
  componentWillUnmount() {
    this.cancelActivePromises()
    document.removeEventListener('click', this.handleBodyClick, true)
    // @ts-ignore
    document.removeEventListener('keydown', this.handleKeyDown, true)
  }

  setInputRef = (elem: HTMLInputElement) => {
    this._inputRef = elem
  }

  // When user clicks anywhere, remove focus class
  handleBodyClick = () => {
    this.setState({ focusClass: false })
  }

  // When user press "TAB", remove focus class
  handleKeyDown = (e: MouseEvent) => {
    if (e.which === 9) {
      this.setState({ focusClass: false })
    }
  }

  cancelActivePromises = () => {
    this._throttledGetOptions.cancel()

    // Clean up active requests
    if (this._activePromise) {
      this._activePromise.cancel()
      this._activePromise = null
    }
  }

  getMinCharMessageOptions = (): IOptionList[] => {
    const { minChars } = this.props

    return [
      {
        options: [
          {
            disabled: true,
            key: 'minChars',
            label: '',
            value: null,
            renderedItem: <div className="ellipsis">{`Please enter at least ${minChars} characters`}</div>,
          },
        ],
      },
    ]
  }

  getNoResultsFoundMessageOptions = (): IOptionList[] => {
    const { noResultsText } = this.props
    const noResults = noResultsText !== '' ? noResultsText : DEFAULT_NO_RESULTS_TEXT

    return [
      {
        options: [
          {
            disabled: true,
            key: 'notFound',
            label: '',
            value: null,
            renderedItem: (
              <div className="option-list-item--no-results" data-sk-name="no-results-item">
                {noResults}
              </div>
            ),
          },
        ],
      },
    ]
  }

  onInfiniteScroll = () => {
    if (this.props.hasNextPage && !this.state.loading) {
      const offset = this.state.options[0].options.length
      this.getOptions(this.state.term, offset)
    }
  }

  // This Get Options function is throttled ( in the constructor )
  getOptions = (term: string, offset = 0) => {
    // @ts-ignore
    if (term.length >= this.props.minChars || this.props.alwaysOpen) {
      // set loading to true on always open so that the user gets some feedback on initial input click.
      if (this.props.alwaysOpen) {
        this.setState({ loading: true })
      }
      // If there are enough characters present, continue...
      const optionPromises = this.props.getOptions(term, offset)

      // Resolve each promise individually, and set the values in state
      // to have progressive data sets coming in over time
      const updatedPromises = optionPromises.map(eachPromise => {
        // This promise has to resolve with either an OptionListValue or OptionListError
        return eachPromise.then(optionList => {
          const { options } = this.state

          let updatedOptions: IOptionList[] = []

          // Infinite scrolling on first list of options only
          if (this.props.infiniteScrollEnabled && options[0]) {
            // Merge new options to first list on state
            const newArrayOfOptions: IOptionList[] = [{ options: [...options[0].options, ...optionList.options] }]
            updatedOptions = optionList.options.length > 0 ? newArrayOfOptions : options
          } else {
            updatedOptions = optionList.options.length > 0 ? options.concat(optionList) : options
          }

          let highlighted: IOption = this.state.highlighted || null
          let highlightCount: number | null =
            this.state.highlightCount === 0 ? this.state.highlightCount : this.state.highlightCount || null

          if (!this.state.highlighted && updatedOptions.length > 0) {
            // Setting highlighted value if applicable
            const autoFocusItemIndex = optionList.options.findIndex(o =>
              this.state.term !== '' ? o.label === this.state.term : o.autoFocus
            )

            if (autoFocusItemIndex > -1) {
              // set highlighted options to preselected value.
              highlighted = optionList.options[autoFocusItemIndex]
              highlightCount = flatten(options.map(o => o.options)).length + autoFocusItemIndex
            } else if (!this.props.preventAutoSelectFirst) {
              const flattenedList = flatten(updatedOptions.map(o => o.options))
              // select first value in the options.
              if (flattenedList.length) {
                highlighted = flattenedList[0]
                highlightCount = 0
              }
            }
          }

          this.setState({ options: updatedOptions, highlightCount, highlighted }, () => {
            // Let parent prop know that an option list has been loaded
            // @ts-ignore
            this.props.optionListLoaded(optionList)
          })
        })
      })

      // After all promises resolve, set loading to false.
      // Don't use .finally since it gets triggered on cancelled promises
      this._activePromise = Promise.all(updatedPromises)
        .then(() => {
          const { options } = this.state
          // Don't render no results message if user hasn't typed anything
          const noResultsOption = term.length > 0 ? this.getNoResultsFoundMessageOptions() : []

          this.setState({
            loading: false,
            options: options.length ? options : noResultsOption,
          })
        })
        .catch(err => {
          this.setState({ loading: false })
          return Promise.reject(err)
        })
    } else if (term.length >= 1) {
      // If there's atleast one-character in there, might as well
      // show the min char message when there's been no input for <time> seconds
      this._activePromise = Promise.delay(1000).then(() =>
        this.setState({ options: this.getMinCharMessageOptions(), loading: false })
      )
    }
  }

  updateTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value

    // First cancel existing requests, if they're in flight
    this.cancelActivePromises()

    const trimmedTerm = term.trim()
    const termWithoutQuotes = stripDoubleQuotesFromString(trimmedTerm)
    const cleanedTerm = stripBackSlashesFromString(termWithoutQuotes)

    if (cleanedTerm || this.props.alwaysOpen) {
      this._throttledGetOptions(cleanedTerm)

      // Make sure to set "uncleaned" term in state ( to account for trailing spaces )
      // @ts-ignore
      this.setState({
        term,
        options: [],
        loading: true,
        highlightCount: null,
        // @ts-ignore
        highlighted: null,
      })
    } else {
      this.setState({ ...getDefaultState(), term: '' })
    }
  }

  onItemSelect = (item: IOption) => {
    this.cancelActivePromises()

    this.setState({
      ...getDefaultState(),
      term: item.label,
      focusClass: true,
    })

    // Call-props after setting state
    // in-case the value changes after the state has been set
    this.props.onSelect(item.value)
  }

  onSelect = (item: IOption) => () => {
    // Ensure our blur does not trigger.
    this._ignoreBlur = true
    this.onItemSelect(item)
  }

  closeSelect = () => {
    this.cancelActivePromises()

    const selected = this.props.displayName

    this.setState({ ...getDefaultState(), term: selected && this.state.term ? selected : '', inFocus: false })
  }

  setHighlights = (highlightCount: number) => {
    let tempHighlightCount = highlightCount
    const options = flatten(this.state.options.map(optionList => optionList.options)).filter(
      option => !option.disabled
    )

    const availableOptions = options.length - 1

    if (highlightCount > availableOptions) {
      tempHighlightCount = 0
    } else if (highlightCount < 0) {
      tempHighlightCount = availableOptions
    }

    const highlighted = options[highlightCount]

    this.setState({ highlighted, highlightCount: tempHighlightCount })
  }

  onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { highlightCount, highlighted } = this.state

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        this.setHighlights(isNull(highlightCount) ? -1 : highlightCount - 1)
        break

      case 'ArrowDown':
        e.preventDefault()
        this.setHighlights(isNull(highlightCount) ? 0 : highlightCount + 1)
        break

      case 'Enter':
        if (highlighted) {
          this.onItemSelect(highlighted)
        }

        break

      case 'Escape':
        this.closeSelect()
        break

      default:
        break
    }
  }

  onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        if (!this.state.term) {
          // @ts-ignore
          this.props.onClear()
        }
        break

      default:
        break
    }
  }

  // When "focussed", open the options menu
  onFocus = () => {
    if (this.props.alwaysOpen) {
      this.getOptions('')
    }
    this.setState({ inFocus: true })
  }

  onBlur = () => {
    if (!this._ignoreBlur) {
      // @ts-ignore
      this.props.onBlur(this.state.term)
    }

    this.closeSelect()
    this._ignoreBlur = false
  }

  onChevronMouseDown = () => {
    // When chevron is clicked if we don't have focus on the input element, then get it.
    if (!this.state.inFocus) {
      // Focus on input after event lifecycle complete
      setTimeout(() => this._inputRef.focus(), 1)
    }
  }

  render() {
    const {
      placeholder,
      isValidating,
      validSelection,
      className,
      dropDownClassName,
      inputClassName,
      disabled,
      isDropDown,
      infiniteScrollEnabled,
      name,
      hideDropDownChevron,
      preventAutoPosition,
    } = this.props
    const { term, options, loading, highlighted, focusClass } = this.state
    const divClassName = classNames('sked-autocomplete', { [`${className}`]: !!className })
    const inputClassNames = classNames('sked-form-element__outline', inputClassName, {
      'icon-padding': isDropDown || isValidating || validSelection,
      'focus': focusClass,
    })
    const dropDownClassNames = classNames('sked-autocomplete', { [`${dropDownClassName}`]: !!dropDownClassName })

    const chevronAdditions = `${loading || options.length > 0 ? '-up' : ''}`
    const chevronDisabled = `${disabled ? 'ski-chevron-disabled' : ''}`
    const chevronClassName = classNames({
      [`ski ski-chevron${chevronAdditions} ${chevronDisabled}`]: true,
    })

    return (
      <div data-sk-name="autocomplete-widget" className={divClassName}>
        <input
          name={name}
          ref={this.setInputRef}
          type="text"
          value={term}
          onChange={this.updateTerm}
          placeholder={placeholder}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onKeyDownCapture={this.onKeyDown}
          onKeyUpCapture={this.onKeyUp}
          className={inputClassNames}
          disabled={disabled}
          autoComplete="off"
        />
        {(loading || options.length > 0) && (
          <PortalDropDown
            trigger={this._inputRef}
            className={dropDownClassNames}
            onPageScroll={this.onBlur}
            preventAutoPosition={preventAutoPosition}
          >
            <List
              options={options}
              loading={loading}
              onSelect={this.onSelect}
              highlighted={highlighted}
              onInfiniteScroll={this.onInfiniteScroll}
              infiniteScrollEnabled={infiniteScrollEnabled}
            />
          </PortalDropDown>
        )}

        {!hideDropDownChevron && isDropDown && !isValidating && !validSelection && (
          <div className={chevronClassName} onMouseDownCapture={this.onChevronMouseDown} />
        )}

        {isValidating && <div className="autocomplete-spinner sk-loader-tiny" />}

        {!isValidating && validSelection && <span className="autocomplete-spinner ski ski-tick-circle" />}
      </div>
    )
  }
}
