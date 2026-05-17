<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Mortgage Property</h2>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <p class="instructions">Select a property to mortgage:</p>
        
        <div v-if="ownedProperties.length === 0" class="empty-state">
          <p>You don't own any properties to mortgage.</p>
        </div>
        
        <div v-else class="properties-list">
          <div 
            v-for="ownership in ownedProperties" 
            :key="ownership.ownership_id"
            class="property-item"
            :class="{ 
              selected: selectedProperty === ownership.ownership_id,
              disabled: ownership.is_mortgaged || ownership.houses_count > 0 || ownership.has_hotel
            }"
            @click="!ownership.is_mortgaged && ownership.houses_count === 0 && !ownership.has_hotel && (selectedProperty = ownership.ownership_id)"
          >
            <div class="property-info">
              <div class="property-name">{{ getPropertyName(ownership.property_id) }}</div>
              <div class="property-details">
                <span v-if="ownership.houses_count > 0" class="houses">
                  {{ ownership.houses_count }} house(s)
                </span>
                <span v-if="ownership.has_hotel" class="hotel">Hotel</span>
                <span v-if="ownership.is_mortgaged" class="mortgaged">Already Mortgaged</span>
              </div>
              <div class="mortgage-value">
                Mortgage Value: ${{ getMortgageValue(ownership.property_id) }}
              </div>
            </div>
            <div class="check-icon" v-if="selectedProperty === ownership.ownership_id">✓</div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button 
          class="btn btn-secondary" 
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button 
          class="btn btn-primary" 
          @click="handleMortgage"
          :disabled="!selectedProperty"
        >
          Mortgage
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable */
import { ref } from 'vue'
import { useBoardSpacesStore } from '@/stores/boardSpaces'

const props = defineProps({
  ownedProperties: Array
})

const emit = defineEmits(['close', 'mortgage'])

const boardSpacesStore = useBoardSpacesStore()
const { boardSpaces } = boardSpacesStore

const selectedProperty = ref(null)

const getPropertyName = (propertyId) => {
  const property = boardSpaces.value.find(s => s.id === propertyId)
  return property ? property.name : 'Unknown Property'
}

const getMortgageValue = (propertyId) => {
  const property = boardSpaces.value.find(s => s.id === propertyId)
  if (!property) return 0
  return Math.floor((property.mortgage_value || property.price * 0.5)).toLocaleString()
}

const handleMortgage = () => {
  if (selectedProperty.value) {
    emit('mortgage', selectedProperty.value)
  }
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
  max-width: 500px;
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

.instructions {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

.properties-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.property-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.property-item:hover:not(.disabled) {
  background: #f1f5f9;
}

.property-item.selected {
  border-color: #667eea;
  background: #eef2ff;
}

.property-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.property-info {
  flex: 1;
}

.property-name {
  font-weight: bold;
  color: #1e3a8a;
  margin-bottom: 5px;
}

.property-details {
  display: flex;
  gap: 8px;
  font-size: 12px;
  margin-bottom: 5px;
}

.houses {
  background: #10b981;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
}

.hotel {
  background: #f59e0b;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
}

.mortgaged {
  background: #ef4444;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
}

.mortgage-value {
  font-size: 14px;
  font-weight: bold;
  color: #10b981;
}

.check-icon {
  width: 30px;
  height: 30px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
