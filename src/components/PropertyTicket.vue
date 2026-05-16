<template>
  <div class="property-ticket" :class="[colorClass, { 'white-ticket': isWhiteTicket }]">
    <div class="ticket-header">
      <h2 class="property-name">{{ property.name }}</h2>
      <span v-if="!isWhiteTicket" class="flag fi" :class="flagClass"></span>
    </div>
    
    <div class="ticket-body">
      <div class="price-section">
        <div class="price-row">
          <span class="price-value">${{ formatMoney(property.base_price) }}</span>
        </div>
      </div>
      
      <div v-if="!isWhiteTicket" class="info-section">
        <div class="info-row">
          <span class="info-label">CAPITAL:</span>
          <span class="info-value">{{ getCapital(property.name) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">CURRENCY:</span>
          <span class="info-value">{{ getCurrency(property.name) }}</span>
        </div>
      </div>
      
      <div v-if="!isWhiteTicket" class="rent-section">
        <div class="section-title">RENT</div>
        <div class="rent-row">
          <span>Site only</span>
          <span>${{ formatMoney(property.base_rent) }}</span>
        </div>
        <div class="rent-row">
          <span>1 House</span>
          <span>${{ formatMoney(property.rent_1_house) }}</span>
        </div>
        <div class="rent-row">
          <span>2 Houses</span>
          <span>${{ formatMoney(property.rent_2_houses) }}</span>
        </div>
        <div class="rent-row">
          <span>3 Houses</span>
          <span>${{ formatMoney(property.rent_3_houses) }}</span>
        </div>
        <div class="rent-row">
          <span>Hotel</span>
          <span>${{ formatMoney(property.rent_hotel) }}</span>
        </div>
      </div>
      
      <div v-else class="white-rent-section">
        <span class="emoji">{{ getEmoji(property.name) }}</span>
        <div class="section-title">RENT</div>
        <div class="rent-row">
          <span>Base Rent</span>
          <span>${{ formatMoney(property.base_rent) }}</span>
        </div>
        <div class="rent-row bonus">
          <span>If you also own {{ getPairedProperty(property.name) }}</span>
          <span>${{ formatMoney(property.rent_1_house) }}</span>
        </div>
      </div>
      
      <div v-if="!isWhiteTicket" class="cost-section">
        <div class="section-title">UPGRADES</div>
        <div class="cost-row">
          <span>Cost of House</span>
          <span>${{ formatMoney(property.house_price) }}</span>
        </div>
        <div class="cost-row">
          <span>Cost of Hotel</span>
          <span>${{ formatMoney(property.hotel_price) }}</span>
        </div>
        <div class="cost-row mortgage">
          <span>BANK MORTGAGE VALUE</span>
          <span>${{ formatMoney(property.mortgage_value) }}</span>
        </div>
      </div>
      
      <div v-else class="white-cost-section">
        <div class="cost-row mortgage">
          <span>BANK MORTGAGE VALUE</span>
          <span>${{ formatMoney(property.mortgage_value) }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="!isWhiteTicket" class="ownership-rule">
      If a Player owns THREE sites of any colour-group, the rent is Doubled on unimproved sites in that group
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps} from 'vue'

const props = defineProps({
  property: {
    type: Object,
    required: true
  }
})

const colorClass = computed(() => {
  const colorMap = {
    'BLUE': 'blue',
    'RED': 'red',
    'GREEN': 'green',
    'YELLOW': 'yellow',
    'WHITE': 'white'
  }
  return colorMap[props.property.property_color] || 'blue'
})

const isWhiteTicket = computed(() => {
  return props.property.property_color === 'WHITE'
})

const flagClass = computed(() => {
  // Map property names to country codes for the 20 countries
  const flagMap = {
    'CANADA': 'fi-ca',
    'USA': 'fi-us',
    'AUSTRALIA': 'fi-au',
    'BRAZIL': 'fi-br',
    'MEXICO': 'fi-mx',
    'SWITZERLAND': 'fi-ch',
    'ENGLAND': 'fi-gb',
    'FRANCE': 'fi-fr',
    'ITALY': 'fi-it',
    'GERMANY': 'fi-de',
    'SAUDI ARABIA': 'fi-sa',
    'IRAN': 'fi-ir',
    'IRAQ': 'fi-iq',
    'MALAYSIA': 'fi-my',
    'EGYPT': 'fi-eg',
    'INDIA': 'fi-in',
    'HONGKONG': 'fi-hk',
    'SINGAPORE': 'fi-sg',
    'JAPAN': 'fi-jp',
    'CHINA': 'fi-cn'
  }
  return flagMap[props.property.name.toUpperCase()] || 'fi-un'
})

const formatMoney = (value) => {
  return Number(value).toLocaleString()
}

const getCapital = (name) => {
  const capitalMap = {
    'CANADA': 'OTTAWA',
    'USA': 'WASHINGTON D.C.',
    'AUSTRALIA': 'CANBERRA',
    'BRAZIL': 'BRASILIA',
    'MEXICO': 'MEXICO CITY',
    'SWITZERLAND': 'BERN',
    'ENGLAND': 'LONDON',
    'FRANCE': 'PARIS',
    'ITALY': 'ROME',
    'GERMANY': 'BERLIN',
    'SAUDI ARABIA': 'RIYADH',
    'IRAN': 'TEHRAN',
    'IRAQ': 'BAGHDAD',
    'MALAYSIA': 'KUALA LUMPUR',
    'EGYPT': 'CAIRO',
    'INDIA': 'NEW DELHI',
    'HONGKONG': 'HONG KONG',
    'SINGAPORE': 'SINGAPORE CITY',
    'JAPAN': 'TOKYO',
    'CHINA': 'BEIJING'
  }
  return capitalMap[name.toUpperCase()] || name.toUpperCase()
}

const getCurrency = (name) => {
  const currencyMap = {
    'CANADA': 'CANADIAN DOLLAR',
    'USA': 'US DOLLAR',
    'AUSTRALIA': 'AUSTRALIAN DOLLAR',
    'BRAZIL': 'BRAZILIAN REAL',
    'MEXICO': 'MEXICAN PESO',
    'SWITZERLAND': 'SWISS FRANC',
    'ENGLAND': 'BRITISH POUND',
    'FRANCE': 'EURO',
    'ITALY': 'EURO',
    'GERMANY': 'EURO',
    'SAUDI ARABIA': 'SAUDI RIYAL',
    'IRAN': 'IRANIAN RIAL',
    'IRAQ': 'IRAQI DINAR',
    'MALAYSIA': 'MALAYSIAN RINGGIT',
    'EGYPT': 'EGYPTIAN POUND',
    'INDIA': 'INDIAN RUPEE',
    'HONGKONG': 'HONG KONG DOLLAR',
    'SINGAPORE': 'SINGAPORE DOLLAR',
    'JAPAN': 'JAPANESE YEN',
    'CHINA': 'CHINESE YUAN'
  }
  return currencyMap[name.toUpperCase()] || 'LOCAL CURRENCY'
}

const getEmoji = (name) => {
  const emojiMap = {
    'RAILWAYS': '🚂',
    'ROADWAYS': '🚗',
    'AIRWAYS': '✈️',
    'PETROLEUM': '🛢️',
    'WATERWAYS': '🚢',
    'SATELLITE': '🛰️'
  }
  return emojiMap[name.toUpperCase()] || '🏢'
}

const getPairedProperty = (name) => {
  const pairMap = {
    'RAILWAYS': 'ROADWAYS',
    'ROADWAYS': 'RAILWAYS',
    'AIRWAYS': 'PETROLEUM',
    'PETROLEUM': 'AIRWAYS',
    'WATERWAYS': 'SATELLITE',
    'SATELLITE': 'WATERWAYS'
  }
  return pairMap[name.toUpperCase()] || ''
}
</script>

<style scoped>
@import 'flag-icons/css/flag-icons.min.css';

.property-ticket {
  width: 220px;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  font-family: 'Arial', sans-serif;
  color: #333;
  border: 3px solid #333;
}

.property-ticket.blue {
  background: linear-gradient(180deg, #1e3a8a 0%, #3b82f6 100%);
  color: #fbbf24;
  border-color: #1e40af;
}

.property-ticket.red {
  background: linear-gradient(180deg, #991b1b 0%, #ef4444 100%);
  color: #fbbf24;
  border-color: #991b1b;
}

.property-ticket.green {
  background: linear-gradient(180deg, #166534 0%, #22c55e 100%);
  color: #fbbf24;
  border-color: #166534;
}

.property-ticket.yellow {
  background: linear-gradient(180deg, #ca8a04 0%, #eab308 100%);
  color: #1e3a8a;
  border-color: #ca8a04;
}

.property-ticket.white {
  background: linear-gradient(180deg, #6b7280 0%, #9ca3af 100%);
  color: #fbbf24;
  border-color: #6b7280;
}

.white-ticket {
  /* min-height: 560px; */
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 2px solid rgba(251, 191, 36, 0.5);
  padding-bottom: 8px;
}

.property-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.flag {
  font-size: 32px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.emoji {
  font-size: 128px;
}

.ticket-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.price-section {
  margin-bottom: 8px;
}

.price-row {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.price-value {
  font-size: 28px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.info-section {
  margin-bottom: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 6px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 11px;
}

.info-label {
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-weight: bold;
  font-size: 12px;
}

.rent-section,
.cost-section,
.white-rent-section,
.white-cost-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-title {
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
  text-decoration: underline;
}

.rent-row,
.cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-weight: bold;
}

.rent-row.bonus {
  background: rgba(251, 191, 36, 0.3);
  font-size: 11px;
  padding: 6px 8px;
  line-height: 1.3;
}

.rent-value,
.cost-value {
  font-weight: bold;
  font-size: 14px;
}

.mortgage {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 2px dashed rgba(251, 191, 36, 0.5);
  font-style: italic;
}

.ownership-rule {
  padding: 8px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  font-size: 10px;
  font-style: italic;
  text-align: center;
  line-height: 1.3;
  border: 2px dashed rgba(251, 191, 36, 0.3);
}
</style>
