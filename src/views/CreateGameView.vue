<template>
  <div class="create-game-container">
    <div class="create-game-card">
      <h1 class="title">Host a Game</h1>
      
      <div class="form-group">
        <label for="player-name">Your Name</label>
        <input 
          id="player-name" 
          v-model="playerName" 
          type="text" 
          placeholder="Enter your name"
          maxlength="50"
        />
      </div>
      
      <div class="form-group">
        <label for="max-players">Number of Players</label>
        <select id="max-players" v-model="maxPlayers">
          <option :value="2">2 Players</option>
          <option :value="3">3 Players</option>
          <option :value="4">4 Players</option>
          <option :value="5">5 Players</option>
          <option :value="6">6 Players</option>
        </select>
      </div>
      
      <button 
        class="btn btn-primary" 
        @click="createGame" 
        :disabled="loading || !playerName"
      >
        {{ loading ? 'Creating...' : 'Create Game' }}
      </button>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div class="back-link">
        <router-link to="/">Back to Home</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const gameStore = useGameStore()

const playerName = ref('')
const maxPlayers = ref(4)
const loading = ref(false)
const error = ref(null)

const generateJoinCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

const createGame = async () => {
  if (!playerName.value.trim()) {
    error.value = 'Please enter your name'
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const joinCode = generateJoinCode()
    
    const game = await gameStore.createGame({
      max_players: maxPlayers.value,
      join_code: joinCode
    })
    
    // Join as host
    const player = await gameStore.joinGame(game.game_id, playerName.value, true)
    
    // Store current player ID in localStorage
    localStorage.setItem(`currentPlayer_${game.game_id}`, player.player_id)
    
    // Navigate to lobby
    router.push({ name: 'lobby', params: { gameId: game.game_id } })
  } catch (err) {
    error.value = err.message || 'Failed to create game'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-game-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.create-game-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 100%;
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: #1e3a8a;
  margin-bottom: 30px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  width: 100%;
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 20px;
  padding: 12px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.back-link {
  margin-top: 20px;
  text-align: center;
}

.back-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: bold;
}

.back-link a:hover {
  text-decoration: underline;
}
</style>
