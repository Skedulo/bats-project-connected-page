import { LOCAL_STORAGE_KEY } from '../constants'
import { toast } from 'react-toastify'

export const setLocalFilterSets = (filterSet: any) => {
  return window.localStorage.setItem(LOCAL_STORAGE_KEY.PROJECT_FILTER_SET, JSON.stringify(filterSet))
}

export const getLocalFilterSets = () => {
  const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY.PROJECT_FILTER_SET)
  return stored ? JSON.parse(stored) : []
}

export const toastMessage = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
}
