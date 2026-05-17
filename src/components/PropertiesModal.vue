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
            <PropertyTicket 
              v-for="property in unsoldProperties" 
              :key="property.property_id"
              :property="property"
            />
          </div>
        </div>

        <!-- Properties by Player -->
        <div v-for="player in playersWithProperties" :key="player.player_id" class="section">
          <h3 class="section-title">👤 {{ player.name }}'s Properties</h3>
          <div v-if="getPlayerProperties(player.player_id).length === 0" class="empty-state">
            No properties
          </div>
          <div v-else class="properties-grid">
            <PropertyTicket 
              v-for="ownership in getPlayerProperties(player.player_id)" 
              :key="ownership.ownership_id"
              :property="getPropertyDetails(ownership.property_id)"
            />
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
import PropertyTicket from '@/components/PropertyTicket.vue'

const emit = defineEmits(['close'])

const propertiesStore = usePropertiesStore()
const gameStore = useGameStore()

const unsoldProperties = computed(() => {
  const ownedPropertyIds = new Set(gameStore.propertyOwnership.map(o => o.property_id))
  return propertiesStore.properties.filter(p => 
    !ownedPropertyIds.has(p.property_id)
  )
})

const playersWithProperties = computed(() => {
  const playerIds = new Set(gameStore.propertyOwnership.map(o => o.player_id))
  return gameStore.players.filter(p => playerIds.has(p.player_id))
})

const getPlayerProperties = (playerId) => {
  const properties = gameStore.propertyOwnership.filter(o => o.player_id === playerId)
  // Deduplicate by property_id
  const seen = new Set()
  return properties.filter(p => {
    if (seen.has(p.property_id)) return false
    seen.add(p.property_id)
    return true
  })
}

const getPropertyColor = (propertyId) => {
  const property = propertiesStore.properties.find(p => p.property_id === propertyId)
  return property?.property_color || '#ccc'
}

const getPropertyName = (propertyId) => {
  const property = propertiesStore.properties.find(p => p.property_id === propertyId)
  return property?.name || property?.board_spaces?.name || 'Unknown'
}

const getPropertyPrice = (propertyId) => {
  const property = propertiesStore.properties.find(p => p.property_id === propertyId)
  return (property?.base_price || 0).toLocaleString()
}

const getPropertyDetails = (propertyId) => {
  const property = propertiesStore.properties.find(p => p.property_id === propertyId)
  return property || {}
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
  width: 95%;
  max-width: 1200px;
  max-height: 90vh;
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
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  justify-items: center;
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
