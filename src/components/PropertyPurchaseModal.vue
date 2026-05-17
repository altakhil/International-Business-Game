<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content property-ticket" @click.stop>
      <div class="modal-header">
        <h2>Property for Sale</h2>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div v-if="property" class="ticket">
          <div class="ticket-header" :style="{ backgroundColor: property.color }">
            <div class="ticket-title">{{ property.name }}</div>
            <div class="ticket-type">{{ property.color }}</div>
          </div>
          
          <div class="ticket-body">
            <div class="ticket-row">
              <span class="label">Price:</span>
              <span class="value">${{ property.price }}</span>
            </div>
            
            <div class="ticket-row">
              <span class="label">Rent:</span>
              <span class="value">${{ property.rent || property.price * 0.1 }}</span>
            </div>
            
            <div class="ticket-row">
              <span class="label">House Cost:</span>
              <span class="value">${{ property.house_cost || property.price * 0.5 }}</span>
            </div>
            
            <div class="ticket-row">
              <span class="label">Hotel Cost:</span>
              <span class="value">${{ property.hotel_cost || property.price }}</span>
            </div>
            
            <div class="ticket-row">
              <span class="label">Mortgage Value:</span>
              <span class="value">${{ property.mortgage_value || property.price * 0.5 }}</span>
            </div>
          </div>
        </div>
        
        <div class="player-money">
          Your Money: ${{ formatMoney(player?.money || 0) }}
        </div>
        
        <div v-if="player && player.money < property.price" class="warning">
          ⚠️ You don't have enough money to buy this property!
        </div>
      </div>
      
      <div class="modal-footer">
        <button 
          class="btn btn-pass" 
          @click="$emit('pass')"
        >
          Pass
        </button>
        <button 
          class="btn btn-buy" 
          @click="$emit('purchase')"
          :disabled="!player || player.money < property.price"
        >
          Buy ${{ property.price }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>

import { defineProps, defineEmits } from 'vue'

/* eslint-disable */
const props = defineProps({
  property: Object,
  player: Object
})

const emit = defineEmits(['close', 'purchase', 'pass'])

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

.modal-content.property-ticket {
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
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.ticket {
  border: 3px solid #1e3a8a;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.ticket-header {
  padding: 20px;
  color: white;
  text-align: center;
}

.ticket-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.ticket-type {
  font-size: 14px;
  opacity: 0.9;
  text-transform: capitalize;
}

.ticket-body {
  padding: 20px;
  background: #f8fafc;
}

.ticket-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.ticket-row:last-child {
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

.player-money {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #10b981;
  margin-bottom: 15px;
}

.warning {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
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

.btn-pass {
  background: #e5e7eb;
  color: #374151;
}

.btn-pass:hover {
  background: #d1d5db;
}

.btn-buy {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-buy:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
}

.btn-buy:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
