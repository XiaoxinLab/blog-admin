<template>
  <div class="page notfound">
    <div class="notfound-code">404</div>
    <div class="notfound-text">这个页面不存在</div>
    <router-link to="/" class="btn btn-primary" style="margin-top: 18px">回仪表盘</router-link>
  </div>
</template>

<style scoped>
.notfound {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 60px;
}

.notfound-code {
  font-size: 68px;
  font-weight: 800;
  color: var(--accent);
  letter-spacing: -0.04em;
  line-height: 1;
}

.notfound-text {
  color: var(--text-secondary);
  margin-top: 10px;
}
</style>
