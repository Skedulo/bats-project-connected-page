import React from 'react'
import { format } from 'date-fns'
// import { Label } from '../../Forms/Utils/Label'
// import { ConfirmationModal } from '../../Modals'
import useCommentBox from './useCommentBox'

const actionLabels: { [index: string]: {
  title: string,
  period: string,
  comment: string,
  confirm: string
} } = {
  approve: {
    title: 'Approve',
    period: 'Approved Period',
    comment: 'Approver Note',
    confirm: 'Approve'
  },
  submit: {
    title: 'Submit',
    period: 'Submitted Period',
    comment: 'Note for Approver',
    confirm: 'Submit'
  },
  reject: {
    title: 'Reject',
    period: 'Rejected Period',
    comment: 'Rejection Note',
    confirm: 'Reject'
  },
  recall: {
    title: 'Recall',
    period: 'Recalled Period',
    comment: 'Can we note sth?',
    confirm: 'Recall'
  }
}

export default (props: any) => {
  const [comment, setComment, renderComment] = useCommentBox()
  const onConfirm = () => {
    props.onConfirm(comment)
  }
  const onClose = () => {
    setComment('')
    props.onClose()
  }

  const labels = actionLabels[props.action]
  return (
    <h1>confirmation modal TODO</h1>
    // <ConfirmationModal
    //   { ...props }
    //   title={ labels.title }
    //   onConfirm={ onConfirm }
    //   onClose={ onClose }
    //   confirmLabel={ labels.confirm }
    // >
    //   <div className="sk-mb-16" style={ { width: '24rem' } }>
    //     <div className="sk-mb-8">
    //       <div className="sk-flex sk-mb-2">
    //         <div className="sk-w-1/2">
    //           <Label text={ labels.period } />
    //         </div>
    //         <div className="sk-w-1/2">
    //           { format(new Date(props.timesheet.StartDate), 'dd MMM yyyy') } - { format(new Date(props.timesheet.EndDate), 'dd MMM yyyy') }
    //         </div>
    //       </div>
    //       <div className="sk-flex sk-mb-2">
    //         <div className="sk-w-1/2">
    //           <Label text="Timesheet Name" />
    //         </div>
    //         <div className="sk-w-1/2">
    //           { props.timesheet.Name }
    //         </div>
    //       </div>
    //       <div className="sk-flex sk-mb-2">
    //         <div className="sk-w-1/2">
    //           <Label text="Worked Hours" />
    //         </div>
    //         <div className="sk-w-1/2">
    //           { props.timesheet.Logged || '-' }
    //         </div>
    //       </div>
    //     </div>
    //     { renderComment(labels.comment) }
    //   </div>
    // </ConfirmationModal>
  )
}
