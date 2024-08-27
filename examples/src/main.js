import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import ExcelPreviewMobile from '../../packages/excel-preview-mobile/install'
Vue.use(ExcelPreviewMobile)

new Vue({
  render: h => h(App),
}).$mount('#app')
