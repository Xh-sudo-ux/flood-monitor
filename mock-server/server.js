const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3001

// 中间件
app.use(cors())
app.use(express.json())

// 读取数据库文件
const dbPath = path.join(__dirname, 'db.json')
let db = {}

try {
  const dbContent = fs.readFileSync(dbPath, 'utf8')
  db = JSON.parse(dbContent)
  console.log('数据库文件加载成功')
} catch (error) {
  console.error('加载数据库文件失败:', error)
  process.exit(1)
}

// 1. 实时内涝区域面积统计接口
app.get('/api/v1/inundation/areas/statistics', (req, res) => {
  const { region, status, limit = 50, offset = 0 } = req.query
  
  let areas = [...db.inundation_areas]
  
  // 区域筛选
  if (region) {
    areas = areas.filter(area => area.name.includes(region))
  }
  
  // 状态筛选
  if (status) {
    areas = areas.filter(area => area.status === status)
  }
  
  // 分页
  const paginatedAreas = areas.slice(offset, offset + limit)
  
  // 计算统计信息
  const summary = {
    total_area: areas.reduce((sum, area) => sum + area.area_km2, 0),
    total_population: areas.reduce((sum, area) => sum + area.affected_population, 0),
    average_depth: areas.length > 0 
      ? areas.reduce((sum, area) => sum + area.depth_m, 0) / areas.length 
      : 0,
    active_count: areas.filter(area => area.status === 'active').length,
    warning_count: areas.filter(area => area.status === 'warning').length,
    subsided_count: areas.filter(area => area.status === 'subsided').length
  }
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      timestamp: new Date().toISOString(),
      total_count: areas.length,
      areas: paginatedAreas,
      summary
    }
  })
})

// 2. 实时降雨量数据接口
app.get('/api/v1/rainfall/realtime', (req, res) => {
  const stations = db.rainfall_stations
  
  const summary = {
    total_stations: stations.length,
    warning_stations: stations.filter(s => s.warning_level === 'warning').length,
    danger_stations: stations.filter(s => s.warning_level === 'danger').length,
    max_rainfall: Math.max(...stations.map(s => s.rainfall_today)),
    avg_rainfall: stations.reduce((sum, s) => sum + s.rainfall_today, 0) / stations.length
  }
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      timestamp: new Date().toISOString(),
      stations,
      summary
    }
  })
})

// 3. 实时水库水位数据接口
app.get('/api/v1/reservoir/realtime', (req, res) => {
  const reservoirs = db.reservoirs
  
  const summary = {
    total_reservoirs: reservoirs.length,
    warning_reservoirs: reservoirs.filter(r => r.current_level >= r.warning_level).length,
    danger_reservoirs: reservoirs.filter(r => r.current_level >= r.danger_level).length,
    avg_level: reservoirs.reduce((sum, r) => sum + r.current_level, 0) / reservoirs.length,
    total_capacity: reservoirs.reduce((sum, r) => sum + r.capacity_percentage, 0) / reservoirs.length
  }
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      timestamp: new Date().toISOString(),
      reservoirs,
      summary
    }
  })
})

// 4. 登录接口（模拟）
app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body
  
  // 模拟验证
  if (username === 'admin' && password === 'admin123') {
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3MTExMjM0MDB9.mock-jwt-token-for-testing',
        user: {
          id: 'admin',
          username: 'admin',
          role: 'admin',
          name: '系统管理员'
        }
      }
    })
  } else {
    res.status(401).json({
      code: 401,
      message: '用户名或密码错误'
    })
  }
})

// 5. 洪水提取接口

// 5.1 影像上传（模拟）
app.post('/api/v1/flood-extraction/upload', (req, res) => {
  // 模拟文件上传处理
  const imageId = `img_${Date.now()}`
  const newImage = {
    image_id: imageId,
    filename: `uploaded_image_${Date.now()}.tif`,
    file_size: Math.floor(Math.random() * 10000000) + 1000000,
    image_type: req.body.image_type || 'sentinel2',
    dimensions: {
      width: 1024,
      height: 1024,
      bands: 13
    },
    upload_time: new Date().toISOString(),
    metadata: {
      region: req.body.region || '未知区域',
      acquisition_date: req.body.acquisition_date || new Date().toISOString().split('T')[0],
      coordinate_system: 'WGS84',
      resolution: '10m'
    },
    uploaded_by: 'admin'
  }
  
  db.flood_extraction_images.push(newImage)
  
  res.json({
    code: 200,
    message: '影像上传成功',
    data: {
      ...newImage,
      preview_url: `/api/v1/flood-extraction/images/${imageId}/preview`
    }
  })
})

// 5.2 执行洪水提取
app.post('/api/v1/flood-extraction/process', (req, res) => {
  const { image_id, method, parameters, output_format } = req.body
  
  if (!image_id || !method) {
    return res.status(400).json({
      code: 400,
      message: '缺少必要参数'
    })
  }
  
  const taskId = `task_${Date.now()}`
  const newTask = {
    task_id: taskId,
    image_id,
    method,
    parameters: parameters || {},
    status: 'processing',
    progress: 0,
    start_time: new Date().toISOString(),
    end_time: null,
    result: null,
    created_by: 'admin'
  }
  
  db.flood_extraction_tasks.push(newTask)
  
  // 模拟处理进度
  setTimeout(() => {
    const taskIndex = db.flood_extraction_tasks.findIndex(t => t.task_id === taskId)
    if (taskIndex !== -1) {
      db.flood_extraction_tasks[taskIndex].progress = 50
    }
  }, 1000)
  
  setTimeout(() => {
    const taskIndex = db.flood_extraction_tasks.findIndex(t => t.task_id === taskId)
    if (taskIndex !== -1) {
      db.flood_extraction_tasks[taskIndex].status = 'completed'
      db.flood_extraction_tasks[taskIndex].progress = 100
      db.flood_extraction_tasks[taskIndex].end_time = new Date().toISOString()
      
      // 创建结果
      const result = {
        extracted_area_km2: 12.5 + Math.random() * 5,
        water_pixels: 125000,
        confidence: 0.85 + Math.random() * 0.15,
        statistics: {
          total_area_km2: 12.5 + Math.random() * 5,
          largest_patch_km2: 8.3 + Math.random() * 3,
          average_confidence: 0.85 + Math.random() * 0.15,
          pixel_count: 125000,
          water_ratio: 0.125
        }
      }
      
      db.flood_extraction_tasks[taskIndex].result = result
      
      // 保存结果数据
      db.flood_extraction_results.push({
        task_id: taskId,
        result_data: db.flood_extraction_results[0].result_data // 使用模板数据
      })
    }
  }, 3000)
  
  res.json({
    code: 200,
    message: '洪水提取处理开始',
    data: {
      task_id: taskId,
      status: 'processing',
      estimated_time: 30,
      progress_url: `/api/v1/flood-extraction/tasks/${taskId}/status`
    }
  })
})

// 5.3 查询任务状态
app.get('/api/v1/flood-extraction/tasks/:taskId/status', (req, res) => {
  const { taskId } = req.params
  const task = db.flood_extraction_tasks.find(t => t.task_id === taskId)
  
  if (!task) {
    return res.status(404).json({
      code: 404,
      message: '任务不存在'
    })
  }
  
  res.json({
    code: 200,
    message: '任务状态查询成功',
    data: {
      ...task,
      result_url: `/api/v1/flood-extraction/results/${taskId}`,
      visualization_url: `/api/v1/flood-extraction/results/${taskId}/visualization`,
      download_url: `/api/v1/flood-extraction/results/${taskId}/download`
    }
  })
})

// 5.4 获取提取结果
app.get('/api/v1/flood-extraction/results/:taskId', (req, res) => {
  const { taskId } = req.params
  const { format = 'geojson' } = req.query
  
  const task = db.flood_extraction_tasks.find(t => t.task_id === taskId)
  const result = db.flood_extraction_results.find(r => r.task_id === taskId)
  
  if (!task || !result) {
    return res.status(404).json({
      code: 404,
      message: '结果不存在'
    })
  }
  
  if (format === 'statistics') {
    res.json({
      code: 200,
      message: '结果获取成功',
      data: {
        task_id: taskId,
        format: 'statistics',
        statistics: task.result?.statistics || {}
      }
    })
  } else {
    res.json({
      code: 200,
      message: '结果获取成功',
      data: {
        task_id: taskId,
        format: 'geojson',
        result: result.result_data,
        statistics: task.result?.statistics || {}
      }
    })
  }
})

// 5.5 查询历史记录
app.get('/api/v1/flood-extraction/history', (req, res) => {
  const {
    start_date,
    end_date,
    region,
    method,
    limit = 50,
    offset = 0
  } = req.query
  
  let history = db.flood_extraction_tasks.map(task => {
    const image = db.flood_extraction_images.find(img => img.image_id === task.image_id)
    return {
      task_id: task.task_id,
      image_name: image?.filename || '未知影像',
      region: image?.metadata?.region || '未知区域',
      method: task.method,
      extracted_area_km2: task.result?.extracted_area_km2 || 0,
      processing_time: task.end_time && task.start_time 
        ? (new Date(task.end_time) - new Date(task.start_time)) / 1000
        : 0,
      status: task.status,
      create_time: task.start_time,
      result_url: `/api/v1/flood-extraction/results/${task.task_id}`
    }
  })
  
  // 筛选
  if (start_date) {
    history = history.filter(h => new Date(h.create_time) >= new Date(start_date))
  }
  if (end_date) {
    history = history.filter(h => new Date(h.create_time) <= new Date(end_date))
  }
  if (region) {
    history = history.filter(h => h.region.includes(region))
  }
  if (method) {
    history = history.filter(h => h.method === method)
  }
  
  // 分页
  const paginatedHistory = history.slice(offset, offset + limit)
  
  res.json({
    code: 200,
    message: '历史记录查询成功',
    data: {
      total_count: history.length,
      history: paginatedHistory
    }
  })
})

// 6. 健康检查接口
app.get('/api/v1/health', (req, res) => {
  res.json({
    code: 200,
    message: '服务运行正常',
    data: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime()
    }
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`洪水监测系统 Mock API 服务器运行在 http://localhost:${PORT}`)
  console.log('可用接口:')
  console.log(`  GET  /api/v1/inundation/areas/statistics - 实时内涝区域面积统计`)
  console.log(`  GET  /api/v1/rainfall/realtime - 实时降雨量数据`)
  console.log(`  GET  /api/v1/reservoir/realtime - 实时水库水位数据`)
  console.log(`  POST /api/v1/flood-extraction/upload - 影像上传`)
  console.log(`  POST /api/v1/flood-extraction/process - 执行洪水提取`)
  console.log(`  GET  /api/v1/flood-extraction/tasks/:taskId/status - 查询任务状态`)
  console.log(`  GET  /api/v1/flood-extraction/results/:taskId - 获取提取结果`)
  console.log(`  GET  /api/v1/flood-extraction/history - 查询历史记录`)
  console.log(`  POST /api/v1/auth/login - 用户登录`)
  console.log(`  GET  /api/v1/health - 健康检查`)
})