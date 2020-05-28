import * as React from 'react'
import classNames from 'classnames'
import { FormElementWrapper, FormInputElement } from '@skedulo/sked-ui'

interface WrappedFormInputProps {
  size?: number
  label: string
  name: string
  value: string
  error?: string
  type?: string
  isReadOnly: boolean
  isRequired: boolean
  rows?: number
  disabled?: boolean
  className?: string
  maxLength?: number
}

const WrappedFormInput: React.FC<WrappedFormInputProps> = (props) => {
  const {
    label,
    name,
    value,
    isRequired,
    isReadOnly,
    error,
    type,
    size,
    rows = 10,
    disabled,
    className,
    maxLength,
  } = props

  const labelClasses = React.useMemo(
    () =>
      classNames('label', className, {
        required: isRequired,
        valid: !error,
      }),
    [isRequired, error]
  )

  const wrapperClasses = React.useMemo(
    () =>
      classNames({
        'cx-whitespace-pre-line': type === 'textarea',
      }),
    [type]
  )
  const textareaClasses = React.useMemo(
    () =>
      classNames('sked-input-textbox', {
        '': type === 'textarea',
      }),
    [type]
  )

  return (
    <div className={labelClasses}>
      <span className="span-label">{label}</span>
      <FormElementWrapper
        className={wrapperClasses}
        name={name}
        readOnlyValue={value}
        isReadOnly={isReadOnly}
        validation={{ isValid: !error, error }}
      >
        {(!type || type === 'text') && (
          <FormInputElement
            type={'text'}
            name={name}
            defaultValue={value}
            size={size}
            disabled={disabled}
            maxLength={maxLength}
          />
        )}
        {type === 'checkbox' && (
          <FormInputElement
            type="checkbox"
            name={name}
            defaultValue={value}
            size={size}
            disabled={disabled}
            checked={!!value}
          />
        )}
        {type === 'textarea' && (
          <textarea
            name={name}
            className="sked-input-textbox sked-form-element__outline"
            rows={rows}
            defaultValue={value}
            maxLength={maxLength}
          />
        )}
      </FormElementWrapper>
    </div>
  )
}

export default React.memo(WrappedFormInput)
