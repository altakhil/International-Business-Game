<template>
  <div class="board-space" :class="[spaceClass, { 'corner': isCorner }]">
    <div class="space-name">{{ space.name }}</div>
    <div v-if="isProperty" class="space-price">${{ formatMoney(space.base_price) }}</div>
    
    <!-- Houses display -->
    <div v-if="ownership && ownership.houses_built > 0" class="houses-display">
      <span v-for="i in ownership.houses_built" :key="i" class="house">🏠</span>
    </div>
    
    <!-- Hotel display -->
    <div v-if="ownership && ownership.has_hotel" class="hotel-display">
      <span class="hotel">🏨</span>
    </div>
    
    <!-- Player pawns (positioned inward toward center) -->
    <div v-if="players.length > 0" class="players-display" :class="{
      'players-top': isTopRow,
      'players-bottom': isBottomRow,
      'players-left': isLeftColumn,
      'players-right': isRightColumn
    }">
      <span v-for="(player, index) in players" :key="player.player_id" 
            class="player-pawn" 
            :style="{ backgroundColor: getPlayerColor(index) }">
        {{ getPlayerInitial(player.player_name) }}
      </span>
    </div>
    
    <div v-if="space.space_type === 'chance'" class="space-icon">?</div>
    <div v-if="space.space_type === 'uno'" class="space-icon">UNO</div>
    <div v-if="space.space_type === 'jail'" class="space-icon">🔒</div>
    <div v-if="space.space_type === 'start'" class="space-icon">⬇️</div>
    <div v-if="space.space_type === 'party_house'" class="space-icon">🎉</div>
    <div v-if="space.space_type === 'travelling_duty'" class="space-icon">✈️</div>
    <div v-if="space.space_type === 'resort'" class="space-icon">🏨</div>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue'

const props = defineProps({
  space: {
    type: Object,
    required: true
  },
  ownership: {
    type: Object,
    default: null
  },
  players: {
    type: Array,
    default: () => []
  }
})

const isCorner = computed(() => {
  return [0, 9, 18, 27].includes(props.space.position)
})

const isTopRow = computed(() => {
  return props.space.position >= 1 && props.space.position <= 8
})

const isBottomRow = computed(() => {
  return props.space.position >= 19 && props.space.position <= 26
})

const isRightColumn = computed(() => {
  return props.space.position >= 10 && props.space.position <= 17
})

const isLeftColumn = computed(() => {
  return props.space.position >= 28 && props.space.position <= 35
})

const isProperty = computed(() => {
  return props.space.space_type === 'property'
})

const spaceClass = computed(() => {
  return `space-${props.space.space_type}`
})

const formatMoney = (value) => {
  return Number(value).toLocaleString()
}

const getPlayerColor = (index) => {
  const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b']
  return colors[index] || '#333'
}

const getPlayerInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : ''
}

</script>

<style scoped>
.board-space {
  width: 70px;
  height: 70px;
  border: 2px solid #333;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px;
  font-size: 9px;
  font-weight: bold;
  text-align: center;
  background: white;
  position: relative;
}

.board-space.corner {
  width: 100px;
  height: 100px;
  font-size: 12px;
}

.board-space.property {
  background: #f0f0f0;
}

.board-space.start {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.board-space.jail {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
}

.board-space.chance {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.board-space.uno {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
}

.board-space.party-house {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.board-space.travelling-duty {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
}

.board-space.resort {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
}

.board-space.roadways,
.board-space.airways,
.board-space.waterways,
.board-space.petroleum,
.board-space.railways,
.board-space.satellite {
  background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
  color: white;
}

.space-name {
  font-size: 10px;
  line-height: 1.1;
  margin-bottom: 2px;
  text-transform: uppercase;
}

.corner .space-name {
  font-size: 11px;
}

.space-price {
  font-size: 10px;
  color: #333;
  margin-top: 2px;
}

.space-color {
  width: 100%;
  height: 8px;
  margin-top: 4px;
  border-radius: 2px;
}

.space-icon {
  font-size: 32px;
  margin-top: 2px;
}

.houses-display {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  justify-content: center;
  margin-top: 2px;
}

.house {
  font-size: 10px;
  line-height: 1;
}

.hotel-display {
  display: flex;
  justify-content: center;
  margin-top: 2px;
}

.hotel {
  font-size: 12px;
  line-height: 1;
}

.players-display {
  display: flex;
  gap: 2px;
  justify-content: center;
  position: absolute;
  z-index: 10;
}

.players-top {
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  flex-direction: row;
}

.players-bottom {
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  flex-direction: row;
}

.players-left {
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  flex-direction: column;
}

.players-right {
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
  flex-direction: column;
}

.player-pawn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: bold;
  color: white;
  border: 2px solid #333;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
</style>
