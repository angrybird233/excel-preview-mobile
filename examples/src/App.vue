<template>
  <div id="app">
    <div class="tabs">
      <div class="tab-item" :class="activeName === 1?'active':''" @click="tabClick(1)">手动选择文件</div>
      <div class="tab-item" :class="activeName === 2?'active':''" @click="tabClick(2)">输入网络地址</div>
    </div>
    <div class="form"  v-if="activeName === 1">
      <input type="file" @change="handleFileChange" accept=".xlsx,.xls,.csv"  />
    </div>
    <div class="form" v-if="activeName === 2">
      <label for="url"> 请输入excel文件地址：</label>
      <input type="url" v-model="fileUrl" @keyup.enter="parseFile"  />
      <button type="button" @click="parseFile">解析文件</button>
    </div>
    <ExcelPreviewMobile v-if="file || url" :url="url" :file="file" :isAutoFit="true" @success="readSuccess" @error="parseError" />
  </div>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      activeName: 1,
      fileUrl: "",
      url: '',
      file: null
    }
  },
  methods: {
    tabClick(index) {
      this.activeName = index;
    },
    parseFile() {
      this.url = this.fileUrl;
    },
    handleFileChange(e) {
      this.file = e.target.files[0];
    },
    readSuccess({header, data}) {
      console.log(header, data);
    },
    parseError(error) {
      console.error(error);
    }
  }
}
</script>

<style lang="less" scoped>
#app {
  padding:  10px;
}
.tabs{
  display: flex;
  justify-content: flex-start;
  align-items: center;
  .tab-item {
    padding: 10px 20px;
    border: 1px solid #ccc;
    border-right: none;
    cursor: pointer;
    &:last-child {
      border-right: 1px solid #ccc;
    }
    &.active {
      background-color: #ccc;
    }
  };
}
  .form {
    padding: 20px;
    border: 1px solid #ccc;
    margin-top: 10px;
    display: flex;
    align-items: center;
    input {
      padding: 5px;
      margin-right: 10px;
      &:focus {
        outline: none;
      }
    }
    button {
      padding: 5px 10px;
      background-color: #0c7eef;
      border: none;
      color: #fff;
      border-radius: 4px;
    }
  }
</style>

