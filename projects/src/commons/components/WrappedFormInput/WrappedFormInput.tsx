import * as React from 'react'
import classNames from 'classnames'
import { FormElementWrapper, FormInputElement } from '@skedulo/sked-ui'

interface WrappedFormInputProps {
  size?: number,
  label: string,
  name: string,
  value: string,
  error?: string,
  type?: string,
  isReadonly: boolean,
  isRequired: boolean,
  rows?: number
}

const WrappedFormInput: React.FC<WrappedFormInputProps> = props => {
  const { label, name, value, isRequired, isReadonly, error, type, size, rows = 10 } = props

  const labelClasses = React.useMemo(() => classNames('label', {
    required: isRequired,
    valid: !error
  }), [isRequired, error])

  const wrapperClasses = React.useMemo(() => classNames({
    'cx-whitespace-pre-line': type === 'textarea'
  }), [type])

  return (
    <div className={labelClasses}>
      <span className="span-label">{label}</span>
      <FormElementWrapper
        className={wrapperClasses}
        name={name}
        readOnlyValue={value}
        isReadOnly={isReadonly}
        validation={{ isValid: !error, error }}
      >
        {
          type !== 'textarea' && (
            <FormInputElement
              id="input"
              type={type || 'text'}
              name={name}
              defaultValue={value}
              size={size}
            />
          )
        }
        {
          type === 'textarea' && (
            <textarea
              name={name}
              className="sked-input-textbox"
              rows={rows}
              defaultValue={value}
            />
          )
        }
      </FormElementWrapper>
    </div>

  )
}

export default React.memo(WrappedFormInput)
