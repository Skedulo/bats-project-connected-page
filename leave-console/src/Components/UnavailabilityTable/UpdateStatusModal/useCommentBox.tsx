import React, { useState } from 'react'
// import { Label } from '../../Forms/Utils/Label'

const MAX_COMMENT_LENGTH = 250

const useCommentBox: () => [
  string,
  (comment: string) => void,
  (label?: string) => React.ReactNode
] =  () => {
  const [comment, setComment] = useState('')
  const onChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    setComment(e.currentTarget.value.slice(0, MAX_COMMENT_LENGTH))
  }

  const renderComment = (label: string = 'Comment') => (
    <div className="batch-update-modal__comments">
      {/* <Label text={ label } /> */}
      <h1>{ label }</h1>
      <textarea
        className="sk-w-full sk-border sk-leading-normal"
        style={ {
          borderRadius: 2,
          padding: '.5rem',
          fontSize: '.875rem',
          color: '#223049'
        } }
        rows={ 4 }
        onChange={ onChange }
        value={ comment }
      />
    </div>
  )

  return [comment, setComment, renderComment]
}

export default useCommentBox
