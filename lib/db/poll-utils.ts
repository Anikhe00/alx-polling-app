import { Poll, PollFormData, Vote } from '@/lib/types'
import { supabase } from '@/lib/supabase/client'

export async function getPolls() {
  try {
    // Get all polls with their options and vote counts
    const { data: polls, error } = await supabase
      .from('polls')
      .select(`
        id,
        title,
        description,
        creator_id,
        created_at,
        updated_at,
        end_date,
        status,
        type,
        is_anonymous,
        show_results,
        allow_multiple_votes,
        poll_options (id, text, votes),
        profiles!creator_id (name, avatar_url, email)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching polls:', error)
      return []
    }
    
    // Transform the data to match the expected format
    return polls.map(poll => {
      // Calculate total votes
      const totalVotes = poll.poll_options.reduce((sum, option) => sum + (option.votes || 0), 0)
      
      // Extract creator information
      const creatorProfile = poll.profiles && poll.profiles[0] ? poll.profiles[0] : { name: 'Unknown User', email: '', avatar_url: null };
      const creator = {
        id: poll.creator_id,
        name: creatorProfile.name || 'Unknown User',
        email: creatorProfile.email || '',
        avatar: creatorProfile.avatar_url,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        creatorId: poll.creator_id,
        creator,
        createdAt: poll.created_at,
        updatedAt: poll.updated_at || poll.created_at,
        endDate: poll.end_date,
        status: poll.status,
        type: poll.type,
        isAnonymous: poll.is_anonymous,
        showResults: poll.show_results,
        allowMultipleVotes: poll.allow_multiple_votes,
        totalVotes,
        options: poll.poll_options.map((option, index) => ({
          id: option.id,
          pollId: poll.id,
          text: option.text,
          votes: option.votes || 0,
          percentage: totalVotes > 0 ? Math.round((option.votes || 0) / totalVotes * 100) : 0,
          order: index
        }))
      }
    })
  } catch (error) {
    console.error('Unexpected error fetching polls:', error)
    return []
  }
}

export async function getPollById(id: string) {
  try {
    // Get the poll with its options and vote counts
    const { data: poll, error } = await supabase
      .from('polls')
      .select(`
        id,
        title,
        description,
        creator_id,
        created_at,
        updated_at,
        end_date,
        status,
        type,
        is_anonymous,
        show_results,
        allow_multiple_votes,
        poll_options (id, text, votes),
        profiles!creator_id (name, avatar_url, email)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching poll:', error)
      return null
    }
    
    // Calculate total votes
    const totalVotes = poll.poll_options.reduce((sum, option) => sum + (option.votes || 0), 0)
    
    // Calculate percentages for each option
    const optionsWithPercentages = poll.poll_options.map((option, index) => {
      const votes = option.votes || 0
      const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
      
      return {
        id: option.id,
        pollId: id,
        text: option.text,
        votes,
        percentage,
        order: index
      }
    })
    
    // Transform the data to match the expected format
    return {
      id: poll.id,
      title: poll.title,
      description: poll.description,
      creatorId: poll.creator_id,
      creator: {
        id: poll.creator_id,
        name: poll.profiles && poll.profiles[0]?.name || 'Anonymous',
        avatar: poll.profiles && poll.profiles[0]?.avatar_url,
        email: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      createdAt: poll.created_at,
      updatedAt: poll.updated_at || poll.created_at,
      endDate: poll.end_date,
      status: poll.status,
      type: poll.type,
      isAnonymous: poll.is_anonymous,
      showResults: poll.show_results,
      allowMultipleVotes: poll.allow_multiple_votes,
      totalVotes,
      options: optionsWithPercentages
    }
  } catch (error) {
    console.error('Unexpected error fetching poll:', error)
    return null
  }
}

export async function createPoll(data: PollFormData, userId: string) {
  try {
    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return {
        success: false,
        error: 'You must be logged in to create a poll'
      }
    }
    
    // Create the poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert([
        {
          title: data.title,
          description: data.description,
          creator_id: userId,
          type: data.type,
          is_anonymous: data.isAnonymous,
          show_results: data.showResults || true,
          allow_multiple_votes: data.allowMultipleVotes || false,
          end_date: data.endDate ? new Date(data.endDate).toISOString() : null,
          status: 'active'
        }
      ])
      .select()
      .single()
    
    if (pollError) {
      console.error('Poll creation error:', pollError)
      return {
        success: false,
        error: pollError.message
      }
    }
    
    // Create poll options
    const optionsToInsert = data.options.filter(option => option.trim() !== '').map((option, index) => ({
      poll_id: poll.id,
      text: option,
      order: index + 1
    }))
    
    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsToInsert)
    
    if (optionsError) {
      console.error('Poll options creation error:', optionsError)
      return {
        success: false,
        error: optionsError.message
      }
    }
    
    return {
      success: true,
      pollId: poll.id
    }
  } catch (error) {
    console.error('Unexpected error creating poll:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while creating the poll'
    }
  }
}

export async function updatePoll(id: string, data: Partial<PollFormData>) {
  // TODO: Implement actual database update
  console.log('Updating poll:', id, data)
  
  // Mock successful update
  return {
    success: true
  }
}

export async function deletePoll(id: string) {
  // TODO: Implement actual database delete
  console.log('Deleting poll:', id)
  
  // Mock successful deletion
  return {
    success: true
  }
}

export async function submitVote(pollId: string, optionId: string, userId?: string) {
  try {
    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return {
        success: false,
        error: 'You must be logged in to vote'
      }
    }
    
    // Check if user has already voted on this poll
    const { data: existingVotes, error: checkError } = await supabase
      .from('votes')
      .select('*')
      .eq('poll_id', pollId)
      .eq('user_id', session.user.id)
    
    if (checkError) {
      console.error('Error checking existing votes:', checkError)
      return {
        success: false,
        error: checkError.message
      }
    }
    
    // Get poll to check if multiple votes are allowed
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('allow_multiple_votes')
      .eq('id', pollId)
      .single()
    
    if (pollError) {
      console.error('Error fetching poll:', pollError)
      return {
        success: false,
        error: pollError.message
      }
    }
    
    // If user has already voted and multiple votes are not allowed
    if (existingVotes && existingVotes.length > 0 && !poll.allow_multiple_votes) {
      return {
        success: false,
        error: 'You have already voted on this poll'
      }
    }
    
    // Submit the vote
    const { error: voteError } = await supabase
      .from('votes')
      .insert([
        {
          poll_id: pollId,
          option_id: optionId,
          user_id: session.user.id
        }
      ])
    
    if (voteError) {
      console.error('Vote submission error:', voteError)
      return {
        success: false,
        error: voteError.message
      }
    }
    
    // Update the vote count for the option
    const { error: updateError } = await supabase.rpc('increment_option_votes', {
      option_id: optionId
    })
    
    if (updateError) {
      console.error('Error updating vote count:', updateError)
      // We don't return an error here as the vote was recorded successfully
    }
    
    return {
      success: true
    }
  } catch (error) {
    console.error('Unexpected error submitting vote:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while submitting your vote'
    }
  }
}

export async function getUserPolls(userId: string) {
  // TODO: Implement actual database query
  console.log('Fetching user polls:', userId)
  
  // Mock user polls data
  return [
    {
      id: '1',
      title: "What's your favorite programming language?",
      description: "A poll to determine the most popular programming language among developers.",
      creatorId: userId,
      creator: {
        id: userId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: '/placeholder-avatar.jpg'
      },
      type: 'single' as const,
      status: 'active' as const,
      isAnonymous: false,
      showResults: true,
      allowMultipleVotes: false,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      endDate: new Date('2024-02-15'),
      totalVotes: 1234,
      options: [
        { id: '1', pollId: '1', text: 'JavaScript', votes: 456, percentage: 37, order: 1 },
        { id: '2', pollId: '1', text: 'Python', votes: 345, percentage: 28, order: 2 },
      ]
    }
  ]
}
