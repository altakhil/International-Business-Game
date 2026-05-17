import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/config/supabase'

export const useGameStore = defineStore('game', () => {
  // State
  const game = ref(null)
  const players = ref([])
  const propertyOwnership = ref([])
  const transactions = ref([])
  const biddingSessions = ref([])
  const bids = ref([])
  const gameEvents = ref([])
  
  const loading = ref(false)
  const error = ref(null)
  
  // Subscription references for cleanup
  let gameSubscription = null
  let playersSubscription = null
  let ownershipSubscription = null
  let transactionsSubscription = null
  let biddingSubscription = null
  let eventsSubscription = null

  // Computed
  const currentPlayer = computed(() => {
    if (!game.value || !players.value.length) return null
    return players.value.find(p => p.player_id === game.value.current_player_turn_id)
  })

  const totalMoneyInGame = computed(() => {
    return players.value.reduce((sum, player) => sum + parseFloat(player.money || 0), 0)
  })

  const activeBiddingSession = computed(() => {
    return biddingSessions.value.find(session => session.status === 'active')
  })

  // ============================================
  // GAME OPERATIONS
  // ============================================

  const createGame = async (gameData) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: err } = await supabase
        .from('games')
        .insert({
          max_players: gameData.max_players || 4,
          join_code: gameData.join_code,
          starting_money_per_player: calculateStartingMoney(gameData.max_players || 4),
          status: 'waiting_for_players'
        })
        .select()
        .single()
      
      if (err) throw err
      game.value = data
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error creating game:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchGame = async (gameId) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: err } = await supabase
        .from('games')
        .select('*')
        .eq('game_id', gameId)
        .single()
      
      if (err) throw err
      game.value = data
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching game:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchGameByJoinCode = async (joinCode) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: err } = await supabase
        .from('games')
        .select('*')
        .eq('join_code', joinCode)
        .single()
      
      if (err) throw err
      game.value = data
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching game by join code:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateGame = async (updates) => {
    if (!game.value) return
    
    try {
      const { data, error: err } = await supabase
        .from('games')
        .update(updates)
        .eq('game_id', game.value.game_id)
        .select()
        .single()
      
      if (err) throw err
      game.value = data
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error updating game:', err)
      throw err
    }
  }

  const startGame = async () => {
    if (!game.value) return
    
    // Set first player as current turn if not already set
    if (!game.value.current_player_turn_id && players.value.length > 0) {
      const firstPlayer = players.value[0]
      await updateGame({
        status: 'in_progress',
        started_at: new Date().toISOString(),
        current_player_turn_id: firstPlayer.player_id
      })
    } else {
      await updateGame({
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
    }
  }

  const endGame = async () => {
    if (!game.value) return
    
    return updateGame({
      status: 'finished',
      finished_at: new Date().toISOString()
    })
  }

  const setCurrentPlayerTurn = async (playerId) => {
    return updateGame({ current_player_turn_id: playerId })
  }

  const setCurrentDiceRoll = async (roll) => {
    return updateGame({ current_dice_roll: roll })
  }

  const updateTurnOrder = async (turnOrder) => {
    return updateGame({ turn_order: turnOrder })
  }

  // ============================================
  // PLAYER OPERATIONS
  // ============================================

  const joinGame = async (gameId, playerName, isHost = false) => {
    loading.value = true
    error.value = null
    
    try {
      const { data: gameData } = await supabase
        .from('games')
        .select('max_players, starting_money_per_player')
        .eq('game_id', gameId)
        .single()
      
      const currentPlayers = await supabase
        .from('players')
        .select('order_in_turn')
        .eq('game_id', gameId)
      
      const nextOrder = currentPlayers.data.length + 1
      
      const { data, error: err } = await supabase
        .from('players')
        .insert({
          game_id: gameId,
          name: playerName,
          money: gameData.starting_money_per_player,
          position: 0,
          is_host: isHost,
          order_in_turn: nextOrder
        })
        .select()
        .single()
      
      if (err) throw err
      players.value.push(data)
      
      // If host, update game and set as current turn
      if (isHost) {
        await updateGame({ 
          host_player_id: data.player_id,
          current_player_turn_id: data.player_id 
        })
      }
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error joining game:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPlayers = async (gameId) => {
    try {
      const { data, error: err } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameId)
        .order('order_in_turn')
      
      if (err) throw err
      players.value = data
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching players:', err)
      throw err
    }
  }

  const updatePlayer = async (playerId, updates) => {
    try {
      const { data, error: err } = await supabase
        .from('players')
        .update(updates)
        .eq('player_id', playerId)
        .select()
        .single()
      
      if (err) throw err
      
      // Update local state
      const index = players.value.findIndex(p => p.player_id === playerId)
      if (index !== -1) {
        players.value[index] = data
      }
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error updating player:', err)
      throw err
    }
  }

  const movePlayer = async (playerId, newPosition) => {
    return updatePlayer(playerId, { position: newPosition })
  }

  const updatePlayerMoney = async (playerId, amount) => {
    const player = players.value.find(p => p.player_id === playerId)
    if (!player) return
    
    const newMoney = parseFloat(player.money) + amount
    return updatePlayer(playerId, { money: newMoney })
  }

  const sendPlayerToJail = async (playerId) => {
    return updatePlayer(playerId, {
      in_jail: true,
      jail_turns_left: 3,
      position: 10 // Assuming position 10 is jail
    })
  }

  const releasePlayerFromJail = async (playerId) => {
    return updatePlayer(playerId, {
      in_jail: false,
      jail_turns_left: 0
    })
  }

  const useGetOutOfJailFreeCard = async (playerId) => {
    const player = players.value.find(p => p.player_id === playerId)
    if (!player || player.get_out_of_jail_free_cards <= 0) return
    
    return updatePlayer(playerId, {
      get_out_of_jail_free_cards: player.get_out_of_jail_free_cards - 1
    })
  }

  const declareBankruptcy = async (playerId) => {
    return updatePlayer(playerId, { is_bankrupt: true })
  }

  // ============================================
  // PROPERTY OWNERSHIP OPERATIONS
  // ============================================

  const purchaseProperty = async (gameId, propertyId, playerId, price) => {
    loading.value = true
    error.value = null
    
    try {
      // Deduct money from player
      await updatePlayerMoney(playerId, -price)
      
      // Create ownership record
      const { data, error: err } = await supabase
        .from('property_ownership')
        .insert({
          property_id: propertyId,
          player_id: playerId,
          game_id: gameId,
          houses_count: 0,
          has_hotel: false,
          is_mortgaged: false
        })
        .select()
        .single()
      
      if (err) throw err
      propertyOwnership.value.push(data)
      
      // Log transaction
      await createTransaction(gameId, playerId, null, 'property_purchase', price, propertyId)
      
      // Log event
      await createGameEvent(gameId, playerId, 'property_purchase', { property_id: propertyId, price })
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error purchasing property:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPropertyOwnership = async (gameId) => {
    try {
      const { data, error: err } = await supabase
        .from('property_ownership')
        .select('*')
        .eq('game_id', gameId)
      
      if (err) throw err
      propertyOwnership.value = data
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching property ownership:', err)
      throw err
    }
  }

  const buildHouse = async (ownershipId, playerId, cost) => {
    const ownership = propertyOwnership.value.find(o => o.ownership_id === ownershipId)
    if (!ownership || ownership.houses_count >= 3) return
    
    await updatePlayerMoney(playerId, -cost)
    
    const { data, error: err } = await supabase
      .from('property_ownership')
      .update({ houses_count: ownership.houses_count + 1 })
      .eq('ownership_id', ownershipId)
      .select()
      .single()
    
    if (err) throw err
    
    // Update local state
    const index = propertyOwnership.value.findIndex(o => o.ownership_id === ownershipId)
    if (index !== -1) {
      propertyOwnership.value[index] = data
    }
    
    await createTransaction(game.value.game_id, playerId, null, 'house_purchase', cost, ownership.property_id)
    await createGameEvent(game.value.game_id, playerId, 'house_purchase', { ownership_id: ownershipId, cost })
    
    return data
  }

  const buildHotel = async (ownershipId, playerId, cost) => {
    const ownership = propertyOwnership.value.find(o => o.ownership_id === ownershipId)
    if (!ownership || ownership.houses_count !== 3 || ownership.has_hotel) return
    
    await updatePlayerMoney(playerId, -cost)
    
    const { data, error: err } = await supabase
      .from('property_ownership')
      .update({ has_hotel: true })
      .eq('ownership_id', ownershipId)
      .select()
      .single()
    
    if (err) throw err
    
    // Update local state
    const index = propertyOwnership.value.findIndex(o => o.ownership_id === ownershipId)
    if (index !== -1) {
      propertyOwnership.value[index] = data
    }
    
    await createTransaction(game.value.game_id, playerId, null, 'hotel_purchase', cost, ownership.property_id)
    await createGameEvent(game.value.game_id, playerId, 'hotel_purchase', { ownership_id: ownershipId, cost })
    
    return data
  }

  const mortgageProperty = async (ownershipId, playerId, mortgageValue) => {
    const ownership = propertyOwnership.value.find(o => o.ownership_id === ownershipId)
    if (!ownership) return
    
    await updatePlayerMoney(playerId, mortgageValue)
    
    const { data, error: err } = await supabase
      .from('property_ownership')
      .update({ is_mortgaged: true })
      .eq('ownership_id', ownershipId)
      .select()
      .single()
    
    if (err) throw err
    
    const index = propertyOwnership.value.findIndex(o => o.ownership_id === ownershipId)
    if (index !== -1) {
      propertyOwnership.value[index] = data
    }
    
    await createTransaction(game.value.game_id, null, playerId, 'mortgage', mortgageValue, ownership.property_id)
    await createGameEvent(game.value.game_id, playerId, 'mortgage', { ownership_id: ownershipId, amount: mortgageValue })
    
    return data
  }

  const unmortgageProperty = async (ownershipId, playerId, cost) => {
    const ownership = propertyOwnership.value.find(o => o.ownership_id === ownershipId)
    if (!ownership) return
    
    await updatePlayerMoney(playerId, -cost)
    
    const { data, error: err } = await supabase
      .from('property_ownership')
      .update({ is_mortgaged: false })
      .eq('ownership_id', ownershipId)
      .select()
      .single()
    
    if (err) throw err
    
    const index = propertyOwnership.value.findIndex(o => o.ownership_id === ownershipId)
    if (index !== -1) {
      propertyOwnership.value[index] = data
    }
    
    await createTransaction(game.value.game_id, playerId, null, 'unmortgage', cost, ownership.property_id)
    await createGameEvent(game.value.game_id, playerId, 'unmortgage', { ownership_id: ownershipId, amount: cost })
    
    return data
  }

  // ============================================
  // TRANSACTION OPERATIONS
  // ============================================

  const createTransaction = async (gameId, fromPlayerId, toPlayerId, type, amount, propertyId = null, description = null) => {
    try {
      const { data, error: err } = await supabase
        .from('transactions')
        .insert({
          game_id: gameId,
          from_player_id: fromPlayerId,
          to_player_id: toPlayerId,
          transaction_type: type,
          amount: amount,
          property_id: propertyId,
          description: description
        })
        .select()
        .single()
      
      if (err) throw err
      transactions.value.push(data)
      return data
    } catch (err) {
      console.error('Error creating transaction:', err)
      throw err
    }
  }

  const payRent = async (gameId, fromPlayerId, toPlayerId, amount, propertyId) => {
    await updatePlayerMoney(fromPlayerId, -amount)
    await updatePlayerMoney(toPlayerId, amount)
    
    await createTransaction(gameId, fromPlayerId, toPlayerId, 'rent_payment', amount, propertyId)
    await createGameEvent(gameId, fromPlayerId, 'rent_paid', { to_player_id: toPlayerId, amount, property_id: propertyId })
  }

  const fetchTransactions = async (gameId) => {
    try {
      const { data, error: err } = await supabase
        .from('transactions')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })
      
      if (err) throw err
      transactions.value = data
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching transactions:', err)
      throw err
    }
  }

  // ============================================
  // BIDDING OPERATIONS
  // ============================================

  const startBiddingSession = async (gameId, propertyId, sellerPlayerId = null, minimumBid) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: err } = await supabase
        .from('bidding_sessions')
        .insert({
          game_id: gameId,
          property_id: propertyId,
          seller_player_id: sellerPlayerId,
          status: 'active',
          minimum_bid: minimumBid,
          current_highest_bid: minimumBid
        })
        .select()
        .single()
      
      if (err) throw err
      biddingSessions.value.push(data)
      
      await createGameEvent(gameId, sellerPlayerId, 'bidding_started', { bidding_id: data.bidding_id, property_id: propertyId })
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error starting bidding session:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const placeBid = async (biddingId, playerId, bidAmount) => {
    try {
      const session = biddingSessions.value.find(s => s.bidding_id === biddingId)
      if (!session || bidAmount <= session.current_highest_bid) {
        throw new Error('Bid must be higher than current highest bid')
      }
      
      // Deduct money from player (will be refunded if they lose)
      await updatePlayerMoney(playerId, -bidAmount)
      
      // Refund previous highest bidder
      if (session.current_highest_bidder_id) {
        await updatePlayerMoney(session.current_highest_bidder_id, session.current_highest_bid)
      }
      
      const { data, error: err } = await supabase
        .from('bidding_sessions')
        .update({
          current_highest_bid: bidAmount,
          current_highest_bidder_id: playerId
        })
        .eq('bidding_id', biddingId)
        .select()
        .single()
      
      if (err) throw err
      
      // Update local state
      const index = biddingSessions.value.findIndex(s => s.bidding_id === biddingId)
      if (index !== -1) {
        biddingSessions.value[index] = data
      }
      
      // Record bid
      await supabase.from('bids').insert({
        bidding_id: biddingId,
        player_id: playerId,
        bid_amount: bidAmount
      })
      
      await createGameEvent(game.value.game_id, playerId, 'bid_placed', { bidding_id: biddingId, amount: bidAmount })
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error placing bid:', err)
      throw err
    }
  }

  const endBiddingSession = async (biddingId, winnerId) => {
    try {
      const session = biddingSessions.value.find(s => s.bidding_id === biddingId)
      if (!session) return
      
      const { data, error: err } = await supabase
        .from('bidding_sessions')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('bidding_id', biddingId)
        .select()
        .single()
      
      if (err) throw err
      
      // Update local state
      const index = biddingSessions.value.findIndex(s => s.bidding_id === biddingId)
      if (index !== -1) {
        biddingSessions.value[index] = data
      }
      
      // Transfer property to winner
      if (winnerId && session.current_highest_bidder_id === winnerId) {
        await purchaseProperty(game.value.game_id, session.property_id, winnerId, session.current_highest_bid)
      }
      
      await createGameEvent(game.value.game_id, winnerId, 'bidding_ended', { bidding_id: biddingId, winner_id: winnerId })
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error ending bidding session:', err)
      throw err
    }
  }

  const fetchBiddingSessions = async (gameId) => {
    try {
      const { data, error: err } = await supabase
        .from('bidding_sessions')
        .select('*')
        .eq('game_id', gameId)
        .order('started_at', { ascending: false })
      
      if (err) throw err
      biddingSessions.value = data
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching bidding sessions:', err)
      throw err
    }
  }

  // ============================================
  // GAME EVENTS OPERATIONS
  // ============================================

  const createGameEvent = async (gameId, playerId, eventType, eventData) => {
    try {
      const { data, error: err } = await supabase
        .from('game_events')
        .insert({
          game_id: gameId,
          player_id: playerId,
          event_type: eventType,
          event_data: eventData
        })
        .select()
        .single()
      
      if (err) throw err
      gameEvents.value.push(data)
      return data
    } catch (err) {
      console.error('Error creating game event:', err)
      throw err
    }
  }

  const fetchGameEvents = async (gameId) => {
    try {
      const { data, error: err } = await supabase
        .from('game_events')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (err) throw err
      gameEvents.value = data
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching game events:', err)
      throw err
    }
  }

  // ============================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================

  const subscribeToGame = (gameId) => {
    if (gameSubscription) gameSubscription.unsubscribe()
    
    console.log(`[Game Store] Subscribing to game ${gameId}`)
    
    gameSubscription = supabase
      .channel(`game-${gameId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `game_id=eq.${gameId}`
      }, (payload) => {
        console.log('[Game Store] Game subscription received:', payload)
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          game.value = payload.new
        }
      })
      .subscribe((status) => {
        console.log('[Game Store] Game subscription status:', status)
      })
  }

  const subscribeToPlayers = (gameId) => {
    if (playersSubscription) playersSubscription.unsubscribe()
    
    console.log(`[Game Store] Subscribing to players for game ${gameId}`)
    
    playersSubscription = supabase
      .channel(`players-${gameId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `game_id=eq.${gameId}`
      }, (payload) => {
        console.log('[Game Store] Players subscription received:', payload)
        if (payload.eventType === 'INSERT') {
          console.log('[Game Store] New player joined:', payload.new)
          players.value.push(payload.new)
        } else if (payload.eventType === 'UPDATE') {
          console.log('[Game Store] Player updated:', payload.new)
          const index = players.value.findIndex(p => p.player_id === payload.new.player_id)
          if (index !== -1) {
            players.value[index] = payload.new
          }
        } else if (payload.eventType === 'DELETE') {
          console.log('[Game Store] Player left:', payload.old)
          players.value = players.value.filter(p => p.player_id !== payload.old.player_id)
        }
      })
      .subscribe((status) => {
        console.log('[Game Store] Players subscription status:', status)
      })
  }

  const subscribeToPropertyOwnership = (gameId) => {
    if (ownershipSubscription) ownershipSubscription.unsubscribe()
    
    console.log(`[Game Store] Subscribing to property ownership for game ${gameId}`)
    
    ownershipSubscription = supabase
      .channel(`ownership-${gameId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'property_ownership',
        filter: `game_id=eq.${gameId}`
      }, (payload) => {
        console.log('[Game Store] Property ownership subscription received:', payload)
        if (payload.eventType === 'INSERT') {
          propertyOwnership.value.push(payload.new)
        } else if (payload.eventType === 'UPDATE') {
          const index = propertyOwnership.value.findIndex(o => o.ownership_id === payload.new.ownership_id)
          if (index !== -1) {
            propertyOwnership.value[index] = payload.new
          }
        } else if (payload.eventType === 'DELETE') {
          propertyOwnership.value = propertyOwnership.value.filter(o => o.ownership_id !== payload.old.ownership_id)
        }
      })
      .subscribe((status) => {
        console.log('[Game Store] Property ownership subscription status:', status)
      })
  }

  const subscribeToTransactions = (gameId) => {
    if (transactionsSubscription) transactionsSubscription.unsubscribe()
    
    console.log(`[Game Store] Subscribing to transactions for game ${gameId}`)
    
    transactionsSubscription = supabase
      .channel(`transactions-${gameId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: `game_id=eq.${gameId}`
      }, (payload) => {
        console.log('[Game Store] Transactions subscription received:', payload)
        transactions.value.unshift(payload.new)
      })
      .subscribe((status) => {
        console.log('[Game Store] Transactions subscription status:', status)
      })
  }

  const subscribeToBiddingSessions = (gameId) => {
    if (biddingSubscription) biddingSubscription.unsubscribe()
    
    console.log(`[Game Store] Subscribing to bidding sessions for game ${gameId}`)
    
    biddingSubscription = supabase
      .channel(`bidding-${gameId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bidding_sessions',
        filter: `game_id=eq.${gameId}`
      }, (payload) => {
        console.log('[Game Store] Bidding sessions subscription received:', payload)
        if (payload.eventType === 'INSERT') {
          biddingSessions.value.push(payload.new)
        } else if (payload.eventType === 'UPDATE') {
          const index = biddingSessions.value.findIndex(s => s.bidding_id === payload.new.bidding_id)
          if (index !== -1) {
            biddingSessions.value[index] = payload.new
          }
        }
      })
      .subscribe((status) => {
        console.log('[Game Store] Bidding sessions subscription status:', status)
      })
  }

  const subscribeToGameEvents = (gameId) => {
    if (eventsSubscription) eventsSubscription.unsubscribe()
    
    console.log(`[Game Store] Subscribing to game events for game ${gameId}`)
    
    eventsSubscription = supabase
      .channel(`events-${gameId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'game_events',
        filter: `game_id=eq.${gameId}`
      }, (payload) => {
        console.log('[Game Store] Game events subscription received:', payload)
        gameEvents.value.unshift(payload.new)
      })
      .subscribe((status) => {
        console.log('[Game Store] Game events subscription status:', status)
      })
  }

  const subscribeToAll = (gameId) => {
    subscribeToGame(gameId)
    subscribeToPlayers(gameId)
    subscribeToPropertyOwnership(gameId)
    subscribeToTransactions(gameId)
    subscribeToBiddingSessions(gameId)
    subscribeToGameEvents(gameId)
  }

  const unsubscribeAll = () => {
    if (gameSubscription) gameSubscription.unsubscribe()
    if (playersSubscription) playersSubscription.unsubscribe()
    if (ownershipSubscription) ownershipSubscription.unsubscribe()
    if (transactionsSubscription) transactionsSubscription.unsubscribe()
    if (biddingSubscription) biddingSubscription.unsubscribe()
    if (eventsSubscription) eventsSubscription.unsubscribe()
    
    gameSubscription = null
    playersSubscription = null
    ownershipSubscription = null
    transactionsSubscription = null
    biddingSubscription = null
    eventsSubscription = null
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const calculateStartingMoney = (maxPlayers) => {
    // Scale starting money based on player count
    const baseMoney = 1500
    switch (maxPlayers) {
      case 2: return baseMoney * 1.5
      case 3: return baseMoney * 1.2
      case 4: return baseMoney
      case 5: return baseMoney * 0.9
      case 6: return baseMoney * 0.8
      default: return baseMoney
    }
  }

  const initializeGame = async (gameId) => {
    await Promise.all([
      fetchGame(gameId),
      fetchPlayers(gameId),
      fetchPropertyOwnership(gameId),
      fetchTransactions(gameId),
      fetchBiddingSessions(gameId),
      fetchGameEvents(gameId)
    ])
    
    subscribeToAll(gameId)
  }

  const resetStore = () => {
    game.value = null
    players.value = []
    propertyOwnership.value = []
    transactions.value = []
    biddingSessions.value = []
    bids.value = []
    gameEvents.value = []
    error.value = null
    unsubscribeAll()
  }

  return {
    // State
    game,
    players,
    propertyOwnership,
    transactions,
    biddingSessions,
    bids,
    gameEvents,
    loading,
    error,
    
    // Computed
    currentPlayer,
    totalMoneyInGame,
    activeBiddingSession,
    
    // Game operations
    createGame,
    fetchGame,
    fetchGameByJoinCode,
    updateGame,
    startGame,
    endGame,
    setCurrentPlayerTurn,
    setCurrentDiceRoll,
    updateTurnOrder,
    
    // Player operations
    joinGame,
    fetchPlayers,
    updatePlayer,
    movePlayer,
    updatePlayerMoney,
    sendPlayerToJail,
    releasePlayerFromJail,
    useGetOutOfJailFreeCard,
    declareBankruptcy,
    
    // Property ownership operations
    purchaseProperty,
    fetchPropertyOwnership,
    buildHouse,
    buildHotel,
    mortgageProperty,
    unmortgageProperty,
    
    // Transaction operations
    createTransaction,
    payRent,
    fetchTransactions,
    
    // Bidding operations
    startBiddingSession,
    placeBid,
    endBiddingSession,
    fetchBiddingSessions,
    
    // Game events operations
    createGameEvent,
    fetchGameEvents,
    
    // Real-time subscriptions
    subscribeToGame,
    subscribeToPlayers,
    subscribeToPropertyOwnership,
    subscribeToTransactions,
    subscribeToBiddingSessions,
    subscribeToGameEvents,
    subscribeToAll,
    unsubscribeAll,
    
    // Utility
    initializeGame,
    resetStore
  }
})