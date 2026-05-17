<template>
  <div class="game-view">
    <!-- Left: Game Board -->
    <div class="game-board-section">
      <GameBoard 
        :boardSpaces="boardSpaces"
        :propertyOwnership="gameStore.propertyOwnership"
        :players="gameStore.players"
      />
    </div>

    <!-- Middle: Game Details -->
    <div class="game-details-section">
      <div class="details-card">
        <h2 class="section-title">Current Turn</h2>
        <div v-if="currentPlayer" class="current-player">
          <div class="player-avatar">
            {{ currentPlayer.name.charAt(0).toUpperCase() }}
          </div>
          <div class="player-info">
            <div class="player-name">{{ currentPlayer.name }}</div>
            <div class="player-money">${{ formatMoney(currentPlayer.money) }}</div>
          </div>
        </div>
        <div v-else class="loading">Loading...</div>
      </div>

      <div class="details-card">
        <h2 class="section-title">All Players</h2>
        <div class="players-list">
          <div 
            v-for="player in sortedPlayers" 
            :key="player.player_id"
            class="player-row"
            :class="{ 'is-turn': player.player_id === gameStore.game?.current_player_turn_id, 'inactive': player.is_active === false }"
          >
            <div class="player-small-avatar">
              {{ player.name.charAt(0).toUpperCase() }}
            </div>
            <div class="player-name">{{ player.name }}</div>
            <div class="player-money">${{ formatMoney(player.money) }}</div>
            <div class="player-position">Pos: {{ player.position }}</div>
          </div>
        </div>
      </div>

      <div class="details-card">
        <h2 class="section-title">Dice Roll</h2>
        <DiceRoll 
          :isMyTurn="isMyTurn"
          :diceValue="gameStore.game?.current_dice_roll"
          @roll="handleDiceRoll"
        />
      </div>
    </div>

    <!-- Right: Game Actions -->
    <div class="game-actions-section">
      <div class="action-card">
        <h3 class="action-title">My Money</h3>
        <div class="money-display">${{ formatMoney(myPlayer?.money || 0) }}</div>
      </div>

      <button class="action-button" @click="showPropertiesModal = true">
        🏠 Properties
      </button>

      <button 
        class="action-button" 
        @click="showAuctionModal = true"
        :disabled="!isMyTurn"
      >
        📢 Auction Property
      </button>

      <button 
        class="action-button" 
        @click="showMortgageModal = true"
      >
        🏦 Mortgage Property
      </button>

      <button 
        class="action-button roll-dice" 
        @click="handleDiceRoll"
        :disabled="!isMyTurn || isRolling"
      >
        🎲 Roll Dice
      </button>

      <button class="action-button leave-game" @click="leaveGame">
        🚪 Leave Game
      </button>
    </div>

    <!-- Modals -->
    <PropertiesModal 
      v-if="showPropertiesModal"
      @close="showPropertiesModal = false"
    />

    <AuctionModal 
      v-if="showAuctionModal"
      :ownedProperties="myOwnedProperties"
      @close="showAuctionModal = false"
      @auction="handleAuction"
    />

    <MortgageModal 
      v-if="showMortgageModal"
      :ownedProperties="myOwnedProperties"
      @close="showMortgageModal = false"
      @mortgage="handleMortgage"
    />

    <PropertyPurchaseModal 
      v-if="showPurchaseModal"
      :property="currentProperty"
      :player="myPlayer"
      @close="showPurchaseModal = false"
      @purchase="handlePurchase"
      @pass="handlePass"
    />

    <ChanceCardModal 
      v-if="showChanceModal"
      :card="currentChanceCard"
      @close="showChanceModal = false"
      @resolve="handleChanceCard"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useBoardSpacesStore } from '@/stores/boardSpaces'
import { usePropertiesStore } from '@/stores/properties'
import GameBoard from '@/components/GameBoard.vue'
import DiceRoll from '@/components/DiceRoll.vue'
import PropertiesModal from '@/components/PropertiesModal.vue'
import AuctionModal from '@/components/AuctionModal.vue'
import MortgageModal from '@/components/MortgageModal.vue'
import PropertyPurchaseModal from '@/components/PropertyPurchaseModal.vue'
import ChanceCardModal from '@/components/ChanceCardModal.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const boardSpacesStore = useBoardSpacesStore()
const propertiesStore = usePropertiesStore()

const { boardSpaces } = boardSpacesStore

// Modal states
const showPropertiesModal = ref(false)
const showAuctionModal = ref(false)
const showMortgageModal = ref(false)
const showPurchaseModal = ref(false)
const showChanceModal = ref(false)

// Game state
const isRolling = ref(false)
const currentPlayerId = ref(null)
const currentProperty = ref(null)
const currentChanceCard = ref(null)

// Computed
const currentPlayer = computed(() => gameStore.currentPlayer)
const sortedPlayers = computed(() => {
  return [...gameStore.players]
    .filter(p => p.is_active !== false)
    .sort((a, b) => a.order_in_turn - b.order_in_turn)
})

const myPlayer = computed(() => {
  return gameStore.players.find(p => p.player_id === currentPlayerId.value)
})

const isMyTurn = computed(() => {
  if (!gameStore.game?.current_player_turn_id || !currentPlayerId.value) return false
  if (!myPlayer.value || myPlayer.value.is_active === false) return false
  return gameStore.game.current_player_turn_id === currentPlayerId.value
})

const myOwnedProperties = computed(() => {
  if (!currentPlayerId.value) return []
  return gameStore.propertyOwnership.filter(o => o.player_id === currentPlayerId.value)
})

// Methods
const formatMoney = (value) => {
  return Number(value).toLocaleString()
}

const handleDiceRoll = async () => {
  if (!isMyTurn.value || isRolling.value) return
  
  isRolling.value = true
  
  // Generate random dice roll (1-6)
  const roll = Math.floor(Math.random() * 6) + 1
  
  await gameStore.setCurrentDiceRoll(roll)
  
  // Move player with circular movement (0-35, wraps around)
  const player = myPlayer.value
  const newPosition = (player.position - roll + 36) % 36
  await gameStore.movePlayer(player.player_id, newPosition)
  
  // Check what space they landed on - find by position
  const landedSpace = boardSpaces.value ? boardSpaces.value.find(s => s.position === newPosition) : null
  
  console.log('Landed on position:', newPosition, 'Space:', landedSpace)
  
  if (landedSpace) {
    await handleLanding(landedSpace, player)
  }
  
  isRolling.value = false
  
  // End turn after deal is done
  await endTurn()
}

const handleLanding = async (space, player) => {
  console.log('Handling landing on:', space.space_type, space.name)
  
  if (space.space_type === 'property') {
    // Check if property is owned
    const ownership = gameStore.propertyOwnership.find(o => o.property_id === space.space_id)
    
    console.log('Ownership found:', ownership)
    
    if (!ownership) {
      // Property is unowned - show purchase modal
      currentProperty.value = {
        id: space.space_id,
        name: space.name,
        color: space.property_color || 'Gray',
        price: space.base_price || 100,
        rent: space.base_price * 0.1,
        house_cost: space.base_price * 0.5,
        hotel_cost: space.base_price,
        mortgage_value: space.mortgage_value || space.base_price * 0.5
      }
      console.log('Showing purchase modal for:', currentProperty.value)
      showPurchaseModal.value = true
    } else if (ownership.player_id !== player.player_id) {
      // Property is owned by someone else - pay rent
      const owner = gameStore.players.find(p => p.player_id === ownership.player_id)
      if (owner) {
        const rent = calculateRent(space, ownership)
        await gameStore.payRent(gameStore.game.game_id, player.player_id, owner.player_id, rent, space.space_id)
      }
    }
  } else if (space.space_type === 'chance' || space.space_type === 'uno') {
    // Draw chance card
    currentChanceCard.value = drawRandomCard()
    showChanceModal.value = true
  }
}

const calculateRent = (property, ownership) => {
  // Simple rent calculation - can be enhanced
  let rent = property.price * 0.1
  if (ownership.houses_count > 0) {
    rent *= (1 + ownership.houses_count * 0.5)
  }
  if (ownership.has_hotel) {
    rent *= 2
  }
  return rent
}

const drawRandomCard = () => {
  // Simple random card - can be enhanced with actual card data
  const cards = [
    { message: 'Advance to Go', cost: 0 },
    { message: 'Bank error in your favor', cost: 200 },
    { message: 'Doctor fee', cost: -50 },
    { message: 'Get out of jail free', cost: 0 },
    { message: 'Go to jail', cost: 0 },
    { message: 'Pay hospital fees', cost: -100 },
  ]
  return cards[Math.floor(Math.random() * cards.length)]
}

const handlePurchase = async () => {
  if (!currentProperty.value || !myPlayer.value) return
  
  try {
    await gameStore.purchaseProperty(
      gameStore.game.game_id,
      currentProperty.value.id,
      myPlayer.value.player_id,
      currentProperty.value.price
    )
    showPurchaseModal.value = false
  } catch (err) {
    console.error('Purchase failed:', err)
  }
}

const handlePass = () => {
  showPurchaseModal.value = false
}

const handleChanceCard = async () => {
  if (!currentChanceCard.value || !myPlayer.value) return
  
  if (currentChanceCard.value.cost !== 0) {
    await gameStore.updatePlayerMoney(myPlayer.value.player_id, currentChanceCard.value.cost)
  }
  
  showChanceModal.value = false
}

const handleAuction = async (propertyId) => {
  if (!propertyId) return
  
  try {
    await gameStore.startBiddingSession(
      gameStore.game.game_id,
      propertyId,
      currentPlayerId.value,
      0 // Starting bid
    )
    showAuctionModal.value = false
  } catch (err) {
    console.error('Auction failed:', err)
  }
}

const handleMortgage = async (ownershipId) => {
  if (!ownershipId) return
  
  const ownership = gameStore.propertyOwnership.find(o => o.ownership_id === ownershipId)
  if (!ownership) return
  
  const property = boardSpaces.value.find(s => s.id === ownership.property_id)
  if (!property) return
  
  try {
    await gameStore.mortgageProperty(ownershipId, currentPlayerId.value, property.mortgage_value || property.price * 0.5)
    showMortgageModal.value = false
  } catch (err) {
    console.error('Mortgage failed:', err)
  }
}

const endTurn = async () => {
  const activePlayers = gameStore.players.filter(p => p.is_active !== false)
  
  if (activePlayers.length === 0) {
    console.error('No active players found')
    return
  }
  
  const currentPlayerIndex = activePlayers.findIndex(p => p.player_id === gameStore.game?.current_player_turn_id)
  
  if (currentPlayerIndex === -1) {
    // Current player is inactive, find first active player
    const nextPlayer = activePlayers[0]
    await gameStore.setCurrentPlayerTurn(nextPlayer.player_id)
    return
  }
  
  const nextPlayerIndex = (currentPlayerIndex + 1) % activePlayers.length
  const nextPlayer = activePlayers[nextPlayerIndex]
  
  await gameStore.setCurrentPlayerTurn(nextPlayer.player_id)
}

const leaveGame = async () => {
  if (myPlayer.value) {
    // Mark player as left in database
    try {
      await gameStore.updatePlayer(myPlayer.value.player_id, { is_active: false })
    } catch (err) {
      console.error('Error marking player as inactive:', err)
    }
  }
  gameStore.resetStore()
  router.push('/')
}

onMounted(async () => {
  const gameId = route.params.gameId
  
  try {
    await gameStore.initializeGame(gameId)
    await propertiesStore.fetchProperties()
    await boardSpacesStore.fetchBoardSpaces()
    
    // Get current player ID from localStorage
    const storedPlayerId = localStorage.getItem(`currentPlayer_${gameId}`)
    if (storedPlayerId) {
      currentPlayerId.value = storedPlayerId
    }
    
    // If no stored player ID, use the first player
    if (!currentPlayerId.value && gameStore.players.length > 0) {
      currentPlayerId.value = gameStore.players[0].player_id
      localStorage.setItem(`currentPlayer_${gameId}`, currentPlayerId.value)
    }
  } catch (err) {
    console.error('Failed to load game:', err)
  }
})

onUnmounted(() => {
  gameStore.unsubscribeAll()
})
</script>

<style scoped>
.game-view {
  display: flex;
  flex-direction: row;
  gap: 10px;
  height: 100vh;
  padding: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  box-sizing: border-box;
}

.game-board-section {
  background: white;
  border-radius: 16px;
  padding: 5px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 0;
  height: 100%;
  flex: 1;
  min-width: 0;
  position: relative;
}

.game-board-section :deep(.game-board) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
}


.game-details-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  min-height: 0;
  height: 100%;
}

.details-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #1e3a8a;
  margin-bottom: 15px;
}

.current-player {
  display: flex;
  align-items: center;
  gap: 15px;
}

.player-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
}

.player-info {
  flex: 1;
}

.player-name {
  font-size: 18px;
  font-weight: bold;
  color: #1e3a8a;
  margin-bottom: 5px;
}

.player-money {
  font-size: 24px;
  font-weight: bold;
  color: #10b981;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  background: #f8fafc;
  transition: all 0.3s;
}

.player-row.is-turn {
  background: #eef2ff;
  border: 2px solid #667eea;
}

.player-row.inactive {
  opacity: 0.5;
  background: #f1f5f9;
}

.player-small-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.player-row .player-name {
  flex: 1;
  font-size: 14px;
}

.player-row .player-money {
  font-size: 16px;
  font-weight: bold;
  color: #10b981;
}

.player-position {
  font-size: 12px;
  color: #64748b;
}

.game-actions-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
  min-height: 0;
  height: 100%;
}

.action-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.action-title {
  font-size: 16px;
  font-weight: bold;
  color: #64748b;
  margin-bottom: 10px;
}

.money-display {
  font-size: 32px;
  font-weight: bold;
  color: #10b981;
}

.action-button {
  padding: 15px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
  color: #1e3a8a;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button.roll-dice {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 18px;
}

.action-button.leave-game {
  background: #ef4444;
  color: white;
}

.loading {
  text-align: center;
  color: #64748b;
}
</style>
