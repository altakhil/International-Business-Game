<template>
  <div class="game-board-view">
    <div v-if="loading" class="loading">
      Loading board...
    </div>
    
    <div v-else-if="error" class="error">
      Error loading board: {{ error }}
    </div>
    
    <GameBoard 
      v-else 
      :boardSpaces="boardSpaces" 
    />
  </div>
</template>

<script setup>
import GameBoard from '@/components/GameBoard.vue'
import { useBoardSpacesStore } from '@/stores/boardSpaces'

const boardSpacesStore = useBoardSpacesStore()

const { boardSpaces, loading, error } = boardSpacesStore
</script>

<style scoped>
.game-board-view {
  min-height: 100vh;
}

.loading,
.error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 24px;
  color: white;
}

.error {
  color: #ef4444;
}
</style>
