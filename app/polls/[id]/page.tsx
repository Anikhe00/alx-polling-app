"use client"

import { useState } from "react"
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

export default function PollDetailPage() {
  const params = useParams()
  const pollId = String(params.id)
  const { user } = useAuth()
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState<'vote' | 'results'>('vote')
  const [submitting, setSubmitting] = useState(false)
  // Mock data - replace with actual data fetching
  const poll = {
    id: pollId,
    title: "What's your favorite programming language?",
    description: "A poll to determine the most popular programming language among developers.",
    creator: "John Doe",
    createdAt: "2024-01-15",
    endDate: "2024-02-15",
    status: "active",
    totalVotes: 1234,
    options: [
      { id: 1, text: "JavaScript", votes: 456, percentage: 37 },
      { id: 2, text: "Python", votes: 345, percentage: 28 },
      { id: 3, text: "TypeScript", votes: 234, percentage: 19 },
      { id: 4, text: "Rust", votes: 199, percentage: 16 },
    ]
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
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="text-sm">{poll.creator}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Created: {poll.createdAt}
            </p>
            <p className="text-sm text-muted-foreground">
              Ends: {poll.endDate}
            </p>
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
                  <Button 
                    className="w-full mt-4"
                    disabled={!selectedOptionId || submitting}
                    onClick={async () => {
                      if (!selectedOptionId) return
                      try {
                        setSubmitting(true)
                        await submitVote(poll.id, selectedOptionId, user?.id)
                        setTabValue('results')
                      } catch (e) {
                        console.error('Failed to submit vote', e)
                      } finally {
                        setSubmitting(false)
                      }
                    }}
                  >
                    Submit Vote
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
