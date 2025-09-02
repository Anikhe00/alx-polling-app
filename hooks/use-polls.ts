import { useState, useEffect } from 'react'
import { Poll, PollFormData } from '@/lib/types'
import { getPolls, getPollById, createPoll, updatePoll, deletePoll, getUserPolls } from '@/lib/db/poll-utils'

export function usePolls() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPolls = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPolls()
      if (Array.isArray(data)) {
        setPolls(data as Poll[])
      }
    } catch (err) {
      setError('Failed to fetch polls')
      console.error('Error fetching polls:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPollById = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPollById(id)
      return data
    } catch (err) {
      setError('Failed to fetch poll')
      console.error('Error fetching poll:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const createNewPoll = async (data: PollFormData, userId: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await createPoll(data, userId)
      
      if (result.success) {
        // Refresh polls list
        await fetchPolls()
        return { success: true, pollId: result.pollId }
      } else {
        return { success: false, error: 'Failed to create poll' }
      }
    } catch (err) {
      setError('Failed to create poll')
      console.error('Error creating poll:', err)
      return { success: false, error: 'Failed to create poll' }
    } finally {
      setLoading(false)
    }
  }

  const updateExistingPoll = async (id: string, data: Partial<PollFormData>) => {
    try {
      setLoading(true)
      setError(null)
      const result = await updatePoll(id, data)
      
      if (result.success) {
        // Refresh polls list
        await fetchPolls()
        return { success: true }
      } else {
        return { success: false, error: 'Failed to update poll' }
      }
    } catch (err) {
      setError('Failed to update poll')
      console.error('Error updating poll:', err)
      return { success: false, error: 'Failed to update poll' }
    } finally {
      setLoading(false)
    }
  }

  const deleteExistingPoll = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await deletePoll(id)
      
      if (result.success) {
        // Remove from local state
        setPolls(prev => prev.filter(poll => poll.id !== id))
        return { success: true }
      } else {
        return { success: false, error: 'Failed to delete poll' }
      }
    } catch (err) {
      setError('Failed to delete poll')
      console.error('Error deleting poll:', err)
      return { success: false, error: 'Failed to delete poll' }
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPolls = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUserPolls(userId)
      return data
    } catch (err) {
      setError('Failed to fetch user polls')
      console.error('Error fetching user polls:', err)
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPolls()
  }, [])

  return {
    polls,
    loading,
    error,
    fetchPolls,
    fetchPollById,
    createNewPoll,
    updateExistingPoll,
    deleteExistingPoll,
    fetchUserPolls
  }
}
