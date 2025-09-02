"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { getPolls } from "@/lib/db/poll-utils"
import { Poll } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [polls, setPolls] = useState<Poll[]>([])
  const [stats, setStats] = useState({
    totalPolls: 0,
    activePolls: 0,
    totalVotes: 0,
    monthlyVotes: 0
  })
  const [loadingPolls, setLoadingPolls] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard')
    }
  }, [user, loading, router])

  // Fetch polls
  useEffect(() => {
    async function fetchPolls() {
      if (!user) return
      
      try {
        setLoadingPolls(true)
        const pollsData = await getPolls()
        setPolls(pollsData)
        
        // Calculate stats
        const activePolls = pollsData.filter(poll => poll.status === 'active')
        const totalVotes = pollsData.reduce((sum, poll) => sum + (poll.totalVotes || 0), 0)
        
        // Calculate votes this month
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthlyVotes = pollsData.reduce((sum, poll) => {
          // This is a simplification - in a real app, you'd track votes by date
          return sum + (poll.totalVotes || 0) / 3 // Just an estimate for demo purposes
        }, 0)
        
        setStats({
          totalPolls: pollsData.length,
          activePolls: activePolls.length,
          totalVotes,
          monthlyVotes: Math.round(monthlyVotes)
        })
      } catch (error) {
        console.error('Error fetching polls:', error)
      } finally {
        setLoadingPolls(false)
      }
    }
    
    fetchPolls()
  }, [user])
  
  if (loading || loadingPolls) {
    return (
      <div className="space-y-6 flex justify-center items-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/polls/create">
          <Button>Create New Poll</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPolls}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPolls > 0 ? 'Total created polls' : 'No polls created yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePolls}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVotes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all polls
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyVotes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Votes this month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Polls</CardTitle>
          <CardDescription>
            Your most recent polls and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {polls.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You haven't created any polls yet.</p>
              <Link href="/polls/create" className="mt-4 inline-block">
                <Button>Create Your First Poll</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {polls.slice(0, 5).map((poll) => (
                <div key={poll.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{poll.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(poll.createdAt).toLocaleDateString()} • {poll.totalVotes} votes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={poll.status === 'active' ? 'default' : 'secondary'}>
                      {poll.status.charAt(0).toUpperCase() + poll.status.slice(1)}
                    </Badge>
                    <Link href={`/polls/${poll.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {polls.length > 5 && (
                <div className="text-center mt-4">
                  <Link href="/polls">
                    <Button variant="outline">View All Polls</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
