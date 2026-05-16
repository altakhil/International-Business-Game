<template>
  <div class="property-map">
    <h1 class="map-title">International Business - Property Map</h1>
    
    <div v-if="loading" class="loading">
      Loading properties...
    </div>
    
    <div v-else-if="error" class="error">
      Error loading properties: {{ error }}
    </div>
    
    <div v-else class="property-grid">
      <PropertyTicket 
        v-for="property in properties" 
        :key="property.property_id" 
        :property="property" 
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePropertiesStore } from '@/stores/properties'
import PropertyTicket from '@/components/PropertyTicket.vue'

const propertiesStore = usePropertiesStore()

const { properties, loading, error, fetchProperties } = propertiesStore

onMounted(() => {
  fetchProperties()
})
</script>

<style scoped>
.property-map {
  padding: 40px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.map-title {
  text-align: center;
  color: white;
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 40px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.loading,
.error {
  text-align: center;
  color: white;
  font-size: 24px;
  padding: 40px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin: 20px;
}

.error {
  background: rgba(220, 38, 38, 0.3);
}

.property-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}
</style>
