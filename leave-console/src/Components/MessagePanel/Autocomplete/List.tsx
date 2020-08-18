import * as React from 'react'
import { Loading } from '@skedulo/sked-ui'

import { IOptionList, IOption } from './types'
import { ListItem } from './ListItem'

export interface ListProps {
  options: IOptionList[]
  loading: boolean
  highlighted: IOption
  onSelect: (item: IOption) => (e: React.MouseEvent<HTMLDivElement>) => void
  onInfiniteScroll?: () => void
  infiniteScrollEnabled?: boolean
}

export class List extends React.PureComponent<ListProps, {}> {
  // @ts-ignore
  scroller: HTMLDivElement

  // Required to scroll the view when using up/down keys to navigate the list
  // - To ensure highlighted ListItem remains in scroll view.
  scrollIntoView = (elem: HTMLDivElement) => {
    const { offsetTop: highlightTop, clientHeight: highlightHeight, parentElement } = elem
    // @ts-ignore
    const { scrollTop, offsetHeight } = parentElement

    const scrollBottom = scrollTop + offsetHeight
    const highlightBottom = highlightTop + highlightHeight

    // If the highlighted list item is still in view then don't scroll the view, do nothing.
    if (highlightTop > scrollTop && highlightBottom < scrollBottom) {
      return
    }

    const middleOfView = scrollTop + offsetHeight / 2

    // tslint:disable-next-line: prefer-conditional-expression
    if (highlightBottom > middleOfView) {
      // If the element is below the scroll view - scroll so it appears but stays at the bottom
      // @ts-ignore
      parentElement.scrollTop = highlightTop + highlightHeight - offsetHeight
    } else {
      // If the element is above the scroll view - scroll so it appears but stays at the top
      // @ts-ignore
      parentElement.scrollTop = highlightTop
    }
  }

  // Load more data for infinite scroll
  handleScroll = () => {
    const { loading, onInfiniteScroll } = this.props
    // Detect is the user is at the bottom of list of items
    const nearBottom = this.scroller.scrollHeight - this.scroller.clientHeight - this.scroller.scrollTop
    if (nearBottom === 0 && !loading && onInfiniteScroll) {
      // Update or push more options
      // @ts-ignore
      this.props.onInfiniteScroll()
    }
  }

  renderOptionList = (optionListItem: IOptionList, index: number) => {
    if (!optionListItem.options.length) {
      return null
    }

    const { onSelect, highlighted, infiniteScrollEnabled, loading } = this.props

    const optionItems = optionListItem.options.map(option => {
      return (
        <ListItem
          key={option.key}
          option={option}
          highlighted={option === highlighted}
          onSelect={onSelect}
          scrollIntoView={this.scrollIntoView}
        />
      )
    })

    return (
      <div key={optionListItem.heading || index} className="option-list-group">
        {optionListItem.heading && <div className="option-heading">{optionListItem.heading}</div>}
        <div
          className="option-list scroll"
          // @ts-ignore
          onScroll={infiniteScrollEnabled && this.handleScroll}
          ref={scroller => {
            // @ts-ignore
            this.scroller = scroller
          }}
        >
          {optionItems}
          {infiniteScrollEnabled && loading && <Loading />}
        </div>
      </div>
    )
  }

  render() {
    const { options, loading, infiniteScrollEnabled } = this.props

    const renderedItems = options.map(this.renderOptionList)

    return (
      <div className="option-list-groups">
        {renderedItems}
        {/* Infinite scroll has it's own loading, so no need to show it here */}
        {!infiniteScrollEnabled && loading && <Loading />}
        {/* Show linitial loading when using suggestions */}
        {infiniteScrollEnabled && renderedItems.length === 0 && <Loading />}
      </div>
    )
  }
}
