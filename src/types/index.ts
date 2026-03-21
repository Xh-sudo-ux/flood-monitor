// 雨量监测站点
export interface RainfallStation {
  id: number
  name: string
  lat: number
  lng: number
  hourlyRainfall: number
  dailyRainfall: number
  status: 'normal' | 'warning' | 'danger'
  updateTime: Date
}

// 水位监测站点
export interface WaterLevelStation {
  id: number
  name: string
  currentLevel: number
  warningLevel: number
  guaranteeLevel: number
  dangerLevel: number
  floodLevel: number
  status: 'normal' | 'warning' | 'danger'
}

// 河流流量
export interface RiverFlow {
  id: number
  name: string
  flow: number
  velocity: number
  waterLevel: number
}

// 淹没区域
export interface InundationArea {
  id: number
  name: string
  area: number
  depth: number
  affectedPopulation: number
  startTime: string
  status: 'active' | 'warning' | 'resolved'
}

// 水库信息
export interface Reservoir {
  id: number
  name: string
  currentLevel: number
  capacity: number
  status: 'normal' | 'warning' | 'danger'
  warningLevel: string
}

// 预警信息
export interface AlertInfo {
  id: number
  type: 'water' | 'rain' | 'flow' | 'inundation'
  title: string
  content: string
  level: 'high' | 'medium' | 'low'
  time: string
}

// 统计数据
export interface Statistics {
  totalStations: number
  warningStations: number
  dangerStations: number
  totalRainfall: number
  avgWaterLevel: number
  totalInundationArea: number
  affectedPopulation: number
}
