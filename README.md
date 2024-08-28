# excel文件移动端预览组件 excel-preview-mobile


### 组件Props

| 属性名 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| url | String | "" | 文件网络地址 |
| file | File | null | 文件对象 |
| columnWidth | Number | 160 | 列固定宽度 |
| isAutoFit | Boolean | true | 列宽是否根据内容自适应 |



### 组件事件 Event

| 事件名 | 返回值 | 描述 |
| --- | --- | --- |
| success | ( {header, data} ) | 解析成功回调事件 |
| error | (err) | 解析失败回调事件 |

## 示例代码

```vue
<template>
  <div>
    <ExcelPreviewMobile :url="url" :isAutoFit="true" @success="success" @error="error"></ExcelPreviewMobile>
  </div>
</template>
<script>
import ExcelPreviewMobile from 'excel-preview-mobile' // 引入文件上传组件
export default {
  data() {
    return {
      url: "",
      file: null,
    }
  },
  components: {
    ExcelPreviewMobile
  },
  methods: {
    success({ header, data }) {
      console.log(header, data)
    },
    error(err) {
      console.log(err)
    }
  }
}
</script>
```