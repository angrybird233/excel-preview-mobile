<template>
  <div class="excel-preview-container">
    <Loading v-if="isLoading"></Loading>
    <div class="excel-view">
      <table class="excel-data" ref="excel-table">
        <thead>
          <tr>
            <th v-for="(item, index) in tableHeader" :key="index" :style="{ minWidth: item.width + 'px', height: '40px' }">
              {{ item.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in tableData" :key="index">
            <td :style="{ minWidth: item.width + 'px', height: '30px' }" v-for="(item, index2) in tableHeader"
              :key="index2">
              {{ row[item.prop] }}
            </td>
          </tr>
        </tbody>
      </table>
      <div class="sheet-names" v-if="sheet_names.length">
        <div class="sheet-item" :class="index === sheet_index ? 'active' : ''" v-for="(name, index) in sheet_names"
          :key="index" @click="changeSheet(index)">
          {{ name }}
        </div>
      </div>
    </div>
    <div class="error-view" v-if="isError">
      <div class="error-text" v-if="errMsg">{{ errMsg }}</div>
      <div class="error-text" v-else>文件解析失败，请刷新重试！</div>
    </div>

  </div>
</template>
<script>
import Loading from '../loading/index'
import { read, utils } from "xlsx";

export default {
  name: "ExcelPreviewMobile",
  props: {
    url: {
      type: String,
      default: ""
    }, // 文件网络地址
    file: {
      type: File,
      default: () => null
    }, // 文件对象
    isAutoFit: {
      type: Boolean,
      default: true
    },
    columnWidth: {
      type: Number,
      default: 100
    }, // 固定列宽
  },
  data() {
    return {
      isError: false, // 是否解析失败
      errMsg: "", // 错误信息"
      isLoading: false, // 是否加载中
      tableHeader: [],
      tableData: [],
      sheet_names: [],
      sheets_data: [],
      sheet_index: -1
    }
  },
  components: { Loading },
  watch: {
    url(val) {
      if(val) {
        this.fetchAndParseFile()
      }
    },
    file(val) {
      if(val) {
        this.readAndParseFile()
      }
    }
  },
  mounted() {
    this.readAndParseFile();
    this.fetchAndParseFile()
  },
  methods: {
    validateFile() {
      if (this.url) {
        const fileName = this.url.split('/').pop();
        if (!/\.(xlsx|xls|csv)$/.test(fileName)) {
          this.isError = true;
          this.errMsg = '文件格式错误，请传入正确格式的excel文件地址'
          this.$emit('error', '文件格式错误')
          return false
        }
      }
      if (this.file) {
        if (!/\.(xlsx|xls|csv)$/.test(this.file.name)) {
          this.isError = true;
          this.errMsg = '文件格式错误，请上传excel格式文件'
          this.$emit('error', '文件格式错误')
          return false
        }
      }
      return true
    },
    // 读取文件并解析
    async readAndParseFile() {
      try {
        if (!this.validateFile()) return;
        if (this.file) {
          this.isLoading = true
          let buffer;
          const reader = new FileReader();
          reader.onload = (e) => {
            buffer = e.target.result;
            const wb = read(buffer);
            this.sheet_names = wb.SheetNames;
            this.sheets_data = wb.Sheets;
            this.changeSheet(0);
            this.isLoading = false
          };
          reader.readAsArrayBuffer(this.file);
        }
      } catch (error) {
        this.isLoading = false
        this.$emit('error', error)
      }
    },
    // 获取网络文件并解析
    async fetchAndParseFile() {
      try {
        if (!this.validateFile()) return;
        if (this.url) {
          this.isLoading = true
          const response = await fetch(this.url);
          if(response) {
            const buffer = await response.arrayBuffer();
            const wb = read(buffer);
            this.sheet_names = wb.SheetNames;
            this.sheets_data = wb.Sheets;
            this.changeSheet(0);
            this.isLoading = false
          }else{
            this.isError = true;
            this.isLoading = false
            this.$emit('error', '文件请求失败')
          }
        }
      } catch (error) {
        this.isError = true;
        this.isLoading = false
        this.$emit('error', error)
      }
    },
    // 初始化表头
    initTableHeader(json) {
      if (json.length) {
        const header = Object.keys(json[0]).map(key => {
          return {
            label: key,
            prop: key,
            width: 170
          };
        });
        this.adjustColumnWidths(header)
      }
    },
    // 切换sheet
    changeSheet(index) {
      const sheet_name = this.sheet_names[index];
      const sheet_json = utils.sheet_to_json(this.sheets_data[sheet_name], { raw: true, defval: "" });
      this.sheet_index = index;
      this.tableData = sheet_json;
      this.initTableHeader(sheet_json);
      this.addEmptyRows();
      this.$emit('success', {
        header: this.tableHeader,
        data: this.tableData
      })
    },
    // 添加空数据
    addEmptyRows() {
      if (this.tableData.length < 30) {
        const empty_rows = new Array(30).fill({}).map(item => {
          this.tableHeader.forEach(val => {
            item[val.prop] = "";
          });
          return item;
        });
        this.tableData = this.tableData.concat(empty_rows);
      }
    },
    // 获取单元格内容宽度
    getCellWidth(value) {
      if (value == null) {
        return 10
      } else if (/.*[\u4e00-\u9fa5]+.*$/.test(value)) {
        // 判断是否包含中文
        return value.toString().length * 2
      } else {
        return value.toString().length * 1.02
      }
    },

    // 根据表格或表头内容自动调整列宽
    adjustColumnWidths(header) {
      if (this.isAutoFit) {
        const columsWidth = [];
        for (let i = 0; i < header.length; i++) {
          const theadWidth = this.getCellWidth(header[i].label);
          const colWidth = this.tableData.reduce((acc, cur) => {
            const width = this.getCellWidth(cur[header[i].prop]);
            return width > acc ? width : acc;
          }, 0);
          const maxWidth = Math.max(theadWidth, colWidth);
          columsWidth.push(maxWidth * 10);
        }
        this.tableHeader = header.map((item, index) => {
          return {
            ...item,
            width: Math.ceil(columsWidth[index])

          }
        })
      } else {
        this.tableHeader = header.map(item => {
          return {
            ...item,
            width: this.columnWidth
          }
        })
      }
    }
  },
}
</script>
<style lang="less" scoped>
.excel-preview-container {
  padding: 10px 10px 60px;
  overflow: auto;

  .error-view {
    text-align: center;
    padding: 10px;

    .error-text {
      color: #f00;
    }
  }

  .excel-view {
    table {
      border: 1px solid #ccc;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 14px;

      th {
        background-color: #f5f5f5;
      }

      th,
      td {
        border: 1px solid #ccc;
        padding: 0;
        text-align: center;
      }
    }
  }

  .sheet-names {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100vw;
    height: 50px;
    overflow-x: auto;
    overflow-y: hidden;
    background: #ddebee;
    padding: 0 10px;
    font-size: 14px;
    white-space: nowrap;

    .sheet-item {
      display: inline-block;
      width: 120px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      color: #000;
      transition: background 0.3s;

      &.active {
        color: #007a6b;
        background: #fff;
        border-radius: 0 0 8px 8px;
      }
    }
  }

}
</style>