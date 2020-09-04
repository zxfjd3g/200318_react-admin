import dayjsGenerateConfig from "rc-picker/lib/generate/dayjs"
import generatePicker from "antd/es/date-picker/generatePicker"
import "antd/es/date-picker/style/index"

const DatePicker = generatePicker(dayjsGenerateConfig)

export default DatePicker

/* 
使用dayjs替换默认的moment来减小打包文件
  https://ant.design/docs/react/replace-moment-cn#DatePicker
  方法一: 使用当前方式
  方式二: 只需要在config.overrides.js中修改配置即可
*/
