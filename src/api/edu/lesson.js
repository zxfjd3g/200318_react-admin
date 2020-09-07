import request from "@/utils/request"

// 模块请求公共前缀
const BASE_URL = "/admin/edu/lesson"

/* 
获取指定章节下的所有课时列表
*/
export function reqLessonList(chapterId) {
  return request({
    url: `${BASE_URL}/get/${chapterId}`,
    method: "GET",
  })
}

/* 
新增课时
*/
export function reqAddLesson({ chapterId, title, free, video }) {
  return request({
    url: `${BASE_URL}/save`,
    method: "POST",
    data: {
      chapterId,
      title,
      free,
      video,
    },
  })
}

/* 
删除课时列表
*/
export function reqRemoveLesson(id) {
  return request({
    url: `${BASE_URL}/remove/${id}`,
    method: "DELETE"
  })
}