import * as React from 'react'
import * as classnames from 'classnames'
import { IOption } from './types'

interface ListItemProps {
  option: IOption
  highlighted: boolean
  onSelect: (item: IOption) => (e: React.MouseEvent<HTMLDivElement>) => void
  scrollIntoView: (elem: HTMLDivElement) => void
}

export class ListItem extends React.PureComponent<ListItemProps, {}> {
  private _itemRef: HTMLDivElement | null = null

  componentDidMount() {
    if (this.props.highlighted) {
      this.setHighlightScrollToTop()
    }
  }

  componentDidUpdate() {
    if (this.props.highlighted) {
      this.setHighlightScroll()
    }
  }

  setHighlightScrollToTop() {
    if (this._itemRef && this._itemRef.parentElement) {
      this._itemRef.parentElement.scrollTop = this._itemRef.offsetTop
    }
  }

  setItemRef = (ref: HTMLDivElement) => {
    this._itemRef = ref
  }

  setHighlightScroll() {
    if (this._itemRef) {
      this.props.scrollIntoView(this._itemRef)
    }
  }

  render() {
    const { option, highlighted, onSelect } = this.props
    const classes = classnames('option-list-item', { highlighted, disabled: option.disabled })

    if (option.disabled) {
      return (
        <div
          ref={this.setItemRef}
          className={classes}
          data-sk-name="autocomplete-option"
        >
          {option.renderedItem}
        </div>
      )
    }

    return (
      <div
        ref={this.setItemRef}
        className={classes}
        data-sk-name="autocomplete-option"
        onMouseDown={onSelect(option)}
      >
        {option.renderedItem}
      </div>
    )
  }
}
