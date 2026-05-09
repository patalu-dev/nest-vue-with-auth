<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="not-found-container">
    <div class="glow-effect"></div>
    <div class="content">
      <h1 class="error-code">404</h1>
      <div class="divider"></div>
      <h2 class="error-message">Không tìm thấy trang yêu cầu</h2>
      <p class="description">
        Trang bạn đang tìm kiếm có thể đã bị xóa, thay đổi tên hoặc tạm thời không khả dụng.
      </p>
      <button @click="goHome" class="back-home-btn">
        <span class="icon">←</span>
        <span>Quay lại trang chủ</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  color: #1a1a1a;
  overflow: hidden;
  position: relative;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.glow-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%);
  filter: blur(50px);
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;
  max-width: 600px;
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-code {
  font-size: 10rem;
  font-weight: 900;
  margin: 0;
  line-height: 1;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 30px rgba(99, 102, 241, 0.3));
  letter-spacing: -0.05em;
}

.divider {
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  margin: 1.5rem auto;
  border-radius: 2px;
}

.error-message {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: #1d1d1d;
}

.description {
  font-size: 1.1rem;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

.back-home-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 auto;
  padding: 0.875rem 1.75rem;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  color: #1a1a1a;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.back-home-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  border-color: #6366f1;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -10px rgba(99, 102, 241, 0.5);
}

.back-home-btn:active {
  transform: translateY(0);
}

.icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.back-home-btn:hover .icon {
  transform: translateX(-4px);
}

@media (max-width: 640px) {
  .error-code {
    font-size: 6rem;
  }

  .error-message {
    font-size: 1.5rem;
  }
}
</style>
