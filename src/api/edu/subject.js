/* 
分类管理相关接口请求函数
*/

import request from "@/utils/request"

const BASE_URL = "/admin/edu/subject"

/* 
获取课程一级分类数据(分页)
http://localhost:5000/admin/edu/subject/:page/:limit GET
*/
export function reqSubjectList (page,pageSize) {
  return request({
    url: `${BASE_URL}/${page}/${pageSize}`,
    method: "GET",
  })
  // return request(`${BASE_URL}/${page}/${pageSize}`)
  // return request.get(`${BASE_URL}/${page}/${pageSize}`)
}

/* 
获取所有课程一级分类数据
http://localhost:5000/admin/edu/subject GET
*/
export function reqAllSubjectList() {
  return request({
    url: `${BASE_URL}`,
    method: "GET",
  })
}

/* 
通过一级分类id，获取该一级分类下属的所有二级分类
http://localhost:5000/admin/edu/subject/get/:parentId GET
*/
export function reqAllSubSubjectList(parentId) {
  return request({
    url: `${BASE_URL}/get/${parentId}`,
    method: "GET",
  })
}

/* 
添加课程分类
http://localhost:5000/admin/edu/subject/save POST
title/parentId
*/
export function reqAddSubject(title,parentId) {
  return request({
    url: `${BASE_URL}/save`,
    method: "POST",
    data:{title,parentId},
  })
}

/* 
更新课程分类
http://localhost:5000/admin/edu/subject/update PUT id/title
*/
export function reqUpdateSubject(id,title) {
  return request({
    url: `${BASE_URL}/update`,
    method: "PUT",
    data:{id,title},
  });
}

/* 
删除课程分类
http://localhost:5000/admin/edu/subject/remove/:id DELETE
*/
export function reqDeleteSubject(id) {
  return request({
	url: `${BASE_URL}/remove/${id}`,
    method: "DELETE",
  })
}