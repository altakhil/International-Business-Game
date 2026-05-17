<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content chance-card" @click.stop>
      <div class="modal-header">
        <h2>Chance Card</h2>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div v-if="card" class="card">
          <div class="card-icon">🎲</div>
          <div class="card-message">{{ card.message }}</div>
          <div class="card-cost" :class="{ positive: card.cost > 0, negative: card.cost < 0 }">
            {{ card.cost > 0 ? '+' : '' }}${{ card.cost }}
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button 
          class="btn btn-primary" 
          @click="$emit('resolve')"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable */
const props = defineProps({
  card: Object
})

const emit = defineEmits(['close', 'resolve'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-content.chance-card {
  max-width: 450px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: bold;
  color: #1e3a8a;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  transition: background 0.3s;
}

.close-button:hover {
  background: #f1f5f9;
}

.modal-body {
  padding: 40px 20px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  text-align: center;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.card-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.card-message {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  line-height: 1.4;
}

.card-cost {
  font-size: 36px;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
}

.card-cost.positive {
  color: #10b981;
}

.card-cost.negative {
  color: #ef4444;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}
</style>
