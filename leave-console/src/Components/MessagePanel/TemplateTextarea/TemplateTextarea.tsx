import * as React from 'react'

export interface TemplateTextareaProps {
  template: string
  onChange: (element: NodeList) => void
  editable: boolean
}

export class TemplateTextarea extends React.Component<TemplateTextareaProps, {}> {
  // @ts-ignore
  private _wrapperDiv: HTMLDivElement

  shouldComponentUpdate(nextProps: TemplateTextareaProps) {
    // Stop component re-render when typing inside the contentEditable
    // Hack to prevent the cursor jumping to the start of the input instead of staying at the end
    const shouldUpdate =
      this.replaceCharacters(nextProps.template) !== this.replaceCharacters(this._wrapperDiv.innerHTML)
    if (shouldUpdate) {
      this._wrapperDiv.innerHTML = nextProps.template
    }
    return shouldUpdate || this.props.editable !== nextProps.editable
  }

  // Replace HTML entity name to decimal
  replaceCharacters = (str: string) => {
    const replaceMap = {
      '&nbsp;': String.fromCharCode(160),
      '&gt;': String.fromCharCode(62),
      '&lt;': String.fromCharCode(60),
      '&amp;': String.fromCharCode(38),
    }

    // @ts-ignore
    return str ? str.replace(/&nbsp;|&gt;|&lt;|&amp;/gi, matched => replaceMap[matched]) : ''
  }

  setRef = (element: HTMLDivElement) => {
    this._wrapperDiv = element
    if (this._wrapperDiv) {
      this._wrapperDiv.innerHTML = this.props.template
    }
  }

  // eslint-disable-next-line consistent-return
  handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Prevent insertion of empty div on press of 'enter'
    if (event.key === 'Enter') {
      event.preventDefault()
      return false
    }
  }

  handleInput = (event: React.FormEvent<Element>): void => {
    // When changing input, if last child has 'contentEditable' set to false
    // The cursor blows up and is displayed outside of textarea
    // Adding an empty span at the end of the element fixes the problem
    if (event.currentTarget.lastElementChild && event.currentTarget.lastElementChild.hasAttribute('contenteditable')) {
      const emptySpan = document.createElement('span')
      emptySpan.setAttribute('class', 'template-textarea__empty')
      emptySpan.textContent = ' '
      event.currentTarget.appendChild(emptySpan)
    }

    this.props.onChange(event.currentTarget.childNodes)
  }

  render() {
    return (
      <div
        ref={this.setRef}
        data-sk-name="template-textarea"
        className="template-textarea textarea"
        onInput={this.handleInput}
        contentEditable={this.props.editable}
        onKeyDown={this.handleKeyDown}
        suppressContentEditableWarning={true}
      />
    )
  }
}

export default TemplateTextarea
