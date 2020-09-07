import { combineReducers } from "redux"

import loading from "./loading"
import token from "./login"

import { user } from "@/components/Authorized/redux"
import { userList } from "@/pages/Acl/User/redux"
import { roleList } from "@/pages/Acl/Role/redux"
import { menuList } from "@/pages/Acl/Permission/redux"
import { chapter } from "@/pages/Edu/Chapter/redux"

export default combineReducers({
  loading,
  user,
  token,
  userList,
  roleList,
  menuList,
  chapter
})
