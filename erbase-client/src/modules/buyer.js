export const SET_ACTIVE_BUYER = 'buyer/SET_ACTIVE_BUYER'
export const SET_BUYER_FILTER = 'buyer/SET_BUYER_FILTER'

const initialState = {
  data: {},
  filter: {}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_ACTIVE_BUYER:
      return {
        ...state,
        data: action.data
      }

    case SET_BUYER_FILTER:
      return {
        ...state,
        filter: action.data
      }

    default:
      return state
  }
}

export const setActiveBuyer = (data) => {
  return dispatch => {
    dispatch({
      type: SET_ACTIVE_BUYER,
      data
    })
  }
}

export const setBuyerFilter = (data) => {
  return dispatch => {
    dispatch({
      type: SET_BUYER_FILTER,
      data
    })
  }
}