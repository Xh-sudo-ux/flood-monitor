# 洪水监测系统 API 接口规范

## 概述

本文档定义了洪水监测系统的后端API接口规范，支持实时数据获取、历史数据查询和系统管理功能。

## 基础信息

- **基础URL**: `https://api.flood-monitor.com/v1`
- **认证方式**: JWT Token (Bearer Token)
- **响应格式**: JSON
- **字符编码**: UTF-8
- **时区**: UTC+8 (中国标准时间)

## 接口目录

### 1. 实时内涝区域面积统计
### 2. 降雨量数据
### 3. 水库水位数据
### 4. 洪水提取与处理
### 5. 系统管理

---

## 1. 实时内涝区域面积统计接口

### 1.1 获取实时内涝区域面积统计

**接口名称**: 实时内涝区域面积统计图表数据  
**接口描述**: 获取当前所有内涝区域的实时面积统计数据

#### 请求
```
GET /api/inundation/areas/statistics
```

#### 请求头
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### 请求参数
| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| region | string | 否 | 区域筛选 | "南宁市" |
| status | string | 否 | 状态筛选 | "active" |
| limit | integer | 否 | 返回数量限制 | 50 |
| offset | integer | 否 | 分页偏移量 | 0 |

#### 成功响应 (200 OK)
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "timestamp": "2024-03-22T14:30:00+08:00",
    "total_count": 15,
    "areas": [
      {
        "id": "nanning_south_001",
        "name": "南宁市南部区域",
        "area_km2": 12.5,
        "depth_m": 1.2,
        "affected_population": 3500,
        "coordinates": {
          "type": "Polygon",
          "coordinates": [[[108.1, 22.8], [108.2, 22.7], [108.15, 22.65], [108.1, 22.8]]]
        },
        "status": "active",
        "severity": "high",
        "detected_time": "2024-03-22T08:30:00+08:00",
        "updated_time": "2024-03-22T14:25:00+08:00",
        "data_source": "satellite_sentinel1",
        "confidence": 0.92
      },
      {
        "id": "liuzhou_east_002",
        "name": "柳州市东部区域",
        "area_km2": 8.3,
        "depth_m": 0.8,
        "affected_population": 2100,
        "coordinates": {
          "type": "Polygon",
          "coordinates": [[[109.4, 24.3], [109.5, 24.2], [109.45, 24.15], [109.4, 24.3]]]
        },
        "status": "warning",
        "severity": "medium",
        "detected_time": "2024-03-22T10:15:00+08:00",
        "updated_time": "2024-03-22T14:20:00+08:00",
        "data_source": "drone_survey",
        "confidence": 0.85
      }
    ],
    "summary": {
      "total_area": 20.8,
      "total_population": 5600,
      "average_depth": 1.0,
      "active_count": 8,
      "warning_count": 5,
      "subsided_count": 2
    }
  }
}
```

#### 错误响应
```json
{
  "code": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

### 1.2 实时数据推送 (WebSocket)

**接口名称**: 实时内涝区域面积更新推送  
**接口描述**: WebSocket连接，实时推送内涝区域面积变化

#### 连接
```
ws://api.flood-monitor.com/v1/ws/inundation/updates
```

#### 认证
连接时需要在URL中传递token:
```
ws://api.flood-monitor.com/v1/ws/inundation/updates?token=<jwt_token>
```

#### 消息格式
```json
{
  "type": "area_update",
  "timestamp": "2024-03-22T14:35:00+08:00",
  "data": {
    "id": "nanning_south_001",
    "area_change": 0.5,
    "new_area": 13.0,
    "depth_change": 0.1,
    "new_depth": 1.3,
    "update_reason": "rainfall_increase"
  }
}
```

### 1.3 历史数据查询

**接口名称**: 内涝区域面积历史数据  
**接口描述**: 查询指定区域的历史面积变化数据

#### 请求
```
GET /api/inundation/areas/history
```

#### 请求参数
| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| area_id | string | 是 | 区域ID | "nanning_south_001" |
| start_time | string | 是 | 开始时间 | "2024-03-20T00:00:00+08:00" |
| end_time | string | 是 | 结束时间 | "2024-03-22T23:59:59+08:00" |
| interval | string | 否 | 时间间隔 | "1h" (1小时), "1d" (1天) |

#### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "area_id": "nanning_south_001",
    "area_name": "南宁市南部区域",
    "history": [
      {
        "timestamp": "2024-03-20T08:00:00+08:00",
        "area_km2": 5.2,
        "depth_m": 0.5,
        "affected_population": 1200
      },
      {
        "timestamp": "2024-03-20T14:00:00+08:00",
        "area_km2": 8.7,
        "depth_m": 0.9,
        "affected_population": 2100
      },
      {
        "timestamp": "2024-03-22T14:00:00+08:00",
        "area_km2": 12.5,
        "depth_m": 1.2,
        "affected_population": 3500
      }
    ],
    "statistics": {
      "max_area": 12.5,
      "min_area": 5.2,
      "avg_area": 8.8,
      "growth_rate": "140.38%"
    }
  }
}
```

---

## 2. 降雨量数据接口

### 2.1 实时降雨量数据

**接口名称**: 实时降雨量监测数据  
**接口描述**: 获取各监测站的实时降雨量数据

#### 请求
```
GET /api/rainfall/realtime
```

#### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "timestamp": "2024-03-22T14:30:00+08:00",
    "stations": [
      {
        "station_id": "GL001",
        "name": "临桂区监测站",
        "location": {
          "latitude": 25.2741,
          "longitude": 110.2704
        },
        "rainfall_1h": 0.5,
        "rainfall_3h": 1.2,
        "rainfall_6h": 2.1,
        "rainfall_12h": 3.8,
        "rainfall_24h": 6.5,
        "rainfall_today": 0.96,
        "warning_level": "normal",
        "update_time": "2024-03-22T14:25:00+08:00"
      }
    ],
    "summary": {
      "total_stations": 15,
      "warning_stations": 3,
      "danger_stations": 1,
      "max_rainfall": 12.8,
      "avg_rainfall": 3.2
    }
  }
}
```

### 2.2 降雨量历史数据

**接口名称**: 降雨量历史数据查询  
**接口描述**: 查询指定时间段和区域的降雨量历史数据

#### 请求
```
GET /api/rainfall/history
```

---

## 3. 水库水位数据接口

### 3.1 实时水库水位数据

**接口名称**: 实时水库水位监测数据  
**接口描述**: 获取各水库的实时水位数据

#### 请求
```
GET /api/reservoir/realtime
```

#### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "timestamp": "2024-03-22T14:30:00+08:00",
    "reservoirs": [
      {
        "reservoir_id": "QS001",
        "name": "青狮潭水库",
        "current_level": 222.0,
        "warning_level": 220.0,
        "danger_level": 221.0,
        "flood_level": 221.5,
        "exceed_limit": 2.0,
        "inflow": 150.5,
        "outflow": 125.3,
        "storage_capacity": 85.6,
        "status": "warning",
        "update_time": "2024-03-22T14:25:00+08:00"
      }
    ]
  }
}
```

---
## 4. 洪水提取与处理接口

洪水提取接口支持基于遥感影像的洪水区域自动提取功能，包括阈值法、机器学习方法和深度学习模型。

### 4.1 影像上传与预处理

**接口名称**: 遥感影像上传  
**接口描述**: 上传遥感影像文件进行洪水提取预处理

#### 请求
```
POST /api/flood-extraction/upload
```

#### 请求头
```http
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

#### 请求参数 (multipart/form-data)
| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| image | file | 是 | 遥感影像文件 | - |
| image_type | string | 否 | 影像类型 | "sentinel2", "landsat8", "modis" |
| region | string | 否 | 区域名称 | "南宁市" |
| acquisition_date | string | 否 | 获取日期 | "2024-03-22" |

#### 成功响应 (200 OK)
```json
{
  "code": 200,
  "message": "影像上传成功",
  "data": {
    "image_id": "img_001",
    "filename": "nanning_sentinel2_20240322.tif",
    "file_size": 5242880,
    "image_type": "sentinel2",
    "dimensions": {
      "width": 1024,
      "height": 1024,
      "bands": 13
    },
    "upload_time": "2024-03-22T14:30:00+08:00",
    "preview_url": "/api/flood-extraction/images/img_001/preview",
    "metadata": {
      "region": "南宁市",
      "acquisition_date": "2024-03-22",
      "coordinate_system": "WGS84",
      "resolution": "10m"
    }
  }
}
```

### 4.2 洪水提取处理

**接口名称**: 执行洪水提取  
**接口描述**: 根据选择的算法和参数执行洪水区域提取

#### 请求
```
POST /api/flood-extraction/process
```

#### 请求头
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### 请求体
```json
{
  "image_id": "img_001",
  "method": "threshold",
  "parameters": {
    "threshold_value": 0.5,
    "band_combination": ["B8", "B11", "B12"],
    "water_index": "NDWI",
    "morphology_operations": {
      "opening": true,
      "closing": true,
      "kernel_size": 3
    }
  },
  "output_format": "geojson"
}
```

#### 参数说明
| 参数名 | 类型 | 必填 | 描述 | 可选值 |
|--------|------|------|------|------|
| method | string | 是 | 提取方法 | "threshold", "random_forest", "deep_learning" |
| parameters | object | 是 | 算法参数 | 根据方法不同 |
| output_format | string | 否 | 输出格式 | "geojson", "shapefile", "tiff" |

#### 阈值法参数
```json
{
  "threshold_value": 0.5,
  "band_combination": ["B8", "B11", "B12"],
  "water_index": "NDWI",
  "morphology_operations": {
    "opening": true,
    "closing": true,
    "kernel_size": 3
  }
}
```

#### 随机森林参数
```json
{
  "n_estimators": 100,
  "max_depth": 10,
  "feature_bands": ["B2", "B3", "B4", "B8", "B11", "B12"],
  "training_samples": 1000
}
```

#### 成功响应 (200 OK)
```json
{
  "code": 200,
  "message": "洪水提取处理开始",
  "data": {
    "task_id": "task_001",
    "status": "processing",
    "estimated_time": 30,
    "progress_url": "/api/flood-extraction/tasks/task_001/progress"
  }
}
```

### 4.3 提取任务状态查询

**接口名称**: 查询提取任务状态  
**接口描述**: 查询洪水提取任务的执行状态和进度

#### 请求
```
GET /api/flood-extraction/tasks/{task_id}/status
```

#### 请求头
```http
Authorization: Bearer <jwt_token>
```

#### 成功响应 (200 OK)
```json
{
  "code": 200,
  "message": "任务状态查询成功",
  "data": {
    "task_id": "task_001",
    "status": "completed",
    "progress": 100,
    "start_time": "2024-03-22T14:30:00+08:00",
    "end_time": "2024-03-22T14:32:00+08:00",
    "result": {
      "extracted_area_km2": 12.5,
      "water_pixels": 125000,
      "confidence": 0.92,
      "result_url": "/api/flood-extraction/results/task_001",
      "visualization_url": "/api/flood-extraction/results/task_001/visualization",
      "download_url": "/api/flood-extraction/results/task_001/download"
    },
    "errors": []
  }
}
```

### 4.4 提取结果获取

**接口名称**: 获取洪水提取结果  
**接口描述**: 获取洪水提取的详细结果数据

#### 请求
```
GET /api/flood-extraction/results/{task_id}
```

#### 请求头
```http
Authorization: Bearer <jwt_token>
Accept: application/json
```

#### 查询参数
| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| format | string | 否 | 结果格式 | "geojson", "statistics" |

#### 成功响应 (200 OK) - GeoJSON格式
```json
{
  "code": 200,
  "message": "结果获取成功",
  "data": {
    "task_id": "task_001",
    "format": "geojson",
    "result": {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[108.1, 22.8], [108.2, 22.7], [108.15, 22.65], [108.1, 22.8]]]
          },
          "properties": {
            "area_km2": 12.5,
            "perimeter_km": 15.2,
            "confidence": 0.92,
            "water_depth": 1.2
          }
        }
      ]
    },
    "statistics": {
      "total_area_km2": 12.5,
      "largest_patch_km2": 8.3,
      "average_confidence": 0.92,
      "pixel_count": 125000,
      "water_ratio": 0.125
    }
  }
}
```

### 4.5 历史提取记录查询

**接口名称**: 查询历史提取记录  
**接口描述**: 查询用户的历史洪水提取记录

#### 请求
```
GET /api/flood-extraction/history
```

#### 请求头
```http
Authorization: Bearer <jwt_token>
```

#### 查询参数
| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| start_date | string | 否 | 开始日期 | "2024-03-01" |
| end_date | string | 否 | 结束日期 | "2024-03-22" |
| region | string | 否 | 区域筛选 | "南宁市" |
| method | string | 否 | 方法筛选 | "threshold" |
| limit | integer | 否 | 返回数量限制 | 50 |
| offset | integer | 否 | 分页偏移量 | 0 |

#### 成功响应 (200 OK)
```json
{
  "code": 200,
  "message": "历史记录查询成功",
  "data": {
    "total_count": 15,
    "history": [
      {
        "task_id": "task_001",
        "image_name": "nanning_sentinel2_20240322.tif",
        "region": "南宁市",
        "method": "threshold",
        "extracted_area_km2": 12.5,
        "processing_time": 120,
        "status": "completed",
        "create_time": "2024-03-22T14:30:00+08:00",
        "result_url": "/api/flood-extraction/results/task_001"
      }
    ]
  }
}
```

---
## 5. 系统管理接口

### 4.1 用户认证

#### 登录
```
POST /api/auth/login
```

#### 请求体
```json
{
  "username": "admin",
  "password": "password123"
}
```

#### 成功响应
```json
{
  "code": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "administrator",
      "permissions": ["read", "write", "manage"]
    }
  }
}
```

### 4.2 系统状态

#### 获取系统状态
```
GET /api/system/status
```

#### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "running",
    "version": "1.2.0",
    "uptime": "15d 8h 32m",
    "last_update": "2024-03-22T14:30:00+08:00",
    "components": {
      "database": "healthy",
      "cache": "healthy",
      "satellite_feed": "healthy",
      "sensor_network": "degraded",
      "api_gateway": "healthy"
    },
    "metrics": {
      "active_connections": 152,
      "requests_per_minute": 245,
      "data_points_collected": 1250000,
      "storage_used": "45.2GB"
    }
  }
}
```

---

## 错误码定义

| 错误码 | 描述 | 说明 |
|--------|------|------|
| 200 | 成功 | 请求成功 |
| 400 | 请求错误 | 请求参数错误 |
| 401 | 未授权 | 认证失败 |
| 403 | 禁止访问 | 权限不足 |
| 404 | 资源不存在 | 请求的资源不存在 |
| 429 | 请求过多 | 请求频率超限 |
| 500 | 服务器错误 | 服务器内部错误 |
| 503 | 服务不可用 | 服务暂时不可用 |

---

## 数据更新频率

| 数据类型 | 更新频率 | 延迟 | 数据源 |
|----------|----------|------|--------|
| 内涝区域面积 | 15分钟 | <5分钟 | 卫星遥感、无人机 |
| 降雨量数据 | 5分钟 | <1分钟 | 地面监测站 |
| 水库水位 | 1分钟 | <30秒 | 水位传感器 |
| 气象预报 | 1小时 | <10分钟 | 气象局API |

---

## 前端集成示例

### 1. 实时内涝区域面积统计图表集成

```javascript
// 前端API服务层
class FloodMonitorAPI {
  constructor(baseURL = 'https://api.flood-monitor.com/v1') {
    this.baseURL = baseURL
    this.token = localStorage.getItem('flood_monitor_token')
  }

  // 获取实时内涝区域面积数据
  async getInundationAreas(params = {}) {
    const response = await fetch(`${this.baseURL}/api/inundation/areas/statistics?${new URLSearchParams(params)}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    return response.json()
  }

  // 建立WebSocket连接
  connectWebSocket() {
    const ws = new WebSocket(`ws://api.flood-monitor.com/v1/ws/inundation/updates?token=${this.token}`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.handleRealTimeUpdate(data)
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    return ws
  }

  // 处理实时更新
  handleRealTimeUpdate(data) {
    switch (data.type) {
      case 'area_update':
        // 更新图表数据
        this.updateAreaChart(data.data)
        break
      case 'rainfall_update':
        // 更新降雨量数据
        this.updateRainfallData(data.data)
        break
      case 'reservoir_update':
        // 更新水库数据
        this.updateReservoirData(data.data)
        break
    }
  }
}

// Vue组件中使用
export default {
  data() {
    return {
      api: new FloodMonitorAPI(),
      inundationAreas: [],
      realTimeUpdates: []
    }
  },
  
  mounted() {
    this.loadInundationData()
    this.setupWebSocket()
  },
  
  methods: {
    async loadInundationData() {
      try {
        const response = await this.api.getInundationAreas({
          region: '南宁市',
          limit: 10
        })
        
        this.inundationAreas = response.data.areas
        this.updateChart()
      } catch (error) {
        console.error('Failed to load inundation data:', error)
        // 回退到模拟数据
        this.loadMockData()
      }
    },
    
    setupWebSocket() {
      this.wsConnection = this.api.connectWebSocket()
    },
    
    updateAreaChart(updateData) {
      // 更新图表逻辑
      const index = this.inundationAreas.findIndex(area => area.id === updateData.id)
      if (index !== -1) {
        this.inundationAreas[index].area_km2 = updateData.new_area
        this.inundationAreas[index].depth_m = updateData.new_depth
        this.$nextTick(() => {
          this.updateChart()
        })
      }
    }
  }
}
```

---

## 安全规范

### 1. 认证与授权
- 所有API请求必须携带有效的JWT Token
- Token有效期：24小时
- 支持Token刷新机制

### 2. 速率限制
- 普通用户：100请求/分钟
- 高级用户：500请求/分钟
- 管理员：1000请求/分钟

### 3. 数据加密
- 所有敏感数据传输使用HTTPS
- 密码使用bcrypt加密存储
- API密钥使用AES-256加密

### 4. 输入验证
- 所有输入参数必须验证
- 防止SQL注入和XSS攻击
- 文件上传限制类型和大小

---

## 部署建议

### 1. 服务器配置
- **CPU**: 4核以上
- **内存**: 16GB以上
- **存储**: SSD 500GB以上
- **带宽**: 100Mbps以上

### 2. 数据库
- **主数据库**: PostgreSQL 14+ (支持GIS扩展)
- **缓存**: Redis 6+
- **时序数据库**: InfluxDB 2.0 (用于存储监测数据)

### 3. 监控与日志
- 使用Prometheus + Grafana监控系统状态
- 使用ELK Stack收集和分析日志
- 设置报警规则（CPU > 80%, 内存 > 85%）

### 4. 高可用性
- 使用负载均衡器（Nginx/Haproxy）
- 数据库主从复制
- 多区域部署（华南、华东、华北）

---

## 版本管理

### 版本号规则
- 主版本.次版本.修订版本 (如: 1.2.3)
- 主版本：不兼容的API更改
- 次版本：向后兼容的功能性新增
- 修订版本：向后兼容的问题修正

### API版本控制
- URL路径中包含版本号：`/v1/api/...`
- 支持多个版本并行运行
- 旧版本至少维护6个月

---

## 附录

### A. 数据字段说明

#### 内涝区域状态定义
| 状态值 | 描述 | 颜色标识 |
|--------|------|----------|
| active | 活跃中 | 红色 (#f5222d) |
| warning | 预警中 | 橙色 (#fa8c16) |
| subsided | 已消退 | 绿色 (#52c41a) |

#### 严重程度定义
| 级别 | 面积范围 | 水深范围 | 响应级别 |
|------|----------|----------|----------|
| low | < 5 km² | < 0.5 m | 观察 |
| medium | 5-15 km² | 0.5-1.0 m | 预警 |
| high | 15-30 km² | 1.0-1.5 m | 响应 |
| critical | > 30 km² | > 1.5 m | 紧急响应 |

### B. 坐标系统
- 使用WGS84坐标系（EPSG:4326）
- 经度范围：-180° 到 180°
- 纬度范围：-90° 到 90°
- GeoJSON格式存储空间数据

### C. 时间格式
- ISO 8601格式：`YYYY-MM-DDTHH:mm:ss+08:00`
- 时区：中国标准时间 (UTC+8)
- 时间精度：秒级

---

**文档版本**: 1.0  
**最后更新**: 2024-03-22  
**维护者**: 洪水监测系统开发团队