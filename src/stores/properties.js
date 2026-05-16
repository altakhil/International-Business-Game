import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/config/supabase'

export const usePropertiesStore = defineStore('properties', () => {
  const properties = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetch all properties
  const fetchProperties = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: err } = await supabase
        .from('properties')
        .select(`
          *,
          board_spaces (
            position,
            name,
            space_type
          )
        `)
      
      if (err) throw err
      properties.value = data
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching properties:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch a single property by ID
  const fetchPropertyById = async (propertyId) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: err } = await supabase
        .from('properties')
        .select(`
          *,
          board_spaces (
            position,
            name,
            space_type
          )
        `)
        .eq('property_id', propertyId)
        .single()
      
      if (err) throw err
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching property:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch properties by color
  const fetchPropertiesByColor = async (color) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: err } = await supabase
        .from('properties')
        .select(`
          *,
          board_spaces (
            position,
            name,
            space_type
          )
        `)
        .eq('property_color', color)
      
      if (err) throw err
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching properties by color:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    properties,
    loading,
    error,
    fetchProperties,
    fetchPropertyById,
    fetchPropertiesByColor
  }
})
