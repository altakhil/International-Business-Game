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

    <RentPaymentModal 
      v-if="showRentModal"
      :property="currentProperty"
      :owner="rentOwner"
      :ownership="rentOwnership"
      :rentAmount="rentAmount"
      @close="handleRentModalClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useBoardSpacesStore } from '@/stores/boardSpaces'
import { usePropertiesStore } from '@/stores/properties'
import { storeToRefs } from 'pinia'
import GameBoard from '@/components/GameBoard.vue'
import DiceRoll from '@/components/DiceRoll.vue'
import PropertiesModal from '@/components/PropertiesModal.vue'
import AuctionModal from '@/components/AuctionModal.vue'
import MortgageModal from '@/components/MortgageModal.vue'
import PropertyPurchaseModal from '@/components/PropertyPurchaseModal.vue'
import ChanceCardModal from '@/components/ChanceCardModal.vue'
import RentPaymentModal from '@/components/RentPaymentModal.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const boardSpacesStore = useBoardSpacesStore()
const propertiesStore = usePropertiesStore()

const { boardSpaces } = storeToRefs(boardSpacesStore)

// Modal states
const showPropertiesModal = ref(false)
const showAuctionModal = ref(false)
const showMortgageModal = ref(false)
const showPurchaseModal = ref(false)
const showChanceModal = ref(false)
const showRentModal = ref(false)

// Game state
const isRolling = ref(false)
const currentPlayerId = ref(null)
const currentProperty = ref(null)
const currentChanceCard = ref(null)
const rentOwner = ref(null)
const rentOwnership = ref(null)
const rentAmount = ref(0)

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
  console.log('=== DICE ROLL START ===')
  console.log('isMyTurn:', isMyTurn.value)
  console.log('isRolling:', isRolling.value)
  console.log('myPlayer:', myPlayer.value)
  
  if (!isMyTurn.value || isRolling.value) {
    console.log('Cannot roll - not my turn or already rolling')
    return
  }
  
  isRolling.value = true
  
  // Generate random dice roll (1-6)
  const roll = Math.floor(Math.random() * 6) + 1
  console.log('Dice roll:', roll)
  
  await gameStore.setCurrentDiceRoll(roll)
  
  // Move player with circular movement (0-35, wraps around)
  const player = myPlayer.value
  const oldPosition = player.position
  const newPosition = (player.position - roll + 36) % 36
  console.log('Moving from position', oldPosition, 'to', newPosition)
  await gameStore.movePlayer(player.player_id, newPosition)
  
  // Check what space they landed on - find by position
  console.log('boardSpaces.value:', boardSpaces.value)
  console.log('boardSpacesStore.boardSpaces:', boardSpacesStore.boardSpaces)
  const landedSpace = boardSpaces.value ? boardSpaces.value.find(s => s.position === newPosition) : null
  
  console.log('Landed on position:', newPosition, 'Space:', landedSpace)
  
  if (landedSpace) {
    await handleLanding(landedSpace, player)
  } else {
    console.log('No space found at position:', newPosition)
    await endTurn()
  }
  
  isRolling.value = false
  
  console.log('=== DICE ROLL END ===')
}

const handleLanding = async (space, player) => {
  console.log('=== HANDLE LANDING START ===')
  console.log('Space:', space)
  console.log('Player:', player)
  console.log('Space type:', space.space_type)
  console.log('Space name:', space.name)
  console.log('Space space_id:', space.space_id)
  
  console.log('propertiesStore.properties:', propertiesStore.properties)
  console.log('gameStore.propertyOwnership:', gameStore.propertyOwnership)
  
  if (space.space_type === 'property') {
    console.log('This is a property space')
    
    // Find the property record for this board space
    const property = propertiesStore.properties.find(p => p.space_id === space.space_id)
    console.log('Property found:', property)
    
    if (!property) {
      console.log('No property record found for this space - ending turn')
      await endTurn()
      return
    }
    
    console.log('Property details:', {
      property_id: property.property_id,
      name: property.name,
      property_color: property.property_color,
      base_price: property.base_price
    })
    
    // Check if property is owned
    const ownership = gameStore.propertyOwnership.find(o => o.property_id === property.property_id)
    
    console.log('Ownership check:', {
      property_id: property.property_id,
      ownership_found: !!ownership,
      ownership: ownership
    })
    
    if (!ownership) {
      console.log('Property is unowned - showing purchase modal')
      
      // Property is unowned - show purchase modal
      // Map property fields to match modal expectations
      currentProperty.value = {
        property_id: property.property_id,
        name: property.name,
        color: property.property_color,
        price: property.base_price,
        rent: property.base_rent,
        house_cost: property.house_price,
        hotel_cost: property.hotel_price,
        mortgage_value: property.mortgage_value
      }
      console.log('currentProperty.value set to:', currentProperty.value)
      console.log('Setting showPurchaseModal to true')
      showPurchaseModal.value = true
      console.log('showPurchaseModal.value after setting:', showPurchaseModal.value)
      
      // Don't end turn yet - wait for purchase decision
      console.log('Returning without ending turn')
      return
    } else if (ownership.player_id !== player.player_id) {
      console.log('Property owned by another player - paying rent')
      // Property is owned by someone else - pay rent
      try {
        const owner = gameStore.players.find(p => p.player_id === ownership.player_id)
        console.log('Owner found:', owner)
        
        if (owner) {
          const rent = calculateRent(property, ownership)
          console.log('Rent calculated:', rent)
          
          // Pay the rent
          console.log('Calling payRent with:', {
            gameId: gameStore.game.game_id,
            fromPlayerId: player.player_id,
            toPlayerId: owner.player_id,
            rent: rent,
            propertyId: property.property_id
          })
          
          await gameStore.payRent(gameStore.game.game_id, player.player_id, owner.player_id, rent, property.property_id)
          
          console.log('Rent payment successful')
          
          // Show rent payment modal
          rentOwner.value = owner
          rentOwnership.value = ownership
          rentAmount.value = rent
          showRentModal.value = true
          
          // Don't end turn yet - wait for modal close
          console.log('Returning without ending turn for rent modal')
          return
        } else {
          console.error('Owner not found for player_id:', ownership.player_id)
        }
      } catch (err) {
        console.error('Error during rent payment:', err)
        console.error('Error details:', JSON.stringify(err, null, 2))
        console.error('Error message:', err.message)
        console.error('Error stack:', err.stack)
      }
    } else {
      console.log('Property owned by current player - no action needed')
    }
  } else if (space.space_type === 'chance' || space.space_type === 'uno') {
    console.log('This is a chance/uno space')
    // Draw chance card
    currentChanceCard.value = drawRandomCard()
    showChanceModal.value = true
    
    // Don't end turn yet - wait for card action
    console.log('Returning without ending turn for chance card')
    return
  } else {
    console.log('Space type:', space.space_type, '- no special handling')
  }
  
  console.log('Ending turn')
  await endTurn()
  console.log('=== HANDLE LANDING END ===')
}

const calculateRent = (property, ownership) => {
  console.log('Calculating rent for property:', property)
  console.log('Ownership:', ownership)
  
  // Handle missing property data gracefully
  if (!property) {
    console.error('Property is null or undefined')
    return 0
  }
  
  if (!ownership) {
    console.error('Ownership is null or undefined')
    return 0
  }
  
  // Get base rent with fallback
  let rent = property.base_rent || property.base_price * 0.1 || 0
  
  // Calculate rent based on houses
  if (ownership.houses_count > 0) {
    const houseRentKey = `rent_${ownership.houses_count}_house`
    rent = property[houseRentKey] || rent
  }
  
  // Calculate rent based on hotel
  if (ownership.has_hotel) {
    rent = property.rent_hotel || rent * 2
  }
  
  console.log('Calculated rent:', rent)
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
  console.log('=== HANDLE PURCHASE START ===')
  console.log('currentProperty.value:', currentProperty.value)
  console.log('myPlayer.value:', myPlayer.value)
  
  if (!currentProperty.value || !myPlayer.value) {
    console.log('Missing property or player data')
    return
  }
  
  try {
    console.log('Calling purchaseProperty with:', {
      game_id: gameStore.game.game_id,
      property_id: currentProperty.value.property_id,
      player_id: myPlayer.value.player_id,
      price: currentProperty.value.price
    })
    
    await gameStore.purchaseProperty(
      gameStore.game.game_id,
      currentProperty.value.property_id,
      myPlayer.value.player_id,
      currentProperty.value.price
    )
    
    console.log('Purchase successful, closing modal')
    showPurchaseModal.value = false
    console.log('showPurchaseModal.value after closing:', showPurchaseModal.value)
    
    console.log('Ending turn')
    await endTurn()
    console.log('Turn ended')
  } catch (err) {
    console.error('Purchase failed:', err)
  }
  
  console.log('=== HANDLE PURCHASE END ===')
}

const handlePass = async () => {
  console.log('=== HANDLE PASS START ===')
  console.log('Closing modal')
  showPurchaseModal.value = false
  console.log('showPurchaseModal.value after closing:', showPurchaseModal.value)
  
  console.log('Ending turn')
  await endTurn()
  console.log('Turn ended')
  console.log('=== HANDLE PASS END ===')
}

const handleChanceCard = async () => {
  if (!currentChanceCard.value || !myPlayer.value) return
  
  if (currentChanceCard.value.cost !== 0) {
    await gameStore.updatePlayerMoney(myPlayer.value.player_id, currentChanceCard.value.cost)
  }
  
  showChanceModal.value = false
  // End turn after handling chance card
  await endTurn()
}

const handleRentModalClose = async () => {
  console.log('Closing rent modal')
  showRentModal.value = false
  console.log('Ending turn after rent payment')
  await endTurn()
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
