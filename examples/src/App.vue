<template>
  <div id="app">
    <form>
      <input type="file" @change="handleFileChange" accept=".xlsx,.xls,.csv" />
    </form>
    <ExcelPreviewMobile v-if="file || url" :url="url" :file="file" :isAutoFit="true" />
  </div>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      url: '',
      file: null
    }
  },
  methods: {
    handleFileChange(e) {
      this.file = e.target.files[0];
    }
  }
}
</script>

<style lang="less" scoped>
  form {
    padding: 20px;
    border: 1px solid #ccc;
  }
</style>

