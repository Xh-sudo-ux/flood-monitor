<template>
  <div class="water-analysis-page">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon blue">
            <el-icon size="24"><Watermelon /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalWaterArea.toFixed(2) }}</div>
            <div class="stat-label">主体水域面积 (km²)</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon cyan">
            <el-icon size="24"><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ avgWaterLevel.toFixed(2) }}</div>
            <div class="stat-label">平均水位 (m)</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon purple">
            <el-icon size="24"><PieChart /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ waterBodyCount }}</div>
            <div class="stat-label">水体数量</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon orange">
            <el-icon size="24"><DataAnalysis /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ changeRate }}%</div>
            <div class="stat-label">面积变化率</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="12">
        <div class="chart-card">
          <div class="card-header">
            <span class="card-title">多影像加载对比</span>
          </div>
          <div class="chart-body">
            <v-chart class="chart" :option="multiImageOption" autoresize />
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="chart-card">
          <div class="card-header">
            <span class="card-title">水位统计</span>
          </div>
          <div class="chart-body">
            <v-chart class="chart" :option="waterLevelStatOption" autoresize />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 水域分析表格 -->
    <el-row class="table-row">
      <el-col :span="24">
        <div class="table-card">
          <div class="card-header">
            <span class="card-title">水域分析明细</span>
          </div>
          <el-table
            :data="waterBodyData"
            height="280"
            style="width: 100%"
            :header-cell-style="{ background: 'transparent', color: '#a8b5c8' }"
            :cell-style="{ background: 'transparent', color: '#fff' }"
          >
            <el-table-column prop="name" label="水体名称" width="150" />
            <el-table-column prop="area" label="面积(km²)" width="120" />
            <el-table-column prop="level" label="水位(m)" width="100" />
            <el-table-column prop="depth" label="平均深度(m)" width="120" />
            <el-table-column prop="volume" label="蓄水量(万m³)" width="140" />
            <el-table-column prop="change" label="变化率" width="100">
              <template #default="{ row }">
                <span :class="row.change > 0 ? 'change-up' : 'change-down'">
                  {{ row.change > 0 ? '+' : '' }}{{ row.change }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'normal' ? 'success' : 'warning'" size="small">
                  {{ row.status === 'normal' ? '正常' : '异常' }}
                </el-tag>
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
import { LineChart, BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { Watermelon, TrendCharts, PieChart, DataAnalysis } from '@element-plus/icons-vue'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

// 模拟数据
const totalWaterArea = ref(125.8)
const avgWaterLevel = ref(15.6)
const waterBodyCount = ref(8)
const changeRate = ref(12.5)

const waterBodyData = ref([
  { name: '青狮潭水库', area: 45.2, level: 145.8, depth: 12.5, volume: 5650, change: 8.5, status: 'normal' },
  { name: '澄碧河水库', area: 38.6, level: 128.4, depth: 18.2, volume: 7025, change: -3.2, status: 'normal' },
  { name: '龟石水库', area: 28.4, level: 132.1, depth: 22.8, volume: 6475, change: 5.6, status: 'normal' },
  { name: '达开水库', area: 13.6, level: 118.5, depth: 15.4, volume: 2096, change: -1.8, status: 'warning' }
])

// 多影像对比图配置
const multiImageOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(22, 32, 53, 0.9)',
    borderColor: '#1e3a5f',
    textStyle: { color: '#fff' }
  },
  legend: {
    data: ['影像1', '影像2', '影像3'],
    textStyle: { color: '#a8b5c8' },
    top: 10
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    axisLine: { lineStyle: { color: '#1e3a5f' } },
    axisLabel: { color: '#a8b5c8' }
  },
  yAxis: {
    type: 'value',
    name: '面积(km²)',
    nameTextStyle: { color: '#a8b5c8' },
    axisLine: { lineStyle: { color: '#1e3a5f' } },
    axisLabel: { color: '#a8b5c8' },
    splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } }
  },
  series: [
    {
      name: '影像1',
      type: 'line',
      smooth: true,
      data: [120, 122, 118, 125, 128, 125.8],
      lineStyle: { color: '#00d9ff', width: 2 }
    },
    {
      name: '影像2',
      type: 'line',
      smooth: true,
      data: [115, 118, 120, 122, 125, 123.5],
      lineStyle: { color: '#00ff9d', width: 2 }
    },
    {
      name: '影像3',
      type: 'line',
      smooth: true,
      data: [110, 112, 115, 118, 120, 119.2],
      lineStyle: { color: '#faad14', width: 2 }
    }
  ]
}))

// 水位统计图配置
const waterLevelStatOption = computed(() => ({
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
    data: ['青狮潭', '澄碧河', '龟石', '达开'],
    axisLine: { lineStyle: { color: '#1e3a5f' } },
    axisLabel: { color: '#a8b5c8' }
  },
  yAxis: {
    type: 'value',
    name: '水位(m)',
    nameTextStyle: { color: '#a8b5c8' },
    axisLine: { lineStyle: { color: '#1e3a5f' } },
    axisLabel: { color: '#a8b5c8' },
    splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } }
  },
  series: [{
    type: 'bar',
    data: [145.8, 128.4, 132.1, 118.5],
    itemStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: '#00d9ff' },
          { offset: 1, color: '#0d7377' }
        ]
      },
      borderRadius: [4, 4, 0, 0]
    }
  }]
}))
</script>

<style scoped lang="scss">
.water-analysis-page {
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

      &.blue {
        background: rgba(0, 217, 255, 0.2);
        color: #00d9ff;
      }

      &.cyan {
        background: rgba(0, 255, 157, 0.2);
        color: #00ff9d;
      }

      &.purple {
        background: rgba(168, 85, 247, 0.2);
        color: #a855f7;
      }

      &.orange {
        background: rgba(250, 173, 20, 0.2);
        color: #faad14;
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

      .change-up {
        color: #52c41a;
      }

      .change-down {
        color: #f5222d;
      }
    }
  }
}
</style>
