<template>
  <div class="game-board">
    <div class="board-container">
      <!-- Top Row (Left to Right) -->
      <div class="board-row top-row">
        <BoardSpace 
          v-for="space in topRow" 
          :key="space.position" 
          :space="space" 
          :ownership="getOwnershipForSpace(space.position)"
          :players="getPlayersForSpace(space.position)"
        />
      </div>
      
      <!-- Middle Section -->
      <div class="board-middle">
        <!-- Left Column (Bottom to Top) -->
        <div class="board-column left-column">
          <BoardSpace 
            v-for="space in leftColumn" 
            :key="space.position" 
            :space="space" 
            :ownership="getOwnershipForSpace(space.position)"
            :players="getPlayersForSpace(space.position)"
          />
        </div>
        
        <!-- Center Area -->
        <div class="board-center">
          <h1 class="board-title">International Business</h1>
          <div class="board-info">
            <p>Roll the dice and travel around the world!</p>
            <p>Buy properties, build houses, and become a business tycoon.</p>
          </div>
        </div>
        
        <!-- Right Column (Top to Bottom) -->
        <div class="board-column right-column">
          <BoardSpace 
            v-for="space in rightColumn" 
            :key="space.position" 
            :space="space" 
            :ownership="getOwnershipForSpace(space.position)"
            :players="getPlayersForSpace(space.position)"
          />
        </div>
      </div>
      
      <!-- Bottom Row (Right to Left) -->
      <div class="board-row bottom-row">
        <BoardSpace 
          v-for="space in bottomRow" 
          :key="space.position" 
          :space="space" 
          :ownership="getOwnershipForSpace(space.position)"
          :players="getPlayersForSpace(space.position)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue'
import BoardSpace from './BoardSpace.vue'

const props = defineProps({
  boardSpaces: {
    type: Array,
    required: true
  },
  propertyOwnership: {
    type: Array,
    default: () => []
  },
  players: {
    type: Array,
    default: () => []
  }
})

// Board layout: 36 spaces in a square (0-35)
// Top row (left to right): positions 0-9
// Right column (top to bottom): positions 10-17
// Bottom row (right to left): positions 18-27
// Left column (bottom to top): positions 28-35

const topRow = computed(() => {
  return props.boardSpaces.filter(space => space.position >= 0 && space.position <= 9)
})

const rightColumn = computed(() => {
  return props.boardSpaces.filter(space => space.position >= 10 && space.position <= 17)
})

const bottomRow = computed(() => {
  return props.boardSpaces.filter(space => space.position >= 18 && space.position <= 27).reverse()
})

const leftColumn = computed(() => {
  return props.boardSpaces.filter(space => space.position >= 28 && space.position <= 35).reverse()
})

// Dummy data for testing
const dummyOwnership = computed(() => {
  const ownership = {}
  // Top row properties
  ownership[1] = { houses_built: 1, has_hotel: false }
  ownership[2] = { houses_built: 2, has_hotel: false }
  ownership[3] = { houses_built: 3, has_hotel: false }
  ownership[4] = { houses_built: 3, has_hotel: true }
  ownership[5] = { houses_built: 1, has_hotel: false }
  ownership[6] = { houses_built: 2, has_hotel: false }
  ownership[7] = { houses_built: 3, has_hotel: false }
  ownership[8] = { houses_built: 3, has_hotel: true }
  
  // Right column properties
  ownership[10] = { houses_built: 1, has_hotel: false }
  ownership[11] = { houses_built: 2, has_hotel: false }
  ownership[12] = { houses_built: 3, has_hotel: false }
  ownership[13] = { houses_built: 3, has_hotel: true }
  ownership[14] = { houses_built: 1, has_hotel: false }
  ownership[15] = { houses_built: 2, has_hotel: false }
  ownership[16] = { houses_built: 3, has_hotel: false }
  ownership[17] = { houses_built: 3, has_hotel: true }
  
  // Bottom row properties
  ownership[19] = { houses_built: 1, has_hotel: false }
  ownership[20] = { houses_built: 2, has_hotel: false }
  ownership[21] = { houses_built: 3, has_hotel: false }
  ownership[22] = { houses_built: 3, has_hotel: true }
  ownership[23] = { houses_built: 1, has_hotel: false }
  ownership[24] = { houses_built: 2, has_hotel: false }
  ownership[25] = { houses_built: 3, has_hotel: false }
  ownership[26] = { houses_built: 3, has_hotel: true }
  
  // Left column properties
  ownership[28] = { houses_built: 1, has_hotel: false }
  ownership[29] = { houses_built: 2, has_hotel: false }
  ownership[30] = { houses_built: 3, has_hotel: false }
  ownership[31] = { houses_built: 3, has_hotel: true }
  ownership[32] = { houses_built: 1, has_hotel: false }
  ownership[33] = { houses_built: 2, has_hotel: false }
  ownership[34] = { houses_built: 3, has_hotel: false }
  ownership[35] = { houses_built: 3, has_hotel: true }
  
  return ownership
})

const dummyPlayers = computed(() => {
  const players = {}
  // Add players to various spaces
  players[2] = [
    { player_id: 1, player_name: 'Alice' },
    { player_id: 2, player_name: 'Bob' }
  ]
  players[4] = [
    { player_id: 3, player_name: 'Charlie' }
  ]
  players[6] = [
    { player_id: 1, player_name: 'Alice' },
    { player_id: 4, player_name: 'Diana' }
  ]
  players[11] = [
    { player_id: 2, player_name: 'Bob' },
    { player_id: 3, player_name: 'Charlie' }
  ]
  players[15] = [
    { player_id: 4, player_name: 'Diana' }
  ]
  players[19] = [
    { player_id: 1, player_name: 'Alice' },
    { player_id: 2, player_name: 'Bob' },
    { player_id: 3, player_name: 'Charlie' }
  ]
  players[23] = [
    { player_id: 4, player_name: 'Diana' }
  ]
  players[29] = [
    { player_id: 1, player_name: 'Alice' },
    { player_id: 2, player_name: 'Bob' }
  ]
  players[33] = [
    { player_id: 3, player_name: 'Charlie' },
    { player_id: 4, player_name: 'Diana' }
  ]
  return players
})

const getOwnershipForSpace = (position) => {
  return dummyOwnership.value[position] || null
}

const getPlayersForSpace = (position) => {
  return dummyPlayers.value[position] || []
}
</script>

<style scoped>
.game-board {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
}

.board-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.board-row {
  display: flex;
  gap: 2px;
}

.top-row {
  flex-direction: row;
}

.bottom-row {
  flex-direction: row;
  align-items: end;
}

.board-middle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2px;
}

.board-column {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.left-column {
  flex-direction: column;
}

.right-column {
  flex-direction: column;
}

.board-center {
  width: fill-available;
  height: fill-available;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  margin: 0px 28px;
  padding: 0;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1);
}

.board-title {
  font-size: 36px;
  font-weight: bold;
  color: #1e3a8a;
  margin-bottom: 20px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.board-info {
  text-align: center;
  color: #333;
}

.board-info p {
  font-size: 16px;
  margin: 10px 0;
  line-height: 1.5;
}
</style>
