import { LOGIN, REMOVE_TOKEN } from "../constants/login"

// 因为勾选的记住密码，密码就会保存在本地
// 下次刷新浏览器时，所有代码会重新加载，此时redux数据没了，所以要从本地加载数据
const initToken = localStorage.getItem("user_token")

export default function token(prevState = initToken, action) {
  switch (action.type) {
    case LOGIN:
      return action.data
    case REMOVE_TOKEN:
      return ""
    default:
      return prevState
  }
}
