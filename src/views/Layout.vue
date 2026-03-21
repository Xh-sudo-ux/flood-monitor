<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo-container">
        <el-icon size="32" color="#00d9ff"><Monitor /></el-icon>
        <span v-show="!isCollapse" class="logo-text">洪涝监测系统</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        class="sidebar-menu"
        background-color="transparent"
        text-color="#a8b5c8"
        active-text-color="#00d9ff"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon 
            class="collapse-btn" 
            size="20"
            @click="toggleCollapse"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <span class="page-title">{{ currentPageTitle }}</span>
        </div>
        
        <div class="header-right">
          <!-- 实时时间 -->
          <div class="current-time">
            <el-icon><Clock /></el-icon>
            <span>{{ formattedTime }}</span>
          </div>
          
          <!-- 天气信息 -->
          <div class="weather-info">
            <el-icon><PartlyCloudy /></el-icon>
            <span>24°C 多云</span>
          </div>
          
          <!-- 全屏按钮 -->
          <el-icon class="header-icon" size="18" @click="toggleFullscreen">
            <FullScreen />
          </el-icon>
          
          <!-- 用户菜单 -->
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="username">管理员</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="settings">系统设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 内容区 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Monitor,
  DataLine,
  Pouring,
  Watermelon,
  Filter,
  PieChart,
  Timer,
  MapLocation,
  Fold,
  Expand,
  Clock,
  PartlyCloudy,
  FullScreen,
  UserFilled,
  ArrowDown
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const activeMenu = computed(() => route.path)
const currentTime = ref(new Date())
let timer: number

const menuItems = [
  { path: '/dashboard', title: '系统概览', icon: 'DataLine' },
  { path: '/rainfall', title: '实时雨情', icon: 'Pouring' },
  { path: '/waterlevel', title: '河流水位', icon: 'Watermelon' },
  { path: '/flood-extraction', title: '洪水提取', icon: 'Filter' },
  { path: '/water-analysis', title: '水域分析', icon: 'PieChart' },
  { path: '/spatiotemporal', title: '时空演进', icon: 'Timer' },
  { path: '/inundation', title: '淹没分析', icon: 'MapLocation' }
]

const currentPageTitle = computed(() => {
  const item = menuItems.find(item => item.path === route.path)
  return item?.title || '系统概览'
})

const formattedTime = computed(() => {
  return currentTime.value.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人中心功能开发中')
      break
    case 'settings':
      ElMessage.info('系统设置功能开发中')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        ElMessage.success('已退出登录')
        router.push('/login')
      })
      break
  }
}

onMounted(() => {
  timer = window.setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  background: #0a1628;
}

.sidebar {
  background: linear-gradient(180deg, #0a1628 0%, #132238 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  transition: width 0.3s;
  
  .logo-container {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
    }
  }
  
  .sidebar-menu {
    border-right: none;
    background: transparent;
    
    :deep(.el-menu-item) {
      height: 50px;
      line-height: 50px;
      margin: 4px 8px;
      border-radius: 8px;
      
      &:hover {
        background: rgba(13, 115, 119, 0.2);
      }
      
      &.is-active {
        background: linear-gradient(135deg, rgba(13, 115, 119, 0.3), rgba(20, 145, 155, 0.3));
        border-right: 3px solid #00ff9d;
      }
      
      .el-icon {
        font-size: 18px;
      }
    }
  }
}

.header {
  height: 64px;
  background: #132238;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .collapse-btn {
      cursor: pointer;
      color: #a8b5c8;
      transition: color 0.3s;
      
      &:hover {
        color: #00d9ff;
      }
    }
    
    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 24px;
    
    .current-time,
    .weather-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #a8b5c8;
      font-size: 14px;
      
      .el-icon {
        color: #00d9ff;
      }
    }
    
    .header-icon {
      cursor: pointer;
      color: #a8b5c8;
      transition: color 0.3s;
      
      &:hover {
        color: #00d9ff;
      }
    }
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    
    .username {
      color: #fff;
      font-size: 14px;
    }
  }
}

.main-content {
  background: #0a1628;
  padding: 20px;
  overflow: auto;
}

.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
