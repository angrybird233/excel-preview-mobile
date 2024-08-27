<template>
  <div class="excel-preview-container">
    <Loading v-if="isLoading"></Loading>
    <div class="excel-view">
      <table class="excel-data" ref="excel-table">
        <thead>
          <tr>
            <th v-for="(item, index) in tableHeader" :key="index"
              :style="{minWidth: item.width+'px', height: '40px' }">
              {{ item.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in tableData" :key="index">
            <td :style="{minWidth: item.width+'px', height: '30px' }" v-for="(item, index2) in tableHeader"
              :key="index2">
              {{ row[item.prop] }}
            </td>
          </tr>
        </tbody>
      </table>
      <div class="sheet-names">
        <div class="sheet-item" :class="index === sheet_index ? 'active' : ''" v-for="(name, index) in sheet_names"
          :key="index" @click="changeSheet(index)">
          {{ name }}
        </div>
      </div>
    </div>
    <div class="error-view" v-if="isError">
      <div class="p-t-60 font-30">文件解析失败，请刷新重试！</div>
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
    columnWidth: {
      type: Number,
      default: 100
    }, // 列宽
    isAutoFit: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      isError: false, // 是否解析失败
      isLoading: false, // 是否加载中
      tableHeader: [],
      tableData: [],
      sheet_names: [],
      sheets_data: [],
      sheet_index: -1
    }
  },
  components: { Loading },
  mounted() {
    this.readExcelFile();
    this.fetchExcelFile()
  },
  methods: {
    async readExcelFile() {
      try {
        if (this.file) {
          this.isLoading = true
          let buffer;
          const reader = new FileReader();
          reader.onload = (e) =>{
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
        console.log(error);
        this.isLoading = false
      }
    },
    async fetchExcelFile() {
      try {
        if (this.url) {
          this.isLoading = true
          const response = await fetch(this.url);
          const buffer = await response.arrayBuffer();
          const wb = read(buffer);
          this.sheet_names = wb.SheetNames;
          this.sheets_data = wb.Sheets;
          this.changeSheet(0);
          this.isLoading = false
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
      if (this.sheet_index === index) return;
      const sheet_name = this.sheet_names[index];
      const sheet_json = utils.sheet_to_json(this.sheets_data[sheet_name], { raw: true, defval: "" });
      this.sheet_index = index;
      this.tableData = sheet_json;
      this.initTableHeader(sheet_json);
      this.addEmptyRows();
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
    // 经过评论反馈优化
    getCellWidth(value) {
      if (value == null) {
        return 10
      } else if (/.*[\u4e00-\u9fa5]+.*$/.test(value)) {
        // 判断是否包含中文
        return value.toString().length * 2.02
      } else {
        return value.toString().length * 1.02
      }

    },

    adjustColumnWidths(header) {
      if (this.isAutoFit) {
        const columsWidth = [];
        for (let i = 0; i < header.length; i++) {
          const theadWidth = this.getCellWidth(header[i].label);
          const colWidth = this.tableData.reduce((acc, cur) => {
            const width = this.getCellWidth(cur[header[i].prop]);
            return width > acc ? width : acc;
          }, 0);
          const width = Math.max(theadWidth, colWidth);
          columsWidth.push(width * 10);
        }
        this.tableHeader = header.map((item, index)=> {
          return {
            ...item,
            width: Math.ceil(columsWidth[index])

          }
        })
        console.log('tableHeader', this.tableHeader);
      }else{
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
  width: 100vw;
  min-height: 100vh;
  overflow: auto;

  .error-view {
    text-align: center;
  }
  .excel-view {
    width: 100vw;
    overflow: auto;
    min-height: 100%;

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