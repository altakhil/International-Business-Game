import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/config/supabase'

export const useBoardSpacesStore = defineStore('boardSpaces', () => {
  const boardSpaces = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchBoardSpaces = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('board_spaces')
        .select('*')
        .order('position', { ascending: true })
      
      if (fetchError) throw fetchError
      boardSpaces.value = data
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch board spaces:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchBoardSpaceById = async (spaceId) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('board_spaces')
        .select('*')
        .eq('space_id', spaceId)
        .single()
      
      if (fetchError) throw fetchError
      return data
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch board space:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    boardSpaces,
    loading,
    error,
    fetchBoardSpaces,
    fetchBoardSpaceById
  }
})
