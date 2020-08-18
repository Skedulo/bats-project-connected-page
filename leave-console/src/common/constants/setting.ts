import { MessageVariable } from '../../Store/types'

export const MESSAGE_VARIABLES: MessageVariable[] = [
  {
    label: 'Job ID',
    value: '{{ UID }}'
  },
  {
    label: 'Job Name',
    value: '{{ Name }}'
  },
  {
    label: 'Job Start Time',
    value: '{{ Start }}'
  },
  {
    label: 'Job End Time',
    value: '{{ End }}'
  },
  {
    label: 'Job Type',
    value: '{{ Type }}'
  },
  {
    label: 'Job Duration',
    value: '{{ Duration }}'
  },
  {
    label: 'Job Status',
    value: '{{ JobStatus }}'
  },
  {
    label: 'Job Region',
    value: '{{ Region.Name }}'
  },
  {
    label: 'Account Name',
    value: '{{ Account.Name }}'
  },
  {
    label: 'Contact Full Name',
    value: '{{ Contact.FullName }}'
  }
]

export const DEFAULT_PALETTE_COLORS = [
  '#e6194B',
  '#f58231',
  '#ffe119',
  '#bfef45',
  '#3cb44b',
  '#42d4f4',
  '#4363d8',
  '#911eb4',
  '#f032e6',
  '#000',
]
