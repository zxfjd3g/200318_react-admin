import Login from "@/pages/Login"
import NotFound from "@/pages/404"

// 常量路由
export const constantRoutes = [
	{
		path: "/login",
		component: Login,
		title: "登录",
	},
	{ 
		path: "*", 
		component: NotFound 
	},
]

/**
 * 登录后 默认路由
 */
export const defaultRoutes = [
	// 首页
	{
		path: "/",
		component: "Admin",
		icon: "home",
		name: "后台管理系统",
	},
]
