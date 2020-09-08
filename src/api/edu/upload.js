import request from '@/utils/request'
//获取七牛云上传token
export function reqUploadToken() {
  return request({
    url: `/uploadtoken`,
    method: 'GET'
  })
}