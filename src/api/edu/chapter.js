import request from "@/utils/request"

// 模块请求公共前缀
const BASE_URL = "/admin/edu/chapter"

/* 
获取某个课程的章节分页列表
*/
export function reqChapterList({ page, pageSize, courseId }) {
  return request({
    url: `${BASE_URL}/${page}/${pageSize}`,
    method: "GET",
    params: {
      courseId,
    },
  })
}

/* 
添加章节(某个课程下的)
*/
export function reqAddChapter(courseId, title) {
  return request({
    url: `${BASE_URL}/save`,
    method: "POST",
    data: {
      courseId,
      title
    },
  })
}

/* 
更新章节
*/
export function reqUpdateChapter(chapterId, title) {
  return request({
    url: `${BASE_URL}/update`,
    method: "PUT",
    data: {
      chapterId,
      title
    },
  })
}

/* 
删除章节
*/
export function reqRemoveChapter(id) {
  return request({
    url: `${BASE_URL}/remove/${id}`,
    method: "DELETE",
  })
}