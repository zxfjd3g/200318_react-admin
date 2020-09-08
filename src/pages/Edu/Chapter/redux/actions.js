/* 
包含同步和异步action的模块
*/
import {
  GET_ALL_COURSE_LIST,
  GET_CHAPTER_LIST,
  GET_LESSON_LIST
} from './constants'
import {
  reqAllCourseList
} from '@/api/edu/course'
import {
  reqChapterList
} from '@/api/edu/chapter'
import {
  reqLessonList
} from '@/api/edu/lesson'


/* 
获取所有课程列表
*/
const getAllCourseListSync = (allCourseList) => ({type: GET_ALL_COURSE_LIST, data: allCourseList})
export const getAllCourseList = () => {
  return async (dispatch, getState) => {
    // 执行异步请求
    const allCourseList = await reqAllCourseList()
    // 请求成功后, 分发同步action
    dispatch(getAllCourseListSync(allCourseList))
    return allCourseList
  }
}

/* 
获取指定课程下的章节分页列表
*/
const getChapterListSync = ({courseId, page, pageSize, chapterList}) => ({ 
  type: GET_CHAPTER_LIST, 
  data: {courseId, page, pageSize, chapterList}
}) 

export const getChapterList = ({ page, pageSize, courseId }) => {
  return dispatch => {
    return reqChapterList({ page, pageSize, courseId })
      .then((chapterList) => {
        dispatch(getChapterListSync({courseId, page, pageSize, chapterList}))
        return chapterList
      })
  }
}

/* 
获取指定章节下的课时列表
*/
const getLessonListSync = ({chapterId, lessonList}) => ({ 
  type: GET_LESSON_LIST, 
  data: {chapterId, lessonList}
}) 

export const getLessonList = (chapterId) => {
  return dispatch => {
    return reqLessonList(chapterId)
      .then((lessonList) => {
        dispatch(getLessonListSync({chapterId, lessonList}))
      })
  }
}
