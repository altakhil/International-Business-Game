<template>
  <div class="lobby-container">
    <div class="lobby-card">
      <h1 class="title">Game Lobby</h1>
      
      <div class="game-info">
        <div class="info-item">
          <span class="label">Join Code:</span>
          <span class="code">{{ game?.join_code }}</span>
          <button class="copy-btn" @click="copyJoinCode" title="Copy to clipboard">
            📋
          </button>
        </div>
        <div class="info-item">
          <span class="label">Players:</span>
          <span class="value">{{ players.length }} / {{ game?.max_players }}</span>
        </div>
        <div class="info-item">
          <span class="label">Status:</span>
          <span class="value status">{{ game?.status }}</span>
        </div>
      </div>
      
      <div class="players-section">
        <h2 class="section-title">Players</h2>
        <div class="players-list">
          <div 
            v-for="player in sortedPlayers" 
            :key="player.player_id" 
            class="player-card"
            :class="{ 'is-host': player.is_host, 'is-you': isCurrentUser(player) }"
          >
            <div class="player-avatar">
              {{ player.name.charAt(0).toUpperCase() }}
            </div>
            <div class="player-info">
              <div class="player-name">{{ player.name }}</div>
              <div class="player-details">
                <span v-if="player.is_host" class="host-badge">Host</span>
                <span v-if="isCurrentUser(player)" class="you-badge">You</span>
              </div>
            </div>
            <div class="player-money">
              ${{ formatMoney(player.money) }}
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="isHost" class="host-controls">
        <button 
          class="btn btn-start" 
          @click="startGame" 
          :disabled="loading || players.length < 2"
        >
          {{ loading ? 'Starting...' : 'Start Game' }}
        </button>
        <p class="hint">Need at least 2 players to start</p>
      </div>
      
      <div v-else class="waiting-message">
        <div class="spinner"></div>
        <p>Waiting for host to start the game...</p>
      </div>
      
      <button class="btn btn-leave" @click="leaveGame">
        Leave Game
      </button>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const route = useRoute()
const gameStore = useGameStore()

const loading = ref(false)
const error = ref(null)
const currentPlayerId = ref(null)

const game = computed(() => gameStore.game)
const players = computed(() => gameStore.players)

const sortedPlayers = computed(() => {
  return [...players.value].sort((a, b) => a.order_in_turn - b.order_in_turn)
})

const isHost = computed(() => {
  const player = players.value.find(p => p.player_id === currentPlayerId.value)
  return player?.is_host || false
})

const isCurrentUser = (player) => {
  return player.player_id === currentPlayerId.value
}

const formatMoney = (value) => {
  return Number(value).toLocaleString()
}

const copyJoinCode = async () => {
  try {
    await navigator.clipboard.writeText(game.value?.join_code)
    alert('Join code copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const startGame = async () => {
  if (players.value.length < 2) {
    error.value = 'Need at least 2 players to start'
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    await gameStore.startGame()
    router.push({ name: 'board', params: { gameId: game.value.game_id } })
  } catch (err) {
    error.value = err.message || 'Failed to start game'
  } finally {
    loading.value = false
  }
}

const leaveGame = () => {
  gameStore.resetStore()
  router.push('/')
}

onMounted(async () => {
  const gameId = route.params.gameId
  
  try {
    // Initialize game data and subscriptions
    await gameStore.initializeGame(gameId)
    
    // Get current player ID from localStorage (set when joining)
    const storedPlayerId = localStorage.getItem(`currentPlayer_${gameId}`)
    if (storedPlayerId) {
      currentPlayerId.value = storedPlayerId
    } else {
      // Fallback: assume the last player is the current user
      if (players.value.length > 0) {
        currentPlayerId.value = players.value[players.value.length - 1].player_id
        localStorage.setItem(`currentPlayer_${gameId}`, currentPlayerId.value)
      }
    }
    
    // Watch for game status changes
    const checkGameStatus = setInterval(() => {
      if (game.value?.status === 'in_progress') {
        clearInterval(checkGameStatus)
        router.push({ name: 'board', params: { gameId: game.value.game_id } })
      }
    }, 1000)
    
    // Store interval for cleanup
    window.gameStatusCheck = checkGameStatus
  } catch (err) {
    error.value = err.message || 'Failed to load lobby'
    console.error(err)
  }
})

onUnmounted(() => {
  if (window.gameStatusCheck) {
    clearInterval(window.gameStatusCheck)
  }
})
</script>

<style scoped>
.lobby-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.lobby-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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

.game-info {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: bold;
  color: #64748b;
  font-size: 14px;
}

.code {
  font-family: 'Courier New', monospace;
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  letter-spacing: 4px;
}

.copy-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.copy-btn:hover {
  background: #e5e7eb;
}

.value {
  font-weight: bold;
  color: #1e3a8a;
  font-size: 16px;
}

.status {
  text-transform: capitalize;
  color: #10b981;
}

.players-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #1e3a8a;
  margin-bottom: 15px;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.player-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.player-card.is-host {
  border-color: #f59e0b;
  background: #fffbeb;
}

.player-card.is-you {
  border-color: #667eea;
  background: #eef2ff;
}

.player-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
}

.player-info {
  flex: 1;
}

.player-name {
  font-weight: bold;
  color: #1e3a8a;
  font-size: 16px;
  margin-bottom: 4px;
}

.player-details {
  display: flex;
  gap: 8px;
}

.host-badge {
  background: #f59e0b;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.you-badge {
  background: #667eea;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.player-money {
  font-weight: bold;
  color: #10b981;
  font-size: 16px;
}

.host-controls {
  text-align: center;
  margin-bottom: 20px;
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
  margin-bottom: 10px;
}

.btn-start {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-start:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
}

.btn-start:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-leave {
  background: #ef4444;
  color: white;
}

.btn-leave:hover {
  background: #dc2626;
}

.hint {
  font-size: 14px;
  color: #64748b;
  margin-top: 8px;
}

.waiting-message {
  text-align: center;
  margin-bottom: 20px;
  padding: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.waiting-message p {
  color: #64748b;
  font-size: 16px;
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
</style>
