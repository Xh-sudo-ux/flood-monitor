<template>
  <div class="spatiotemporal-page">
    <!-- 控制面板 -->
    <el-row :gutter="16" class="control-row">
      <el-col :span="24">
        <div class="control-panel">
          <div class="panel-header">
            <span class="panel-title">时空演进分析</span>
          </div>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="8">
              <el-form-item label="起始时间">
                <el-date-picker
                  v-model="timeRange.start"
                  type="datetime"
                  placeholder="选择起始时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-form-item label="结束时间">
                <el-date-picker
                  v-model="timeRange.end"
                  type="datetime"
                  placeholder="选择结束时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-form-item label="时间间隔">
                <el-select v-model="timeInterval" style="width: 100%">
                  <el-option label="1小时" value="1h" />
                  <el-option label="6小时" value="6h" />
                  <el-option label="12小时" value="12h" />
                  <el-option label="1天" value="1d" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24" style="text-align: center;">
              <el-button type="primary" @click="startAnalysis" :loading="analyzing">
                <el-icon><VideoPlay /></el-icon>
                开始分析
              </el-button>
              <el-button @click="resetAnalysis">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>

    <!-- 演进可视化 -->
    <el-row :gutter="16" class="visual-row">
      <el-col :xs="24" :lg="16">
        <div class="visual-panel">
          <div class="panel-header">
            <span class="panel-title">演进过程可视化</span>
            <div class="playback-controls">
              <el-button circle size="small" @click="prevFrame">
                <el-icon><ArrowLeft /></el-icon>
              </el-button>
              <el-button circle size="small" @click="togglePlay">
                <el-icon><VideoPlay v-if="!isPlaying" /><VideoPause v-else /></el-icon>
              </el-button>
              <el-button circle size="small" @click="nextFrame">
                <el-icon><ArrowRight /></el-icon>
              </el-button>
              <span class="frame-info">{{ currentFrame + 1 }} / {{ totalFrames }}</span>
            </div>
          </div>
          <div class="visual-content">
            <div class="mock-visual">
              <div class="timeline-slider">
                <el-slider v-model="currentFrame" :max="totalFrames - 1" show-stops />
              </div>
              <div class="visual-placeholder">
                <el-icon size="64" color="#1e3a5f"><MapLocation /></el-icon>
                <p>时空演进可视化区域</p>
                <p class="time-display">{{ currentTime }}</p>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="8">
        <div class="stats-panel">
          <div class="panel-header">
            <span class="panel-title">演进统计</span>
          </div>
          <div class="stats-content">
            <div class="stat-item">
              <span class="stat-label">淹没面积变化</span>
              <span class="stat-value" :class="areaChange > 0 ? 'up' : 'down'">
                {{ areaChange > 0 ? '+' : '' }}{{ areaChange }} km²
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">受影响人口</span>
              <span class="stat-value">{{ affectedPopulation }} 人</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">演进速度</span>
              <span class="stat-value">{{ evolutionSpeed }} km²/h</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">主要方向</span>
              <span class="stat-value">{{ mainDirection }}</span>
            </div>
          </div>
          <div class="chart-container">
            <v-chart class="chart" :option="evolutionChartOption" autoresize />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import {
  VideoPlay,
  VideoPause,
  ArrowLeft,
  ArrowRight,
  Refresh,
  MapLocation
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent
])

const timeRange = ref({
  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  end: new Date()
})
const timeInterval = ref('6h')
const analyzing = ref(false)
const isPlaying = ref(false)
const currentFrame = ref(0)
const totalFrames = ref(28)

const currentTime = computed(() => {
  const start = timeRange.value.start.getTime()
  const end = timeRange.value.end.getTime()
  const progress = currentFrame.value / (totalFrames.value - 1)
  const current = new Date(start + (end - start) * progress)
  return current.toLocaleString('zh-CN')
})

const areaChange = ref(15.8)
const affectedPopulation = ref(6800)
const evolutionSpeed = ref(2.3)
const mainDirection = ref('东南')

const evolutionChartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(22, 32, 53, 0.9)',
    borderColor: '#1e3a5f',
    textStyle: { color: '#fff' }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['T+0', 'T+6h', 'T+12h', 'T+18h', 'T+24h', 'T+30h', 'T+36h'],
    axisLine: { lineStyle: { color: '#1e3a5f' } },
    axisLabel: { color: '#a8b5c8', fontSize: 10 }
  },
  yAxis: {
    type: 'value',
    name: '面积(km²)',
    nameTextStyle: { color: '#a8b5c8', fontSize: 10 },
    axisLine: { lineStyle: { color: '#1e3a5f' } },
    axisLabel: { color: '#a8b5c8', fontSize: 10 },
    splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } }
  },
  series: [{
    type: 'line',
    smooth: true,
    data: [10, 15, 22, 28, 35, 42, 48],
    lineStyle: { color: '#00d9ff', width: 2 },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(0, 217, 255, 0.3)' },
          { offset: 1, color: 'rgba(0, 217, 255, 0)' }
        ]
      }
    },
    symbol: 'circle',
    symbolSize: 6,
    itemStyle: { color: '#00d9ff' }
  }]
}))

const startAnalysis = () => {
  analyzing.value = true
  setTimeout(() => {
    analyzing.value = false
    ElMessage.success('分析完成')
  }, 2000)
}

const resetAnalysis = () => {
  timeRange.value = {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  }
  timeInterval.value = '6h'
  currentFrame.value = 0
  isPlaying.value = false
}

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

const prevFrame = () => {
  if (currentFrame.value > 0) {
    currentFrame.value--
  }
}

const nextFrame = () => {
  if (currentFrame.value < totalFrames.value - 1) {
    currentFrame.value++
  }
}
</script>

<style scoped lang="scss">
.spatiotemporal-page {
  .control-row {
    margin-bottom: 16px;
  }

  .control-panel {
    background: rgba(22, 32, 53, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;

    .panel-header {
      margin-bottom: 16px;

      .panel-title {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 8px;

        &::before {
          content: '';
          width: 3px;
          height: 16px;
          background: linear-gradient(180deg, #00d9ff, #0d7377);
          border-radius: 2px;
        }
      }
    }

    :deep(.el-form-item__label) {
      color: #a8b5c8;
    }

    :deep(.el-input__wrapper) {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: none;

      &:hover,
      &:focus {
        border-color: #00d9ff;
      }
    }

    :deep(.el-input__inner) {
      color: #fff;
    }
  }

  .visual-row {
    .visual-panel {
      background: rgba(22, 32, 53, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      height: 500px;
      display: flex;
      flex-direction: column;

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;

        .panel-title {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;

          &::before {
            content: '';
            width: 3px;
            height: 16px;
            background: linear-gradient(180deg, #00d9ff, #0d7377);
            border-radius: 2px;
          }
        }

        .playback-controls {
          display: flex;
          align-items: center;
          gap: 8px;

          .frame-info {
            margin-left: 12px;
            color: #a8b5c8;
            font-size: 14px;
          }
        }
      }

      .visual-content {
        flex: 1;

        .mock-visual {
          height: 100%;
          display: flex;
          flex-direction: column;

          .timeline-slider {
            padding: 10px 0;

            :deep(.el-slider__runway) {
              background-color: #1e3a5f;
            }

            :deep(.el-slider__bar) {
              background-color: #00d9ff;
            }

            :deep(.el-slider__button) {
              border-color: #00d9ff;
            }
          }

          .visual-placeholder {
            flex: 1;
            background: rgba(30, 58, 95, 0.3);
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            p {
              margin-top: 16px;
              color: #a8b5c8;

              &.time-display {
                margin-top: 8px;
                font-size: 18px;
                color: #00d9ff;
                font-weight: 600;
              }
            }
          }
        }
      }
    }

    .stats-panel {
      background: rgba(22, 32, 53, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      height: 500px;
      display: flex;
      flex-direction: column;

      .panel-header {
        margin-bottom: 16px;

        .panel-title {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;

          &::before {
            content: '';
            width: 3px;
            height: 16px;
            background: linear-gradient(180deg, #00d9ff, #0d7377);
            border-radius: 2px;
          }
        }
      }

      .stats-content {
        margin-bottom: 20px;

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);

          .stat-label {
            color: #a8b5c8;
            font-size: 14px;
          }

          .stat-value {
            font-size: 16px;
            font-weight: 600;
            color: #fff;

            &.up {
              color: #f5222d;
            }

            &.down {
              color: #52c41a;
            }
          }
        }
      }

      .chart-container {
        flex: 1;

        .chart {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>
