import * as React from 'react'
import * as MustacheScaleTemplate from './templates/MustacheScaleTemplate'
import * as RecordTemplateFormatter from './templates/RecordTemplateFormatter'

export interface PreviewTemplateProps {
  template: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  job: Partial<any>
}

export class PreviewTemplate extends React.PureComponent<PreviewTemplateProps, {}> {
  private _replaceTemplateWithValues = (input: string) => {
    if (!input) {
      return ''
    }

    try {
      const template = MustacheScaleTemplate.parse(input)
      const data = RecordTemplateFormatter.format(this.props.job)
      return template.format(data)
    } catch (_e) {
      return 'Invalid input'
      // return _e.message || 'Unknown error formatting notification template'
    }
  }

  render() {
    return (
      <div className="template-textarea textarea template-textarea__disabled" data-sk-name="preview-template-textarea">
        {this._replaceTemplateWithValues(this.props.template)}
      </div>
    )
  }
}
