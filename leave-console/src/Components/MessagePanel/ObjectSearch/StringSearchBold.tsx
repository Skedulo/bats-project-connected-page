import * as React from 'react'

interface StringSearchBoldProps {
  text: string
  search?: string
}

export class StringSearchBold extends React.PureComponent<StringSearchBoldProps, {}> {
  render() {
    const { text, search } = this.props

    if (!search) {
      return <span data-sk-name="original-text">{text}</span>
    }

    const regex = new RegExp(`(${search})`, 'gi')

    const splitText = text.split(regex)

    if (splitText.length <= 1) {
      return <span data-sk-name="original-text">{text}</span>
    }

    const fullText = splitText
      .map(str => {
        return str.toLowerCase() === search.toLowerCase() ? <strong data-sk-name="bold-string">{str}</strong> : str
      })
      .map((elem, index) => <span key={index}>{elem}</span>)

    return <span data-sk-name="formatted-text">{fullText}</span>
  }
}
