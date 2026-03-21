<template>
  <div class="flood-extraction-page">
    <el-row :gutter="16">
      <el-col :xs="24" :lg="8">
        <div class="control-panel">
          <div class="panel-header">
            <span class="panel-title">洪水提取参数</span>
          </div>
          <el-form :model="extractionParams" label-position="top">
            <el-form-item label="阈值方法">
              <el-select v-model="extractionParams.method" style="width: 100%">
                <el-option label="阈值法提取" value="threshold" />
                <el-option label="随机森林提取" value="randomForest" />
                <el-option label="模型训练" value="model" />
              </el-select>
            </el-form-item>
            <el-form-item label="阈值设置">
              <el-slider v-model="extractionParams.threshold" :max="100" show-input />
            </el-form-item>
            <el-form-item label="影像选择">
              <el-upload
                drag
                action="#"
                :auto-upload="false"
                class="upload-area"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  拖拽文件到此处或 <em>点击上传</em>
                </div>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="startExtraction" :loading="extracting">
                开始提取
              </el-button>
              <el-button @click="resetParams">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
      <el-col :xs="24" :lg="16">
        <div class="result-panel">
          <div class="panel-header">
            <span class="panel-title">提取结果</span>
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button label="original">原始影像</el-radio-button>
              <el-radio-button label="result">提取结果</el-radio-button>
              <el-radio-button label="compare">对比视图</el-radio-button>
            </el-radio-group>
          </div>
          <div class="result-content">
            <div class="mock-result">
              <div class="result-placeholder">
                <el-icon size="64" color="#1e3a5f"><Picture /></el-icon>
                <p>请选择参数并点击"开始提取"查看结果</p>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { UploadFilled, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const extracting = ref(false)
const viewMode = ref('original')

const extractionParams = reactive({
  method: 'threshold',
  threshold: 50,
  image: null
})

const startExtraction = () => {
  extracting.value = true
  setTimeout(() => {
    extracting.value = false
    ElMessage.success('提取完成')
  }, 2000)
}

const resetParams = () => {
  extractionParams.method = 'threshold'
  extractionParams.threshold = 50
  extractionParams.image = null
}
</script>

<style scoped lang="scss">
.flood-extraction-page {
  .control-panel,
  .result-panel {
    background: rgba(22, 32, 53, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    height: calc(100vh - 140px);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

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

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
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

    &::placeholder {
      color: #6b7280;
    }
  }

  .upload-area {
    :deep(.el-upload-dragger) {
      background: rgba(255, 255, 255, 0.05);
      border: 2px dashed rgba(255, 255, 255, 0.2);

      &:hover {
        border-color: #00d9ff;
      }
    }

    :deep(.el-upload__text) {
      color: #a8b5c8;

      em {
        color: #00d9ff;
      }
    }
  }

  .result-content {
    height: calc(100% - 60px);

    .mock-result {
      width: 100%;
      height: 100%;
      background: rgba(30, 58, 95, 0.3);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;

      .result-placeholder {
        text-align: center;

        p {
          margin-top: 16px;
          color: #a8b5c8;
        }
      }
    }
  }
}
</style>
