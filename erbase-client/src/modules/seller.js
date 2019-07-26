export const SET_ACTIVE_SELLER = 'seller/SET_ACTIVE_SELLER'
export const SET_SELLER_FILTER = 'seller/SET_SELLER_FILTER'

const initialState = {
  data: {},
  filter: {}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_ACTIVE_SELLER:
      return {
        ...state,
        data: action.data
      }

    case SET_SELLER_FILTER:
      return {
        ...state,
        filter: action.data
      }

    default:
      return state
  }
}

export const setActiveSeller = (data) => {
  return dispatch => {
    dispatch({
      type: SET_ACTIVE_SELLER,
      data
    })
  }
}

export const setSellerFilter = (data) => {
  return dispatch => {
    dispatch({
      type: SET_SELLER_FILTER,
      data
    })
  }
}