import { combineReducers } from 'redux'
import user from './user'
import general from './general'
import seller from './seller'
import buyer from './buyer'
import deal from './deal'
import realtor from './realtor'

export default combineReducers({
  user,
  seller,
  buyer,
  deal,
  realtor,
  general
})