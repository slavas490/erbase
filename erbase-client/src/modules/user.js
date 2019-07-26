export const LOGIN_SUCCESS = 'user/LOGIN_SUCCESS'
export const LOGOUT_SUCCESS = 'user/LOGOUT_SUCCESS'
export const SET_USER_INFO = 'user/SET_USER_INFO'
export const SET_ACTIVE_AD = 'user/SET_ACTIVE_AD'
export const UNSET_ACTIVE_AD = 'user/UNSET_ACTIVE_AD'

const initialState = {
  isLoggedIn: false,
  id: null,
  phone: null,
  email: null,
  agency: null,
  specialize: null,
  login: null,
  name: null,
  activeAd: null
}

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true
      }

    case LOGOUT_SUCCESS:
      return {
        ...initialState,
        isLoggedIn: false
      }

    case SET_USER_INFO:
      return {
        ...state,
        ...action.data
      }

    case SET_ACTIVE_AD:
      return {
        ...state,
        activeAd: action.data
      }

    case UNSET_ACTIVE_AD:
      return {
        ...state,
        activeAd: null
      }

    default:
      return state
  }
}

export const authenticate = () => {
  return dispatch => {
    dispatch({
      type: LOGIN_SUCCESS
    })
  }
}

export const logout = () => {
  return dispatch => {
    dispatch({
      type: LOGOUT_SUCCESS
    })
  }
}

export const setUserInfo = (data) => {
  return dispatch => {
    dispatch({
      type: SET_USER_INFO,
      data
    })
  }
}

export const setActiveAd = (data) => {
  return dispatch => {
    dispatch({
      type: SET_ACTIVE_AD,
      data
    })
  }
}

export const unsetActiveAd = () => {
  return dispatch => {
    dispatch({
      type: UNSET_ACTIVE_AD
    })
  }
}