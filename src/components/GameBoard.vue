<template>
  <div class="game-board">
    <div class="board-container" ref="boardContainer" :style="{ transform: `scale(${scale})` }">
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
import { computed, defineProps, onMounted, onUnmounted, ref } from 'vue'
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


const getOwnershipForSpace = (position) => {
  // Use real ownership data from props
  const ownership = props.propertyOwnership.find(o => {
    const space = props.boardSpaces.find(s => s.position === position)
    return space && o.property_id === space.id
  })
  
  if (!ownership) return null
  
  return {
    houses_built: ownership.houses_count || 0,
    has_hotel: ownership.has_hotel || false
  }
}

const getPlayersForSpace = (position) => {
  // Use real player data from props
  return props.players.filter(p => p.position === position).map(p => ({
    player_id: p.player_id,
    player_name: p.name
  }))
}

const boardContainer = ref(null)
const scale = ref(1)

const updateScale = () => {
  if (!boardContainer.value) return
  const parent = boardContainer.value.parentElement
  if (!parent) return
  
  const containerWidth = parent.clientWidth - 40
  const containerHeight = parent.clientHeight - 40
  const boardWidth = boardContainer.value.scrollWidth
  const boardHeight = boardContainer.value.scrollHeight
  
  const scaleX = containerWidth / boardWidth
  const scaleY = containerHeight / boardHeight
  scale.value = Math.min(scaleX, scaleY, 1)
}

onMounted(() => {
  setTimeout(updateScale, 100)
  window.addEventListener('resize', updateScale)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
})
</script>

<style scoped>
.game-board {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: transparent;
  padding: 0;
}

.board-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 5px;
  transform-origin: center center;
  flex-shrink: 0;
}

.board-row {
  display: flex;
  gap: 2px;
}

.top-row {
  flex-direction: row;
  align-items: start;
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
