import * as React from 'react'
import classnames from 'classnames'

import { Icon, FormInputElement } from '@skedulo/sked-ui'

export class SearchBox extends React.PureComponent<{ placeholder: string; onChange: (value: string) => void; className?: string }, {}> {
  changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onChange(e.target.value)
  }

  render() {
    return (
      <div className={classnames('sk-bg-white sk-border sk-border-b-0 sk-border-neutral-350 sk-text-neutral-650 sk-text-sm sk-flex sk-items-center sk-px-3 sk-py-1', this.props.className)}>
        <Icon name="search" className="sk-text-neutral-550" />
        <FormInputElement
          autoFocus
          data-sk-name="sk-filter-search-input"
          type="text"
          placeholder={`Search ${this.props.placeholder ? this.props.placeholder.toLowerCase() : ''}...`}
          onChange={this.changeValue}
          className="sk-truncate sk-border-0 focus:sk-border-0"
        />
      </div>
    )
  }
}
