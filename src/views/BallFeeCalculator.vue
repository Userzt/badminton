<template>
  <div class="ball-fee-calculator">
    <a-card class="mobile-card">
      <div class="page-title">球费计算</div>
      <div class="page-subtitle">计算球场费用和球费分摊</div>
    </a-card>

    <!-- 费用输入区域 -->
    <a-card class="mobile-card input-section">
      <div class="section-title">
        <DollarOutlined />
        <span>费用输入</span>
      </div>

      <!-- 球场费用 -->
      <div class="input-item">
        <div class="input-label">球场费用</div>
        <a-input-number
          v-model:value="courtFee"
          :min="0.01"
          :precision="2"
          size="large"
          placeholder="请输入球场费用"
          style="width: 100%"
        >
          <template #addonAfter>元</template>
        </a-input-number>
      </div>

      <!-- 球的价格和数量列表 -->
      <div class="input-item">
        <div class="input-label">
          <span>球的价格和数量</span>
          <span class="label-hint">（一桶12个）</span>
        </div>
        
        <div class="ball-price-list">
          <div 
            v-for="(ball, index) in ballPrices" 
            :key="index"
            class="ball-price-item"
          >
            <div class="ball-input-group">
              <div class="ball-input-row">
                <span class="ball-label">第{{ index + 1 }}种球</span>
                <a-button 
                  v-if="ballPrices.length > 1"
                  danger 
                  type="text"
                  size="small"
                  @click="removeBallPrice(index)"
                >
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                </a-button>
              </div>
              
              <div class="ball-inputs">
                <a-input-number
                  v-model:value="ball.price"
                  :min="0.01"
                  :precision="2"
                  size="large"
                  placeholder="单价"
                  style="flex: 1"
                >
                  <template #addonAfter>元/桶</template>
                </a-input-number>
                
                <a-input-number
                  v-model:value="ball.quantity"
                  :min="1"
                  :precision="0"
                  size="large"
                  placeholder="数量"
                  style="flex: 1"
                >
                  <template #addonAfter>个</template>
                </a-input-number>
              </div>
              
              <div class="ball-subtotal" v-if="ball.price !== null && ball.price > 0 && ball.quantity !== null && ball.quantity > 0">
                小计: ¥{{ getBallCost(ball.price, ball.quantity) }}
              </div>
            </div>
          </div>
        </div>

        <a-button 
          type="dashed" 
          block 
          @click="addBallPrice"
          style="margin-top: 12px"
        >
          <template #icon>
            <PlusOutlined />
          </template>
          添加其他价格的球
        </a-button>
      </div>

      <!-- 计算按钮 -->
      <a-button 
        type="primary" 
        size="large" 
        block
        @click="calculate"
        :disabled="!canCalculate"
        style="margin-top: 24px"
      >
        <template #icon>
          <CalculatorOutlined />
        </template>
        计算费用
      </a-button>
    </a-card>

    <!-- 计算结果 -->
    <a-card 
      v-if="showResult" 
      class="mobile-card result-section"
    >
      <div class="section-title">
        <CheckCircleOutlined style="color: #52c41a" />
        <span>计算结果</span>
      </div>

      <!-- 费用明细 -->
      <div class="fee-details">
        <div class="detail-row">
          <span class="detail-label">球场费用</span>
          <span class="detail-value">¥{{ courtFee }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">球费总计</span>
          <span class="detail-value">¥{{ totalBallFee }}</span>
        </div>
        <div class="detail-row total">
          <span class="detail-label">总费用</span>
          <span class="detail-value highlight">¥{{ totalFee }}</span>
        </div>
      </div>

      <a-divider />

      <!-- 支付信息 -->
      <div class="payment-info">
        <div class="payment-card big-brother">
          <div class="payment-header">
            <CrownOutlined class="crown-icon" />
            <span class="payment-title">大哥支付给33</span>
          </div>
          <div class="payment-amount">
            <span class="currency">¥</span>
            <span class="amount">{{ bigBrotherPayTo33 }}</span>
          </div>
          <div class="payment-detail">
            球费 ¥{{ totalBallFee }} - 大哥应付 ¥{{ perPersonFee }}
          </div>
        </div>

        <div class="payment-card others">
          <div class="payment-header">
            <TeamOutlined class="team-icon" />
            <span class="payment-title">其他4人每人支付给大哥</span>
          </div>
          <div class="payment-amount">
            <span class="currency">¥</span>
            <span class="amount">{{ othersPay }}</span>
          </div>
          <div class="payment-detail">
            总费用 ¥{{ totalFee }} ÷ 6人
          </div>
        </div>
      </div>

      <!-- 球费明细 -->
      <a-divider />
      <div class="ball-fee-breakdown">
        <div class="breakdown-title">球费明细</div>
        <div 
          v-for="(ball, index) in ballPrices.filter(b => b.price !== null && b.price > 0 && b.quantity !== null && b.quantity > 0)" 
          :key="index"
          class="breakdown-item"
        >
          <div class="breakdown-row">
            <span class="breakdown-label">第{{ index + 1 }}种球</span>
            <span class="breakdown-value">¥{{ getBallCost(ball.price, ball.quantity) }}</span>
          </div>
          <div class="breakdown-detail">
            ¥{{ ball.price }}/桶 ÷ 12 × {{ ball.quantity }}个
          </div>
        </div>
        <div class="breakdown-item total-balls">
          <div class="breakdown-row">
            <span class="breakdown-label">球总数</span>
            <span class="breakdown-value">{{ totalBalls }}个</span>
          </div>
        </div>
      </div>

      <!-- 重新计算按钮 -->
      <a-button 
        block 
        @click="reset"
        style="margin-top: 24px"
      >
        重新计算
      </a-button>
    </a-card>

    <!-- 说明卡片 -->
    <a-card class="mobile-card info-section">
      <div class="section-title">
        <InfoCircleOutlined />
        <span>计算说明</span>
      </div>
      <div class="info-content">
        <p>• 大哥订场并垫付球场费用</p>
        <p>• 球费由33出</p>
        <p>• 6人平摊总费用，每人应付向上取整到整数</p>
        <p>• 其他4人每人转账给大哥</p>
        <p>• 大哥转账给33（球费 - 大哥应付的份额）</p>
        <p>• 一桶球包含12个羽毛球，单价除不尽时向上取整</p>
      </div>
    </a-card>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { 
  DollarOutlined, 
  PlusOutlined, 
  DeleteOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  TeamOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue'

export default {
  name: 'BallFeeCalculator',
  components: {
    DollarOutlined,
    PlusOutlined,
    DeleteOutlined,
    CalculatorOutlined,
    CheckCircleOutlined,
    CrownOutlined,
    TeamOutlined,
    InfoCircleOutlined
  },
  setup() {
    const courtFee = ref(null)
    const ballPrices = ref([{ price: null, quantity: null }])
    const showResult = ref(false)

    // 计算某种球的总费用：先算单价，再乘个数
    // 单价如果能除尽就保留原值，无限循环小数才向上取整
    const getBallCost = (pricePerBucket, ballCount) => {
      const pricePerBall = pricePerBucket / 12
      // 检查单价是否能除尽（保留2位小数精度检查）
      const rounded = Math.round(pricePerBall * 100) / 100
      let finalPricePerBall
      if (Math.abs(pricePerBall - rounded) < 0.0001) {
        // 能除尽，使用原值
        finalPricePerBall = rounded
      } else {
        // 无限循环小数，向上取整
        finalPricePerBall = Math.ceil(pricePerBall)
      }
      // 单价 × 个数
      return finalPricePerBall * ballCount
    }

    const canCalculate = computed(() => {
      const hasCourtFee = courtFee.value !== null && courtFee.value > 0
      const hasBallFee = ballPrices.value.some(b => 
        b.price !== null && b.price > 0 && 
        b.quantity !== null && b.quantity > 0
      )
      return hasCourtFee || hasBallFee
    })

    const totalBallFee = computed(() => {
      return ballPrices.value.reduce((sum, ball) => {
        if (ball.price !== null && ball.price > 0 && 
            ball.quantity !== null && ball.quantity > 0) {
          return sum + getBallCost(ball.price, ball.quantity)
        }
        return sum
      }, 0)
    })

    const totalBalls = computed(() => {
      return ballPrices.value.reduce((sum, ball) => {
        if (ball.quantity !== null && ball.quantity > 0) {
          return sum + ball.quantity
        }
        return sum
      }, 0)
    })

    const totalFee = computed(() => {
      const court = courtFee.value !== null && courtFee.value > 0 ? courtFee.value : 0
      return court + totalBallFee.value
    })

    // 每人应付金额：总费用 / 6，向上取整到整数
    const perPersonFee = computed(() => {
      const perPerson = totalFee.value / 6
      return Math.ceil(perPerson)
    })

    // 大哥支付给33：球费 - 大哥应付（因为大哥也要承担1/6）
    const bigBrotherPayTo33 = computed(() => {
      return totalBallFee.value - perPersonFee.value
    })

    // 其他4人每人支付给大哥
    const othersPay = computed(() => {
      return perPersonFee.value
    })

    const addBallPrice = () => {
      ballPrices.value.push({ price: null, quantity: null })
    }

    const removeBallPrice = (index) => {
      if (ballPrices.value.length > 1) {
        ballPrices.value.splice(index, 1)
      }
    }

    const calculate = () => {
      // 验证球场费用
      if (courtFee.value !== null && courtFee.value <= 0) {
        message.warning('球场费用必须大于0')
        return
      }

      // 验证球的价格和数量
      for (let i = 0; i < ballPrices.value.length; i++) {
        const ball = ballPrices.value[i]
        
        // 如果填写了价格或数量，需要验证
        if (ball.price !== null || ball.quantity !== null) {
          if (ball.price === null || ball.price <= 0) {
            message.warning(`第${i + 1}种球的价格必须大于0`)
            return
          }
          if (ball.quantity === null || ball.quantity <= 0 || !Number.isInteger(ball.quantity)) {
            message.warning(`第${i + 1}种球的数量必须是正整数`)
            return
          }
        }
      }

      if (!canCalculate.value) {
        message.warning('请至少输入球场费用或球的价格和数量')
        return
      }

      showResult.value = true
      message.success('计算完成！')
      
      // 滚动到结果区域
      setTimeout(() => {
        const resultSection = document.querySelector('.result-section')
        if (resultSection) {
          resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }

    const reset = () => {
      showResult.value = false
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return {
      courtFee,
      ballPrices,
      showResult,
      canCalculate,
      totalBallFee,
      totalBalls,
      totalFee,
      perPersonFee,
      bigBrotherPayTo33,
      othersPay,
      getBallCost,
      addBallPrice,
      removeBallPrice,
      calculate,
      reset
    }
  }
}
</script>

<style scoped>
.ball-fee-calculator {
  padding: 12px;
  padding-bottom: 80px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 14px;
  color: #666;
}

.mobile-card {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.section-title .anticon {
  font-size: 18px;
}

.input-section {
  background: white;
}

.input-item {
  margin-bottom: 20px;
}

.input-item:last-child {
  margin-bottom: 0;
}

.input-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.label-hint {
  font-size: 12px;
  opacity: 0.8;
  margin-left: 4px;
}

.ball-price-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ball-price-item {
  background: #f6f8fa;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e8e8e8;
}

.ball-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ball-input-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ball-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.ball-inputs {
  display: flex;
  gap: 8px;
}

.ball-subtotal {
  font-size: 12px;
  color: #1890ff;
  text-align: right;
  font-weight: 500;
}

.result-section {
  background: white;
}

.fee-details {
  background: #f6f8fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e8e8e8;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
}

.detail-row.total {
  border-top: 2px solid #d9d9d9;
  margin-top: 8px;
  padding-top: 12px;
  font-size: 16px;
  font-weight: bold;
}

.detail-label {
  color: #666;
}

.detail-value {
  font-weight: 600;
  color: #333;
}

.detail-value.highlight {
  font-size: 20px;
  color: #1890ff;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.payment-card {
  background: #f6f8fa;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid #e8e8e8;
}

.payment-card.big-brother {
  background: #fff7e6;
  border-color: #ffd591;
}

.payment-card.others {
  background: #e6f7ff;
  border-color: #91d5ff;
}

.payment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.crown-icon {
  font-size: 20px;
  color: #fa8c16;
}

.team-icon {
  font-size: 20px;
  color: #1890ff;
}

.payment-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.payment-amount {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
}

.currency {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-right: 4px;
}

.amount {
  font-size: 32px;
  font-weight: bold;
  color: #1890ff;
}

.payment-detail {
  font-size: 12px;
  color: #666;
}

.ball-fee-breakdown {
  background: #f6f8fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e8e8e8;
}

.breakdown-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.breakdown-item {
  padding: 8px 0;
  font-size: 13px;
  color: #333;
  border-bottom: 1px solid #e8e8e8;
}

.breakdown-item:last-child {
  border-bottom: none;
}

.breakdown-item.total-balls {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 2px solid #d9d9d9;
  border-bottom: none;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.breakdown-label {
  font-weight: 500;
}

.breakdown-value {
  font-weight: 600;
}

.breakdown-detail {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.total-balls .breakdown-row {
  margin-bottom: 0;
}

.total-balls .breakdown-label,
.total-balls .breakdown-value {
  font-size: 14px;
  font-weight: bold;
}

.info-section {
  background: #f6f8fa;
}

.info-content {
  font-size: 13px;
  line-height: 1.8;
  color: #666;
}

.info-content p {
  margin: 0;
  padding: 4px 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .payment-amount .amount {
    font-size: 28px;
  }
}
</style>
