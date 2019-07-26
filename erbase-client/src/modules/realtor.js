export const SET_ACTIVE_REALTOR = 'realtor/SET_ACTIVE_REALTOR'

const initialState = {
  data: {}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_ACTIVE_REALTOR:
      return {
        ...state,
        data: action.data
      }

    default:
      return state
  }
}

export const setActiveRealtor = (data) => {
  return dispatch => {
    dispatch({
      type: SET_ACTIVE_REALTOR,
      data
    })
  }
}