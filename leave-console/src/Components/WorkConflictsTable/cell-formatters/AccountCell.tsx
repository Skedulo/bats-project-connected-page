import React from 'react'

import { classes } from '../../../common/utils/classes'

import './cells.scss'

const bem = classes('account-cell')

interface AccountCellProps {
  account?: { Name: string }
  contact?: { FullName: string }
}

const AccountCell: React.FC<AccountCellProps> = ({ account, contact }) => (
  <div className={ bem() }>
    { (account && account.Name) || (contact && contact.FullName)
      ? (
        <>
          <span className={ bem('first-line') }>{ account && account.Name ? account.Name : '-' }</span>
          <span className={ bem('second-line') }>{ contact && contact.FullName ? contact.FullName : '-' }</span>
        </>
      ) : (
        <span className={ bem('no-data') }>No data</span>
      )
    }
  </div>
)

export default AccountCell