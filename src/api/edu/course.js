import request from "@/utils/request"

// 模块请求公共前缀
const BASE_URL = "/admin/edu/course"

/* 
获取所有课程数据
*/
export function reqAllCourseList() {
  return request(BASE_URL)
}

/* 
获取课程分页列表数据
*/
export function reqCourseList({
  page,
  limit,
  teacherId,
  subjectId,
  subjectParentId,
  title
}) {
  return request({
    url: `${BASE_URL}/${page}/${limit}`,
    method: "GET",
    params: {
      teacherId,
      subjectId,
      subjectParentId,
      title,
    },
  })
}