/* 
向外暴露reducer和action的模块
*/
// 引入reducer
import chapter from './reducers'
// 引入action
import {getAllCourseList, getChapterList, getLessonList} from './actions'

// 向外暴露reducer和action
export {chapter, getAllCourseList, getChapterList, getLessonList}