<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo">
        <el-icon size="48" color="#00d9ff"><Monitor /></el-icon>
      </div>
      <h1 class="system-title">基于WebGIS的洪涝灾害</h1>
      <h2 class="system-subtitle">可视化监测分析系统</h2>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-tips">
        <p>演示账号: admin / 123456</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Monitor } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const loginFormRef = ref()

const loginForm = reactive({
  username: 'admin',
  password: '123456'
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
  } catch (error) {
    return
  }
  
  loading.value = true
  
  setTimeout(() => {
    localStorage.setItem('token', 'demo-token')
    localStorage.setItem('user', JSON.stringify({
      username: loginForm.username,
      role: 'admin'
    }))
    ElMessage.success('登录成功')
    router.push('/dashboard')
    loading.value = false
  }, 500)
}
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0a1628 0%, #132238 50%, #0d7377 100%);
}

.login-box {
  background: rgba(22, 32, 53, 0.9);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 16px;
  padding: 40px;
  width: 400px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.logo {
  margin-bottom: 20px;
}

.system-title {
  font-size: 24px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.system-subtitle {
  font-size: 18px;
  color: #00d9ff;
  margin-bottom: 30px;
}

.login-form {
  margin-top: 20px;
  
  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: none;
    
    &:hover, &:focus {
      border-color: #00d9ff;
    }
  }
  
  :deep(.el-input__inner) {
    color: #fff;
    
    &::placeholder {
      color: #a8b5c8;
    }
  }
}

.login-button {
  width: 100%;
  background: linear-gradient(135deg, #00d9ff, #0d7377);
  border: none;
  font-size: 16px;
  font-weight: 600;
  
  &:hover {
    background: linear-gradient(135deg, #00ff9d, #0d7377);
  }
}

.login-tips {
  margin-top: 20px;
  color: #a8b5c8;
  font-size: 12px;
}
</style>
