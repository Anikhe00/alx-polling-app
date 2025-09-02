"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { submitVote } from "@/lib/db/poll-utils"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import Link from "next/link"
import { DashboardNav } from "@/components/layout/dashboard-nav"
import { Poll } from "@/lib/types"

export default function PollDetailPage() {
  const params = useParams()
  const router = useRouter()
  const pollId = String(params.id)
  const { user, loading } = useAuth()
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState<'vote' | 'results'>('vote')
  const [submitting, setSubmitting] = useState(false)
  const [voteError, setVoteError] = useState<string | null>(null)
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/polls/${pollId}`)
    }
  }, [user, loading, router, pollId])
  const [poll, setPoll] = useState<Poll | null>(null)
  const [pollLoading, setPollLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch poll data
  useEffect(() => {
    async function fetchPoll() {
      try {
        setPollLoading(true)
        const { getPollById } = await import('@/lib/db/poll-utils')
        const pollData = await getPollById(pollId)
        
        if (!pollData) {
          setError('Poll not found')
          return
        }
        
        setPoll(pollData)
      } catch (err) {
        console.error('Error fetching poll:', err)
        setError('Failed to load poll data')
      } finally {
        setPollLoading(false)
      }
    }
    
    fetchPoll()
  }, [pollId])

  if (pollLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="max-w-4xl mx-auto space-y-6 p-6 flex justify-center items-center h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading poll data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="max-w-4xl mx-auto space-y-6 p-6 flex justify-center items-center h-[50vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500">Error</h2>
            <p className="mt-2 text-muted-foreground">{error || 'Poll not found'}</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{poll.title}</h1>
          <p className="text-muted-foreground mt-2">{poll.description}</p>
        </div>
        <Badge variant={poll.status === 'active' ? 'default' : 'secondary'}>
          {poll.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Poll Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={poll.creator.avatar || "/placeholder-avatar.jpg"} />
                <AvatarFallback>{poll.creator.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{poll.creator.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Created: {new Date(poll.createdAt).toLocaleDateString()}
            </p>
            {poll.endDate && (
              <p className="text-sm text-muted-foreground">
                Ends: {new Date(poll.endDate).toLocaleDateString()}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Total votes: {poll.totalVotes}
            </p>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs value={tabValue} onValueChange={(v: any) => setTabValue(v)} className="space-y-4">
            <TabsList>
              <TabsTrigger value="vote">Vote</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="vote" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cast Your Vote</CardTitle>
                  <CardDescription>
                    Select your preferred option
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {poll.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name="vote" 
                        id={`option-${option.id}`} 
                        checked={String(option.id) === selectedOptionId}
                        onChange={() => setSelectedOptionId(String(option.id))}
                      />
                      <label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                        {option.text}
                      </label>
                    </div>
                  ))}
                  {voteError && (
                    <div className="text-red-500 text-sm mt-2">{voteError}</div>
                  )}
                  <Button 
                    className="w-full mt-4"
                    disabled={!selectedOptionId || submitting || !user}
                    onClick={async () => {
                      if (!selectedOptionId) return
                      if (!user) {
                        setVoteError('You must be logged in to vote')
                        return
                      }
                      try {
                        setSubmitting(true)
                        setVoteError(null)
                        const result = await submitVote(poll.id, selectedOptionId, user.id)
                        if (result.success) {
                          setTabValue('results')
                        } else {
                          setVoteError(result.error || 'Failed to submit vote')
                        }
                      } catch (e) {
                        console.error('Failed to submit vote', e)
                        setVoteError('An unexpected error occurred')
                      } finally {
                        setSubmitting(false)
                      }
                    }}
                  >
                    {!user ? 'Login to Vote' : 'Submit Vote'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Results</CardTitle>
                  <CardDescription>
                    Live voting results
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {poll.options.map((option) => (
                    <div key={option.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{option.text}</span>
                        <span className="text-sm text-muted-foreground">
                          {option.votes} votes ({option.percentage}%)
                        </span>
                      </div>
                      <Progress value={option.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
    </div>
  )
}
