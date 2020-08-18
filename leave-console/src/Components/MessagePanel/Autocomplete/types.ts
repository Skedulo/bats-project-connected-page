
import * as Promise from 'bluebird'

export interface IOption {
  key: string
  label: string
  // eslint-disable-next-line
  value: any
  renderedItem: JSX.Element
  disabled?: boolean
  autoFocus?: boolean
}

export interface IOptionList {
  heading?: string
  options: IOption[]
}

export type OptionPromise = Promise<IOptionList>
