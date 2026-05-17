<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Rent Paid</h2>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="rent-info">
          <div class="property-name">{{ property?.name || 'Property' }}</div>
          <div class="rent-amount">${{ formatMoney(rentAmount) }}</div>
          <div class="rent-details">
            <div class="detail-row">
              <span class="label">Paid to:</span>
              <span class="value">{{ owner?.name || 'Owner' }}</span>
            </div>
            <div v-if="ownership?.houses_count > 0" class="detail-row">
              <span class="label">Houses:</span>
              <span class="value">{{ ownership.houses_count }}</span>
            </div>
            <div v-if="ownership?.has_hotel" class="detail-row">
              <span class="label">Hotel:</span>
              <span class="value">Yes</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-ok" @click="$emit('close')">
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  property: Object,
  owner: Object,
  ownership: Object,
  rentAmount: Number
})

defineEmits(['close'])

const formatMoney = (value) => {
  return Number(value).toLocaleString()
}
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
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.rent-info {
  text-align: center;
}

.property-name {
  font-size: 20px;
  font-weight: bold;
  color: #1e3a8a;
  margin-bottom: 15px;
}

.rent-amount {
  font-size: 48px;
  font-weight: bold;
  color: #ef4444;
  margin-bottom: 20px;
}

.rent-details {
  background: #f8fafc;
  border-radius: 8px;
  padding: 15px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: bold;
  color: #64748b;
}

.value {
  font-weight: bold;
  color: #1e3a8a;
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

.btn-ok {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-ok:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}
</style>
