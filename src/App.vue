<template>
  <div v-if="isLoading" class="loading-screen">
    <div class="loading-content">
      <div class="spinner"></div>
      <p>Loading game data...</p>
    </div>
  </div>
  <div v-else>
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <router-view/>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBoardSpacesStore } from '@/stores/boardSpaces'
import { usePropertiesStore } from '@/stores/properties'

const isLoading = ref(true)
const boardSpacesStore = useBoardSpacesStore()
const propertiesStore = usePropertiesStore()

onMounted(async () => {
  // Check if stores are already loaded (from main.js initialization)
  if (boardSpacesStore.boardSpaces.length > 0 && propertiesStore.properties.length > 0) {
    isLoading.value = false
  } else {
    // Fallback: load stores if not already loaded
    await Promise.all([
      boardSpacesStore.fetchBoardSpaces(),
      propertiesStore.fetchProperties()
    ])
    isLoading.value = false
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-content p {
  font-size: 18px;
  font-weight: 500;
}
</style>
