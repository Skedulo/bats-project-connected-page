import * as React from 'react'
import classNames from 'classnames'
import { FormElementWrapper, FormInputElement, FormLabel, TextArea } from '@skedulo/sked-ui'

interface IWrappedFormInputProps {
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

const WrappedFormInput: React.FC<IWrappedFormInputProps> = props => {
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
      classNames('cx-text-black cx-leading-relaxed cx-mb-5', className, {
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

  return (
    <div className={labelClasses}>
      <span className="cx-block cx-mb-1 cx-text-neutral-650 cx-leading-relaxed">
        {label}
        {isRequired && <span className="cx-text-red-600"> *</span>}
      </span>
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
          <TextArea
            maxHeight={300}
            autoContract={true}
            name={name}
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
