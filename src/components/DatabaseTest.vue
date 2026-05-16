<template>
  <div class="database-test">
    <h2>Database Connection Test</h2>
    <button @click="testConnection">Test Connection</button>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="data">
      <h3>Board Spaces ({{ data.length }} records)</h3>
      <pre>{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/config/supabase'

const loading = ref(false)
const error = ref(null)
const data = ref(null)

const testConnection = async () => {
  loading.value = true
  error.value = null
  data.value = null
  
  try {
    // Query the board_spaces table (public table, no auth required)
    const { data: boardSpaces, error: err } = await supabase
      .from('board_spaces')
      .select('*')
      .limit(5)
    
    if (err) throw err
    data.value = boardSpaces
    console.log('Database connection successful!', boardSpaces)
  } catch (err) {
    error.value = err.message
    console.error('Database connection failed:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.database-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

button {
  padding: 10px 20px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #3aa876;
}

.error {
  color: red;
  margin-top: 10px;
  padding: 10px;
  background: #fee;
  border-radius: 4px;
}

pre {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 400px;
}
</style>
