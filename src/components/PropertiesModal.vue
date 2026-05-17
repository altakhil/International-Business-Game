<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>All Properties</h2>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <!-- Unsold Properties -->
        <div class="section">
          <h3 class="section-title">🏠 Unsold Properties</h3>
          <div v-if="unsoldProperties.length === 0" class="empty-state">
            No unsold properties
          </div>
          <div v-else class="properties-grid">
            <div 
              v-for="property in unsoldProperties" 
              :key="property.id"
              class="property-ticket"
            >
              <div class="ticket-header" :style="{ backgroundColor: property.color || '#ccc' }">
                <div class="ticket-name">{{ property.name }}</div>
              </div>
              <div class="ticket-body">
                <div class="ticket-price">${{ property.base_price || property.price || 0 }}</div>
                <div class="ticket-type">{{ property.space_type }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Properties by Player -->
        <div v-for="player in playersWithProperties" :key="player.player_id" class="section">
          <h3 class="section-title">👤 {{ player.name }}'s Properties</h3>
          <div v-if="getPlayerProperties(player.player_id).length === 0" class="empty-state">
            No properties
          </div>
          <div v-else class="properties-grid">
            <div 
              v-for="ownership in getPlayerProperties(player.player_id)" 
              :key="ownership.ownership_id"
              class="property-ticket owned"
            >
              <div class="ticket-header" :style="{ backgroundColor: getPropertyColor(ownership.property_id) }">
                <div class="ticket-name">{{ getPropertyName(ownership.property_id) }}</div>
              </div>
              <div class="ticket-body">
                <div class="ticket-price">${{ getPropertyPrice(ownership.property_id) }}</div>
                <div class="ticket-details">
                  <span v-if="ownership.houses_count > 0">🏠 {{ ownership.houses_count }}</span>
                  <span v-if="ownership.has_hotel">🏨 Hotel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable */
import { computed } from 'vue'
import { usePropertiesStore } from '@/stores/properties'
import { useGameStore } from '@/stores/game'

const emit = defineEmits(['close'])

const propertiesStore = usePropertiesStore()
const gameStore = useGameStore()

const unsoldProperties = computed(() => {
  const ownedPropertyIds = gameStore.propertyOwnership.map(o => o.property_id)
  return propertiesStore.properties.filter(p => 
    p.space_type === 'property' && !ownedPropertyIds.includes(p.id)
  )
})

const playersWithProperties = computed(() => {
  const playerIds = new Set(gameStore.propertyOwnership.map(o => o.player_id))
  return gameStore.players.filter(p => playerIds.has(p.player_id))
})

const getPlayerProperties = (playerId) => {
  return gameStore.propertyOwnership.filter(o => o.player_id === playerId)
}

const getPropertyColor = (propertyId) => {
  const property = propertiesStore.properties.find(p => p.id === propertyId)
  return property?.color || '#ccc'
}

const getPropertyName = (propertyId) => {
  const property = propertiesStore.properties.find(p => p.id === propertyId)
  return property?.name || 'Unknown'
}

const getPropertyPrice = (propertyId) => {
  const property = propertiesStore.properties.find(p => p.id === propertyId)
  return (property?.base_price || property?.price || 0).toLocaleString()
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
  max-width: 900px;
  max-height: 85vh;
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

.section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #1e3a8a;
  margin-bottom: 15px;
}

.empty-state {
  text-align: center;
  color: #64748b;
  padding: 20px;
  font-style: italic;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
}

.property-ticket {
  border: 2px solid #1e3a8a;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.property-ticket:hover {
  transform: translateY(-2px);
}

.property-ticket.owned {
  border-color: #10b981;
}

.ticket-header {
  padding: 12px;
  color: white;
  text-align: center;
}

.ticket-name {
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
}

.ticket-body {
  padding: 12px;
  background: #f8fafc;
  text-align: center;
}

.ticket-price {
  font-size: 18px;
  font-weight: bold;
  color: #10b981;
  margin-bottom: 5px;
}

.ticket-type {
  font-size: 12px;
  color: #64748b;
  text-transform: capitalize;
}

.ticket-details {
  margin-top: 8px;
  font-size: 12px;
  color: #1e3a8a;
}

.ticket-details span {
  margin: 0 5px;
}
</style>
