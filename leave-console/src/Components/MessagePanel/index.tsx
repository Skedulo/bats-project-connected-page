/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable react/sort-comp */
/* eslint-disable no-param-reassign */
import * as React from 'react'
import { keyBy, escapeRegExp } from 'lodash'

import { MessageVariable } from '../../Store/types/common'
import TemplateTextarea from './TemplateTextarea'
import ObjectSearch from './ObjectSearch'

import './index.scss'
import { PreviewTemplate } from './TemplateTextarea/PreviewTemplate'

export const DEFAULT_JOB = {
  UID: '123456789',
  Name: 'JOB-1234',
  Address: '123 Bongigar Avenue, North Manly. 4503. QLD',
  Timezone: 'Australia/Brisbane',
  Start: new Date(),
  Duration: 90,
  End: new Date(),
  ActualStart: new Date(),
  ActualEnd: new Date(),
  Type: 'Installation',
  Description: 'Job installation description',
  Account: {
    UID: '1',
    Name: 'ACME Company123',
  },
  Contact: {
    FullName: 'John Doe',
    FirstName: 'John',
    LastName: 'Doe',
    Phone: '123-123-123',
    MobilePhone: '321-321-312',
  },
  Location: {
    Name: 'ACME Company Location',
  },
  Region: {
    Name: 'Brisbane',
  },
  NextJob: {
    Name: 'JOB-1235',
    Address: '124 Bongigar Avenue, North Manly. 4503. QLD',
    Timezone: 'Australia/Brisbane',
    Start: new Date(),
    Duration: 190,
    End: new Date(),
    ActualStart: new Date(),
    ActualEnd: new Date(),
    Type: 'Installation',
    Description: 'Job installation description',
    Account: {
      UID: '1',
      Name: 'ACME Company123',
    },
    Contact: {
      FullName: 'John Doe',
      FirstName: 'John',
      LastName: 'Doe',
      Phone: '123-123-123',
      MobilePhone: '321-321-312',
    },
    Location: {
      Name: 'ACME Company Location',
    },
    Region: {
      Name: 'Brisbane',
    },
  },
}

export interface MessagePanelProps {
  label: string
  template: string
  isCustomView?: boolean
  onEdit: (template: string) => void
  variables: MessageVariable[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedJob?: Partial<any>
  required?: boolean
}

export interface MessagePanelState {
  selectedJob: Partial<any>
  selectedField: MessageVariable
  templateObject: {
    htmlElements: string
    template: string
  },
}

const DEFAULT_FIELDS_LOOKUP = (DEFAULT_FIELDS: MessageVariable[]) =>
  keyBy(DEFAULT_FIELDS, field => field.value)
const DEFAULT_FIELDS_BY_LABEL = (DEFAULT_FIELDS: MessageVariable[]) =>
  keyBy(DEFAULT_FIELDS, field => field.label)
const DEFAULT_FIELD_SUBSTITUTIONS = (DEFAULT_FIELDS: MessageVariable[]) =>
  DEFAULT_FIELDS.map(({ label, value }) => {
    const regexp = new RegExp(escapeRegExp(value).replace(' ', ' +'), 'g')
    return { regexp, label }
  })

const DEFAULT_STATE: MessagePanelState = {
  selectedJob: DEFAULT_JOB,
  selectedField: { value: '', label: '' },
  templateObject: {
    htmlElements: '',
    template: '',
  }
}

class MessagePanel extends React.PureComponent<MessagePanelProps, MessagePanelState> {
  static getDerivedStateFromProps(nextProps: MessagePanelProps, prevState: MessagePanelState) {
    if (nextProps.template !== prevState.templateObject.template) {
      return MessagePanel.computeStateFor(nextProps)
    }
    return null
  }

  static computeStateFor(props: MessagePanelProps) {
    const selectedJob = props.selectedJob || DEFAULT_STATE.selectedJob

    return {
      ...DEFAULT_STATE,
      selectedJob,
      templateObject: {
        htmlElements: MessagePanel.replaceVariablesWithDivs(props.template, props.variables),
        template: props.template,
      },
    }
  }

  static replaceVariablesWithDivs = (template: string, variables: MessageVariable[]): string => {
    return DEFAULT_FIELD_SUBSTITUTIONS(variables).reduce((t, { regexp, label }) => {
      return t ? t.replace(regexp, MessagePanel.addVariable(label)) : ''
    }, template)
  }

  static addVariable = (value: string): string => {
    const variableElement = document.createElement('div')
    variableElement.setAttribute('class', 'template-textarea__variable')
    variableElement.setAttribute('data-sk-name', 'variable')
    variableElement.setAttribute('contentEditable', 'false')
    variableElement.textContent = value

    const emptySpan = document.createElement('span')
    emptySpan.setAttribute('class', 'template-textarea__empty')
    emptySpan.textContent = ' '

    return variableElement.outerHTML + emptySpan.outerHTML
  }

  constructor(props: MessagePanelProps) {
    super(props)

    this.state = MessagePanel.computeStateFor(props)
  }

  getTitle = () => {
    const { isCustomView, label } = this.props
    return isCustomView ? `Customize your ${label} notification` : `Default ${label} notification`
  }

  removeExtraSpaces = (str: string) => str.replace(/(\s+|&nbsp;+)/g, ' ')

  convertElementArrayToTemplate = (nodes: Node[]): string => {
    // eslint-disable-next-line
    return nodes
      .map((node: any) => {
        switch (node.nodeName) {
          case '#text':
            return this.removeExtraSpaces(node.nodeValue)
          case 'SPAN':
            return this.removeExtraSpaces(node.innerText)
          case 'DIV':
            return (
              DEFAULT_FIELDS_BY_LABEL(this.props.variables)[node.innerText] &&
              DEFAULT_FIELDS_BY_LABEL(this.props.variables)[node.innerText].value
            )
        }
      })
      .join('')
      .trim()
  }

  convertNodesToHtmlElements = (nodes: Node[]): string => {
    return nodes.map(node => (node.nodeName === '#text' ? node.nodeValue : (node as Element).outerHTML)).join('')
  }

  handleChange = (nodes: Node[]): void => {
    const template = this.convertElementArrayToTemplate(nodes)
    const htmlElements = this.convertNodesToHtmlElements(nodes)

    this.setState({ templateObject: { htmlElements, template } })
    this.props.onEdit(template)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleJobSelect = (selectedJob?: any) => {
    const jobToSet = selectedJob || DEFAULT_JOB

    this.setState({ selectedJob: jobToSet })
  }

  handleFieldSelect = (selectedFieldValue: string) => {
    this.setState({ selectedField: DEFAULT_FIELDS_LOOKUP(this.props.variables)[selectedFieldValue] })
  }

  handleAddField = () => {
    const { templateObject, selectedField } = this.state
    const { htmlElements: stateElements, template: stateTemplate } = templateObject
    const { value } = selectedField
    const template = this.removeExtraSpaces(`${stateTemplate} ${value}`)
    const htmlElements = `${stateElements} ${MessagePanel.replaceVariablesWithDivs(value, this.props.variables)}`

    this.setState({ templateObject: { htmlElements, template } })
    this.props.onEdit(template)
  }

  render() {
    const { isCustomView, label: titleLabel, required } = this.props
    const { selectedJob, selectedField, templateObject } = this.state
    const { htmlElements, template } = templateObject
    const { label, value } = selectedField

    return (
      <div className="row message-panel">
        <div className="small-6 column padding-right">
          {isCustomView ? (
            <div className="subpanel-row">
              <h3 className="subpanel-title">
                {titleLabel}
                {required && <span className="cx-text-red-500 cx-ml-1">*</span>}
              </h3>
              <div className="small-6 column rm-padding-right message-panel__variable-selection">
                <div data-sk-name="variable-selection" className="margin-right message-panel__variable-selector">
                  <ObjectSearch
                    placeholder="Select a field to use"
                    displayName={label}
                    data={this.props.variables}
                    onSelect={this.handleFieldSelect}
                  />
                </div>

                <button
                  type="button"
                  className="sk-button secondary"
                  style={{ flexGrow: 'initial' }}
                  onClick={this.handleAddField}
                  disabled={!value}
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <div className="subpanel-row">
              <h3 className="subpanel-title">{titleLabel}</h3>
            </div>
          )}
          <TemplateTextarea
            template={htmlElements}
            editable={!!isCustomView}
            // tslint:disable-next-line: jsx-no-lambda
            onChange={nodeList => this.handleChange(Array.from(nodeList))}
          />
        </div>
        <div className="small-6 column padding-left">
          <div className="tw--mt-px">
            <div className="subpanel-row">
              <h3 className="subpanel-title subpanel-title__preview">Preview</h3>
            </div>
            <PreviewTemplate template={template} job={selectedJob} />
          </div>
        </div>
      </div>
    )
  }
}

export default MessagePanel
