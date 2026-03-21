<template>
  <div class="inundation-page">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon red">
            <el-icon size="24"><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalInundationArea.toFixed(2) }}</div>
            <div class="stat-label">总淹没面积 (km²)</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon orange">
            <el-icon size="24"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalAffectedPopulation }}</div>
            <div class="stat-label">受影响人口</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon blue">
            <el-icon size="24"><MapLocation /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ inundationAreas.length }}</div>
            <div class="stat-label">淹没区域数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon cyan">
            <el-icon size="24"><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ avgDepth.toFixed(2) }}</div>
            <div class="stat-label">平均水深 (m)</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="12">
        <div class="chart-card">
          <div class="card-header">
            <span class="card-title">面积统计</span>
          </div>
          <div class="chart-body">
            <v-chart class="chart" :option="areaChartOption" autoresize />
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="chart-card">
          <div class="card-header">
            <span class="card-title">地物识别</span>
          </div>
          <div class="chart-body">
            <v-chart class="chart" :option="featureChartOption" autoresize />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 淹没区域列表 -->
    <el-row class="table-row">
      <el-col :span="24">
        <div class="table-card">
          <div class="card-header">
            <span class="card-title">淹没区域详情</span>
          </div>
          <el-table
            :data="inundationAreas"
            height="280"
            style="width: 100%"
            :header-cell-style="{ background: 'transparent', color: '#a8b5c8' }"
            :cell-style="{ background: 'transparent', color: '#fff' }"
          >
            <el-table-column prop="id" label="区域编号" width="100" />
            <el-table-column prop="name" label="区域名称" width="150" />
            <el-table-column prop="area" label="面积(km²)" width="120">
              <template #default="{ row }">
                <span class="highlight">{{ row.area.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="depth" label="平均水深(m)" width="120">
              <template #default="{ row }">
                <span :class="getDepthClass(row.depth)">{{ row.depth.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="affectedPopulation" label="受影响人口" width="130">
              <template #default="{ row }">
                {{ row.affectedPopulation.toLocaleString() }} 人
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="160" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default>
                <el-button type="primary" link size="small">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { Warning, User, MapLocation, TrendCharts } from '@element-plus/icons-vue'
import { useMonitorStore } from '@/stores/monitor'

use([
  CanvasRenderer,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

const monitorStore = useMonitorStore()
const inundationAreas = computed(() => monitorStore.inundationAreas)

// 统计数据
const totalInundationArea = computed(() => {
  return inundationAreas.value.reduce((sum, area) => sum + area.area, 0)
})

const totalAffectedPopulation = computed(() => {
  return inundationAreas.value.reduce((sum, area) => sum + area.affectedPopulation, 0)
})

const avgDepth = computed(() => {
  if (inundationAreas.value.length === 0) return 0
  return inundationAreas.value.reduce((sum, area) => sum + area.depth, 0) / inundationAreas.value.length
})

// 获取水深等级样式
const getDepthClass = (depth: number) => {
  if (depth >= 1.5) return 'danger'
  if (depth >= 1.0) return 'warning'
  return 'normal'
}

// 获取状态类型
const getStatusType = (status: string) => {
  if (status === 'active') return 'danger'
  if (status === 'warning') return 'warning'
  return 'success'
}

// 获取状态文本
const getStatusText = (status: string) => {
  if (status === 'active') return '活跃'
  if (status === 'warning') return '预警'
  return '已消退'
}

// 面积统计图配置
const areaChartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(22, 32, 53, 0.9)',
    borderColor: '#1e3a5f',
    textStyle: { color: '#fff' },
    axisPointer: { type: 'shadow' }
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
    data: inundationAreas.value.map(a => a.name),
    axisLine: { lineStyle: { color: '#1e3a5f' } },
    axisLabel: { color: '#a8b5c8', rotate: 30, fontSize: 10 }
  },
  yAxis: {
    type: 'value',
    name: '面积(km²)',
    nameTextStyle: { color: '#a8b5c8' },
    axisLine: { lineStyle: { color: '#1e3a5f' } },
    axisLabel: { color: '#a8b5c8' },
    splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } }
  },
  series: [{
    type: 'bar',
    data: inundationAreas.value.map(a => a.area),
    itemStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: '#f5222d' },
          { offset: 1, color: '#faad14' }
        ]
      },
      borderRadius: [4, 4, 0, 0]
    }
  }]
}))

// 地物识别饼图配置
const featureChartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(22, 32, 53, 0.9)',
    borderColor: '#1e3a5f',
    textStyle: { color: '#fff' },
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center',
    textStyle: { color: '#a8b5c8', fontSize: 11 }
  },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['35%', '50%'],
    avoidLabelOverlap: false,
    itemStyle: {
      borderRadius: 6,
      borderColor: '#162035',
      borderWidth: 2
    },
    label: {
      show: false
    },
    emphasis: {
      label: {
        show: true,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff'
      }
    },
    data: [
      { value: 45, name: '居民区' },
      { value: 30, name: '农田' },
      { value: 15, name: '道路' },
      { value: 10, name: '其他' }
    ],
    color: ['#f5222d', '#faad14', '#00d9ff', '#a855f7']
  }]
}))
</script>

<style scoped lang="scss">
.inundation-page {
  .stat-row {
    margin-bottom: 16px;
  }

  .stat-card {
    background: rgba(22, 32, 53, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
      border-color: rgba(0, 217, 255, 0.3);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.red {
        background: rgba(245, 34, 45, 0.2);
        color: #f5222d;
      }

      &.orange {
        background: rgba(250, 173, 20, 0.2);
        color: #faad14;
      }

      &.blue {
        background: rgba(0, 217, 255, 0.2);
        color: #00d9ff;
      }

      &.cyan {
        background: rgba(0, 255, 157, 0.2);
        color: #00ff9d;
      }
    }

    .stat-info {
      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #fff;
      }

      .stat-label {
        font-size: 12px;
        color: #a8b5c8;
        margin-top: 4px;
      }
    }
  }

  .chart-row {
    margin-bottom: 16px;
  }

  .chart-card {
    background: rgba(22, 32, 53, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    height: 350px;
    display: flex;
    flex-direction: column;
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      
      .card-title {
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
    
    .chart-body {
      flex: 1;
      
      .chart {
        width: 100%;
        height: 100%;
      }
    }
  }

  .table-row {
    .table-card {
      background: rgba(22, 32, 53, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 16px;
      
      .card-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        
        .card-title {
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
    }
    
    :deep(.el-table) {
      background: transparent;

      &::before {
        display: none;
      }

      .el-table__body-wrapper {
        background: transparent;
      }

      tr {
        background: transparent;
      }

      th {
        background: rgba(30, 58, 95, 0.3) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      td {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .highlight {
        color: #00d9ff;
        font-weight: 600;
      }

      .danger {
        color: #f5222d;
        font-weight: 600;
      }

      .warning {
        color: #faad14;
        font-weight: 600;
      }

      .normal {
        color: #52c41a;
      }
    }
  }
}
</style>
