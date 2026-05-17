<template>
  <div class="dice-roll">
    <div class="dice-container" :class="{ rolling: isRolling }">
      <div class="dice" :class="`face-${displayValue}`">
        <div class="dot" v-for="n in displayValue" :key="n"></div>
      </div>
    </div>
    <button 
      class="roll-button" 
      @click="$emit('roll')" 
      :disabled="!isMyTurn || isRolling"
    >
      {{ isRolling ? 'Rolling...' : 'Roll Dice' }}
    </button>
  </div>
</template>

<script setup>
/* eslint-disable */
import { ref, watch } from 'vue'

const props = defineProps({
  isMyTurn: Boolean,
  diceValue: Number
})

defineEmits(['roll'])

const displayValue = ref(1)
const isRolling = ref(false)

watch(() => props.diceValue, (newValue) => {
  if (newValue) {
    isRolling.value = true
    animateRoll(newValue)
  }
})

const animateRoll = (finalValue) => {
  let rolls = 0
  const maxRolls = 10
  const interval = setInterval(() => {
    displayValue.value = Math.floor(Math.random() * 6) + 1
    rolls++
    
    if (rolls >= maxRolls) {
      clearInterval(interval)
      displayValue.value = finalValue
      isRolling.value = false
    }
  }, 100)
}
</script>

<style scoped>
.dice-roll {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.dice-container {
  perspective: 1000px;
}

.dice {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px;
  transition: transform 0.3s;
}

.dice.rolling {
  animation: roll 0.5s ease-in-out infinite;
}

@keyframes roll {
  0% { transform: rotateX(0deg) rotateY(0deg); }
  25% { transform: rotateX(90deg) rotateY(90deg); }
  50% { transform: rotateX(180deg) rotateY(180deg); }
  75% { transform: rotateX(270deg) rotateY(270deg); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
}

.dot {
  width: 16px;
  height: 16px;
  background: #1e3a8a;
  border-radius: 50%;
}

.roll-button {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transition: all 0.3s;
}

.roll-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.roll-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
