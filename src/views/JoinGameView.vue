<template>
  <div class="join-game-container">
    <div class="join-game-card">
      <h1 class="title">Join a Game</h1>
      
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
        <label for="join-code">Join Code</label>
        <input 
          id="join-code" 
          v-model="joinCode" 
          type="text" 
          placeholder="Enter 6-character code"
          maxlength="6"
          uppercase
        />
      </div>
      
      <button 
        class="btn btn-primary" 
        @click="joinGame" 
        :disabled="loading || !playerName || !joinCode"
      >
        {{ loading ? 'Joining...' : 'Join Game' }}
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
const joinCode = ref('')
const loading = ref(false)
const error = ref(null)

const joinGame = async () => {
  if (!playerName.value.trim()) {
    error.value = 'Please enter your name'
    return
  }
  
  if (!joinCode.value.trim() || joinCode.value.length !== 6) {
    error.value = 'Please enter a valid 6-character join code'
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    // Fetch game by join code
    const game = await gameStore.fetchGameByJoinCode(joinCode.value.toUpperCase())
    
    if (!game) {
      error.value = 'Game not found'
      return
    }
    
    if (game.status !== 'waiting_for_players') {
      error.value = 'Game is not accepting new players'
      return
    }
    
    // Check if game is full
    const currentPlayers = await gameStore.fetchPlayers(game.game_id)
    if (currentPlayers.length >= game.max_players) {
      error.value = 'Game is full'
      return
    }
    
    // Join the game
    const player = await gameStore.joinGame(game.game_id, playerName.value, false)
    
    // Store current player ID in localStorage
    localStorage.setItem(`currentPlayer_${game.game_id}`, player.player_id)
    
    // Navigate to lobby
    router.push({ name: 'lobby', params: { gameId: game.game_id } })
  } catch (err) {
    error.value = err.message || 'Failed to join game'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.join-game-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.join-game-card {
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

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  text-transform: uppercase;
  transition: border-color 0.3s;
}

.form-group input:focus {
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
