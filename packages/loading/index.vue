<template>
  <div class="loading-container">
    <div class="loading-mask"></div>
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <div class="loading-text">文件解析中</div>
    </div>
  </div>
</template>
<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Loading',
  data() {
    return {

    }
  },
  mounted() {
  },
  methods: {

  },
}
</script>
<style lang="less" scoped>
.loading-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 5000;
  overflow: hidden;

  .loading-mask {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, .02);
    z-index: 5001;
  }
  .loading-content{
    width: 120px;
    height: 120px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgba(0,0,0,0.6);
    color: #fff;
    font-size: 13px;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: transparent;
    border: 3px solid #fff;
    clip-path: polygon(100% 100%, 100% 0, -30% 0);
    animation: loading 1s ease-in-out infinite;
    margin-bottom: 10px;
  }
  @keyframes loading {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
}
</style>