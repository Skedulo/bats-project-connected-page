import React from 'react'
// import { ConfirmationModal } from '../../Modals'
import useCommentBox from './useCommentBox'

const renderSomeTimesheetsToUpdateMessage = (status: string, toUpdateCount: number, allCount: number) => (
  <div>
    <p className="sk-mb-4">
      Good news { allCount - toUpdateCount } of the { allCount } selected timesheets are already { status }.
    </p>
    <p>
      { toUpdateCount } timesheets will be updated to { status }
    </p>
  </div>
)

const renderAllTimesheetsToUpdateMessage = (status: string, count: number) => (
  <div>
    <p>
      { count } timesheets will be updated to { status }
    </p>
  </div>
)

export default (props: any) => {
  const [comment, setComment, renderComment] = useCommentBox()
  const onConfirm = () => {
    props.onConfirm(comment)
  }
  const onClose = () => {
    setComment('')
    props.onClose()
  }
  return (
    <h1>confirmation modal TODO</h1>
    // <ConfirmationModal
    //   { ...props }
    //   title={ props.title }
    //   onConfirm={ onConfirm }
    //   onClose={ onClose }
    // >
    //   <div className="sk-mb-16" style={ { width: '24rem' } }>
    //     <div className="sk-mb-8 batch-update-modal__message">
    //       {
    //         (props.timesheetsToUpdateCount === props.timesheetsCount)
    //           ? renderAllTimesheetsToUpdateMessage(props.status, props.timesheetsCount)
    //           : renderSomeTimesheetsToUpdateMessage(props.status, props.timesheetsToUpdateCount, props.timesheetsCount)
    //       }
    //     </div>
    //     { renderComment() }
    //   </div>
    // </ConfirmationModal>
  )
}
