export const SET_ACTIVE_DEAL = 'seller/SET_ACTIVE_DEAL'

const initialState = {
  data: {}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_ACTIVE_DEAL:
      return {
        ...state,
        data: action.data
      }

    default:
      return state
  }
}

export const setActiveDeal = (data) => {
  return dispatch => {
    dispatch({
      type: SET_ACTIVE_DEAL,
      data
    })
  }
}