<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <DatabaseTest />
    
    <div class="navigation-section">
      <router-link to="/properties" class="nav-button">
        View All Properties Map
      </router-link>
    </div>
    
    <div class="properties-section">
      <h2>Properties</h2>
      <button @click="loadProperties" :disabled="loading">
        {{ loading ? 'Loading...' : 'Load Properties' }}
      </button>
      
      <div v-if="error" class="error">{{ error }}</div>
      
      <div class="properties-grid" v-if="properties.length > 0">
        <PropertyTicket 
          v-for="property in properties" 
          :key="property.property_id" 
          :property="property"
        />
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import DatabaseTest from '@/components/DatabaseTest.vue'
import PropertyTicket from '@/components/PropertyTicket.vue'
import { usePropertiesStore } from '@/stores/properties'
import { storeToRefs } from 'pinia'

export default {
  name: 'HomeView',
  components: {
    HelloWorld,
    DatabaseTest,
    PropertyTicket
  },
  setup() {
    const propertiesStore = usePropertiesStore()
    const { properties, loading, error } = storeToRefs(propertiesStore)
    
    const loadProperties = async () => {
      try {
        await propertiesStore.fetchProperties()
      } catch (err) {
        console.error('Failed to load properties:', err)
      }
    }
    
    return {
      properties,
      loading,
      error,
      loadProperties
    }
  }
}
</script>

<style scoped>
.navigation-section {
  margin: 30px 0;
  text-align: center;
}

.nav-button {
  display: inline-block;
  padding: 15px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.properties-section {
  margin-top: 40px;
  padding: 20px;
}

.properties-section h2 {
  margin-bottom: 20px;
}

.properties-section button {
  padding: 10px 20px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.properties-section button:hover {
  background: #3aa876;
}

.properties-section button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-top: 10px;
  padding: 10px;
  background: #fee;
  border-radius: 4px;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
</style>
