import { Poll, PollFormData, Vote } from "@/lib/types";
import { supabase } from '@/lib/supabase/client'

export async function getPolls() {
  console.log('Fetching polls from Supabase');
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

    if (!polls || polls.length === 0) {
      console.log('No polls found in database');
      return [];
    }

    console.log(`Found ${polls.length} polls in database`);

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
  console.log("Fetching poll with id:", id);
  try {
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
      .single();

    if (error) {
      console.error('Error fetching poll:', error);
      return null;
    }

    if (!poll) {
      console.log('Poll not found');
      return null;
    }

    // Calculate total votes
    const totalVotes = poll.poll_options.reduce((sum, option) => sum + (option.votes || 0), 0);

    // Extract creator information
    // Handle the case where profiles could be an array or an object
    const creatorProfile = Array.isArray(poll.profiles) && poll.profiles.length > 0 
      ? poll.profiles[0] 
      : (poll.profiles || { name: 'Unknown User', email: '', avatar_url: null });
      
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
    };
  } catch (error) {
    console.error('Unexpected error fetching poll:', error);
    return null;
  }
}

export async function createPoll(data: PollFormData, userId: string) {
  console.log("Creating poll in Supabase:", { data, userId });
  
  try {
    // Start a transaction to create the poll and its options
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title: data.title,
        description: data.description,
        creator_id: userId,
        type: data.type,
        is_anonymous: data.isAnonymous,
        show_results: data.showResults,
        allow_multiple_votes: data.allowMultipleVotes,
        end_date: data.endDate,
        status: 'active'
      })
      .select('id')
      .single();

    if (pollError) {
      console.error('Error creating poll:', pollError);
      return {
        success: false,
        error: pollError.message
      };
    }

    // Create poll options
    const pollOptions = data.options.map((option, index) => ({
      poll_id: poll.id,
      text: typeof option === 'string' ? option : option.text,
      votes: 0,
      order: index
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(pollOptions);

    if (optionsError) {
      console.error('Error creating poll options:', optionsError);
      // Consider deleting the poll if options creation fails
      await supabase.from('polls').delete().eq('id', poll.id);
      return {
        success: false,
        error: optionsError.message
      };
    }

    return {
      success: true,
      pollId: poll.id
    };
  } catch (error) {
    console.error('Unexpected error creating poll:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

export async function updatePoll(id: string, data: Partial<PollFormData> & { status?: 'draft' | 'active' | 'ended' }) {
  console.log("Updating poll in Supabase:", id, data);

  try {
    // Update the poll details
    const updateData: Record<string, any> = {};
    
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.type) updateData.type = data.type;
    if (data.isAnonymous !== undefined) updateData.is_anonymous = data.isAnonymous;
    if (data.showResults !== undefined) updateData.show_results = data.showResults;
    if (data.allowMultipleVotes !== undefined) updateData.allow_multiple_votes = data.allowMultipleVotes;
    if (data.endDate) updateData.end_date = data.endDate;
    if (data.status) updateData.status = data.status;
    
    const { error: pollError } = await supabase
      .from('polls')
      .update(updateData)
      .eq('id', id);

    if (pollError) {
      console.error('Error updating poll:', pollError);
      return {
        success: false,
        error: pollError.message
      };
    }

    // If options are provided, update them
    if (data.options && data.options.length > 0) {
      // First get existing options to determine what to update, add, or remove
      const { data: existingOptions, error: fetchError } = await supabase
        .from('poll_options')
        .select('id, text')
        .eq('poll_id', id);

      if (fetchError) {
        console.error('Error fetching existing options:', fetchError);
        return {
          success: false,
          error: fetchError.message
        };
      }

      // Identify options to update, add, or remove
      const existingIds = existingOptions.map(opt => opt.id);
      
      // Handle options based on their type (string or object)
      const optionsArray = data.options.map(opt => 
        typeof opt === 'string' ? { text: opt } : opt
      );
      
      const newOptions = optionsArray.filter(opt => 
        !('id' in opt) || !existingIds.includes(opt.id as string)
      );
      
      const updatedOptions = optionsArray.filter(opt => 
        'id' in opt && existingIds.includes(opt.id as string)
      );
      
      const deletedOptionIds = existingIds.filter(existingId => 
        !optionsArray.some(opt => 'id' in opt && opt.id === existingId)
      );

      // Update existing options
      for (const option of updatedOptions) {
        if ('id' in option && 'text' in option) {
          const { error } = await supabase
            .from('poll_options')
            .update({ text: option.text })
            .eq('id', option.id);

          if (error) {
            console.error(`Error updating option ${option.id}:`, error);
          }
        }
      }

      // Add new options
      if (newOptions.length > 0) {
        const { error } = await supabase
          .from('poll_options')
          .insert(newOptions.map((option, index) => ({
            poll_id: id,
            text: option.text,
            votes: 0,
            order: existingOptions.length + index
          })));

        if (error) {
          console.error('Error adding new options:', error);
        }
      }

      // Delete removed options
      if (deletedOptionIds.length > 0) {
        const { error } = await supabase
          .from('poll_options')
          .delete()
          .in('id', deletedOptionIds);

        if (error) {
          console.error('Error deleting options:', error);
        }
      }
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Unexpected error updating poll:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

export async function deletePoll(id: string) {
  console.log("Deleting poll from Supabase:", id);

  try {
    // Delete poll options first (due to foreign key constraints)
    const { error: optionsError } = await supabase
      .from('poll_options')
      .delete()
      .eq('poll_id', id);

    if (optionsError) {
      console.error('Error deleting poll options:', optionsError);
      return {
        success: false,
        error: optionsError.message
      };
    }

    // Delete votes associated with this poll
    const { error: votesError } = await supabase
      .from('votes')
      .delete()
      .eq('poll_id', id);

    if (votesError) {
      console.error('Error deleting poll votes:', votesError);
      // Continue with poll deletion anyway
    }

    // Delete the poll itself
    const { error: pollError } = await supabase
      .from('polls')
      .delete()
      .eq('id', id);

    if (pollError) {
      console.error('Error deleting poll:', pollError);
      return {
        success: false,
        error: pollError.message
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Unexpected error deleting poll:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

export async function submitVote(
  pollId: string,
  optionId: string,
  userId?: string,
) {
  console.log("Submitting vote to Supabase:", { pollId, optionId, userId });

  try {
    // First, get the current poll to check if it's active and if multiple votes are allowed
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('status, allow_multiple_votes, is_anonymous')
      .eq('id', pollId)
      .single();

    if (pollError) {
      console.error('Error fetching poll for voting:', pollError);
      return {
        success: false,
        error: pollError.message
      };
    }

    if (poll.status !== 'active') {
      return {
        success: false,
        error: 'This poll is no longer active'
      };
    }

    // If user is authenticated and poll doesn't allow multiple votes, check if they've already voted
    if (userId && !poll.allow_multiple_votes) {
      const { data: existingVotes, error: votesError } = await supabase
        .from('votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', userId);

      if (votesError) {
        console.error('Error checking existing votes:', votesError);
      } else if (existingVotes && existingVotes.length > 0) {
        return {
          success: false,
          error: 'You have already voted on this poll'
        };
      }
    }

    // Record the vote in the votes table if user is authenticated
    if (userId) {
      const { error: voteRecordError } = await supabase
        .from('votes')
        .insert({
          poll_id: pollId,
          option_id: optionId,
          user_id: userId,
          anonymous: poll.is_anonymous
        });

      if (voteRecordError) {
        console.error('Error recording vote:', voteRecordError);
        // Continue anyway to increment the vote count
      }
    }

    // Increment the vote count for the selected option
    try {
      const { error: updateError } = await supabase.rpc('increment_vote', {
        option_id_param: optionId
      });

      if (updateError) {
        console.error('Error incrementing vote count:', updateError);
        // Try a direct update as fallback
        const { data: currentOption, error: fetchError } = await supabase
          .from('poll_options')
          .select('votes')
          .eq('id', optionId)
          .single();
          
        if (fetchError) {
          console.error('Error fetching current vote count:', fetchError);
          return {
            success: true,
            warning: 'Vote recorded but count may not be updated immediately'
          };
        }
        
        const currentVotes = currentOption?.votes || 0;
        
        const { error: directUpdateError } = await supabase
          .from('poll_options')
          .update({ votes: currentVotes + 1 })
          .eq('id', optionId);

        if (directUpdateError) {
          console.error('Error with direct vote count update:', directUpdateError);
          return {
            success: true,
            warning: 'Vote recorded but count may not be updated immediately'
          };
        }
      }
    } catch (rpcError) {
      console.error('RPC error when incrementing vote:', rpcError);
      // Fallback to direct update if RPC fails completely
      try {
        const { data: currentOption, error: fetchError } = await supabase
          .from('poll_options')
          .select('votes')
          .eq('id', optionId)
          .single();
          
        if (!fetchError && currentOption) {
          const currentVotes = currentOption.votes || 0;
          
          await supabase
            .from('poll_options')
            .update({ votes: currentVotes + 1 })
            .eq('id', optionId);
        }
      } catch (fallbackError) {
        console.error('Fallback update also failed:', fallbackError);
      }
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Unexpected error submitting vote:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

export async function getUserPolls(userId: string) {
  console.log("Fetching user polls from Supabase:", userId);

  try {
    // Get all polls created by this user with their options and vote counts
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
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user polls:', error);
      return [];
    }

    if (!polls || polls.length === 0) {
      console.log('No polls found for user');
      return [];
    }

    console.log(`Found ${polls.length} polls for user`);

    // Transform the data to match the expected format
    return polls.map(poll => {
      // Calculate total votes
      const totalVotes = poll.poll_options.reduce((sum, option) => sum + (option.votes || 0), 0);

      // Extract creator information
      // Handle the case where profiles could be an array or an object
      const creatorProfile = Array.isArray(poll.profiles) && poll.profiles.length > 0 
        ? poll.profiles[0] 
        : (poll.profiles || { name: 'Unknown User', email: '', avatar_url: null });
        
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
      };
    });
  } catch (error) {
    console.error('Unexpected error fetching user polls:', error);
    return [];
  }
}
