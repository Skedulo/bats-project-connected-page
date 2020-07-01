import React from 'react'
import NoUpdateModal from './NoUpdateModal'
import SingleUpdateModal from './SingleUpdateModal'
import BatchUpdateModal from './BatchUpdateModal'

export default (props: any) => {
  if (!props.isOpened) return null
  if (props.timesheetsToUpdateCount === 0) return <NoUpdateModal { ...props } />
  if (props.timesheetsCount === 1) return <SingleUpdateModal { ...props } />
  return <BatchUpdateModal { ...props } />
}
