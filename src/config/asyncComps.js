/* 
引入所有的路由组件, 并使用lazy实现路由组件的懒加载
暴露所有路由组件
*/

import { lazy } from "react"

const Admin = () => lazy(() => import("@/pages/Admin"))
const User = () => lazy(() => import("@/pages/Acl/User"))
const AddOrUpdateUser = () => lazy(() => import("@/pages/Acl/User/components/AddOrUpdateUser"))
const AssignUser = () => lazy(() => import("@/pages/Acl/User/components/AssignUser"))
const Role = () => lazy(() => import("@/pages/Acl/Role"))
const Permission = () => lazy(() => import("@/pages/Acl/Permission"))
const AssignRole = () => lazy(() => import("@/pages/Acl/Role/components/AssignRole"))
const AddOrUpdateRole = () => lazy(() => import("@/pages/Acl/Role/components/AddOrUpdateRole"))

const Settings = () => lazy(() => import("@/pages/User/Settings"))
const Center = () => lazy(() => import("@/pages/User/Center"))

const Subject = () => lazy(() => import("@/pages/Edu/Subject"))

export default {
  Admin,
  User,
  AddOrUpdateUser,
  AssignUser,
  Role,
  Permission,
  AssignRole,
  AddOrUpdateRole,
  Settings,
  Center,
  Subject
}