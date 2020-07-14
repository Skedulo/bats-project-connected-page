let showWarnings = true

/**
 * Disables printing out runtime warnings (like failed results from action creators).
 * For use in tests.
 */
export const suppressReduxHelpersWarnings = () => {
  showWarnings = false
}

/**
 * A reducer helper that increases "busyness" state.
 *
 * @param {Object} state
 * @param {string=} busy
 * @param {string=} busyCnt
 *
 * @return {Object}
 */
export const incrBusy = (state, name, { busy = 'busy', busyCnt = 'busyCnt' } = {}) => ({
  [busyCnt]: [...state[busyCnt], name],
  [busy]: true,
})

/**
 * A reducer helper that decreases "busyness" state.
 *
 * @param {Object} state
 * @param {string=} busy
 * @param {string=} busyCnt
 *
 * @return {Object}
 */
export const decrBusy = (state, name, { busy = 'busy', busyCnt = 'busyCnt' } = {}) => {
  const newCnt = [...state[busyCnt].filter(element => element !== name)]
  return {
    [busyCnt]: newCnt,
    [busy]: newCnt.length > 0,
  }
}

/**
 * A reducer helper that adds error to state.
 *
 * @param {Object} state
 * @param {Object} error
 * @param {string} name
 * 
 * @return {Array}
 */
export const addError = (state, error, name) => {
  const newError = {name: name, errorMsg: error.message}
  return [
    ...state.errors,
    newError
  ]
}

/**
 * Creates a new action creator. Action can have predefined constant payloads and can have
 * named parameters set (taken from action creator arguments).
 *
 * @param {string} type
 * @param {?Object} defPayload
 * @param {?string|?Array} fields
 *
 * @return {Function}
 */
export const makeActionCreator = (type, defPayload = null, fields = null) => {
  if (fields) {
    const picker = nameFields(fields)
    return (...args) => ({
      type,
      ...defPayload,
      ...picker(args),
    })
  }
  return (payload = null) => ({
    type,
    ...defPayload,
    ...payload,
  })
}

/**
 * Creates a function that maps subsequent parameters to named properties of a returned object.
 *
 * @param {string|Array} fields Field names
 *
 * @return {Function}
 */
const nameFields = fields => {
  if (!Array.isArray(fields)) {
    fields = [fields] // eslint-disable-line no-param-reassign
  }
  return args => fields.reduce((acc, field, idx) => {
    acc[field] = args[idx] // eslint-disable-line no-param-reassign
    return acc
  }, {})
}

/**
 * If given parameter is not an action creator, then it converts it to one.
 *
 * @param {string|Function} action
 * @return {Function}
 */
const ensureActionCreator = action => {
  switch (typeof action) {
    case 'string': return makeActionCreator(action)
    case 'function': return action
    default:
      throw new Error('Bad action :' + action)
  }
}

/**
 * Creates an action creator for asynchronous tasks that automatically dispatches 2 of 3 actions.
 * Actions are START + SUCCESS or START + ERROR
 *
 * @param {Object} _ Action names or action creators.
 * @param {Function} handler Takes the same arguments as thunk action creator.
 *                           Should return Object with fields that will be passed to the success action.
 *
 * @return {Function}
 */
export const makeAsyncActionCreatorSimp = ({ START, SUCCESS, ERROR }, handler) => {
  const start = ensureActionCreator(START)
  const success = ensureActionCreator(SUCCESS)
  const failure = ensureActionCreator(ERROR)

  return (...extArgs) =>
    async (...thunkArgs) => {
      const [dispatch] = thunkArgs
      dispatch(start())
      try {
        const result = await (handler(...extArgs)(...thunkArgs))
        dispatch(success(result))
        return result
      } catch (error) {
        if (showWarnings) {
          console.warn('async action', error)
        }
        dispatch(failure({ error: error && error.errorInfo || error }))
        return Promise.reject(error)
      }
    }
}

/**
 * Creates a set of standard, prefixed action names (START/SUCCESS/ERROR).
 *
 * @param {string} prefix
 * @param {boolean} lowerCase Use lowercase suffixes (for compatibility with older code)
 *
 * @return {Object}
 */
export const makeActionsSet = (prefix, lowerCase = false) => lowerCase
  ? ({
    START: prefix + '_start',
    SUCCESS: prefix + '_success',
    ERROR: prefix + '_error',
    NAME: prefix
  })
  : ({
    START: prefix + '_START',
    SUCCESS: prefix + '_SUCCESS',
    ERROR: prefix + '_ERROR',
    NAME: prefix
  })

/**
 * Part of the default state to be used along with makeResourceReducers or incrBusy/decrBusy.
 */
export const DEF_RES_STATE = {
  busy: false,
  busyCnt: [],
}
Object.freeze(DEF_RES_STATE)

/**
 * Creates a function that copies given field names from one object to another
 * (like what would bound lodash.pick do).
 *
 * @param {string|Array} fields
 *
 * @return {Object}
 */
const pickFields = fields => {
  if (!Array.isArray(fields)) {
    fields = [fields] // eslint-disable-line no-param-reassign
  }
  return action => fields.reduce((acc, field) => {
    acc[field] = action[field] // eslint-disable-line no-param-reassign
    return acc
  }, {})
}

/**
 * Creates a set of functions for handling a standard 3 actions for some asynchronous process (start/success/error).
 *
 * @param {Object} actions Object with action names.
 * @param {Object} params Reducer parameters.
 * @param {Array|string=} params.dataField Name of the property in action state to be set.
 * @param {Function=} params.transform A function that can be supplied instead of "dataField" to prepare
 *                        new state fields based on action. Note, state and action are in reverse order here.
 * @param {string=} params.loadedField Name of the "loaded" property in the state to be set.
 * @param {string=} params.errorField Name of the field that errors will be stored in.
 *
 * @return {Object}
 */
export const makeReducers = (
  { START, SUCCESS, ERROR, NAME },
  {
    dataField = null,
    loadedField = 'loaded',
    errorField = 'errors',
    transform = null,
    busyField = 'busy',
  } = {},
) => {
  const picker = transform || pickFields(dataField)
  const hasFields = dataField != null || !!transform
  const busyOpts = { busy: busyField, busyCnt: busyField + 'Cnt' }
  return {
    [START]: hasFields
      ? (state => ({
        ...state,
        ...incrBusy(state, NAME, busyOpts),
        [loadedField]: false,
        [errorField]: state.errors,
      }))
      : (state => ({
        ...state,
        ...incrBusy(state, NAME, busyOpts),
      })),

    [SUCCESS]: hasFields
      ? ((state, action) => ({
        ...state,
        ...decrBusy(state, NAME, busyOpts),
        ...picker(action, state),
        [loadedField]: true,
      }))
      : (state => ({
        ...state,
        ...decrBusy(state, NAME, busyOpts),
      })),

    [ERROR]: (state, { error }) => {
      console.log('error: ', error);
      return {
        ...state,
        ...decrBusy(state, NAME, busyOpts),
        [errorField]: addError(state, error, NAME),
      }
    },
  }
}

/**
 * Creates a set of reducer that uses action map instead of switch-case.
 *
 * @param {Object} actionReducers
 * @param {Object} defaultState
 * @param {Function|undefined} fallbackReducer
 *
 * @return {Function}
 */
export const makeReducer = (actionReducers, defaultState, fallbackReducer = null) => (state = defaultState, action) => {
  if (Object.keys(actionReducers).includes('undefined')) {
    throw new TypeError('Undefined action name! Check your imports/property names in reducer file.')
  }
  const subReducer = actionReducers[action.type]
  if (subReducer) {
    return subReducer(state, action)
  } else if (fallbackReducer) {
    return fallbackReducer(state, action)
  }
  return state
}

/**
 * Deletes all empty (string) or null/undefined entries in an object (in place).
 *
 * @param {Object} obj
 */
export const deleteEmpty = obj => {
  for (const key in obj) {
    const value = obj[key]
    if (value === '' || value == null) {
      // eslint-disable-next-line no-param-reassign
      delete obj[key]
    }
  }
}
