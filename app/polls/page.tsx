"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { getPolls } from "@/lib/db/poll-utils"
import { Poll } from "@/lib/types"

export default function PollsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [polls, setPolls] = useState<Poll[]>([])
  const [filteredPolls, setFilteredPolls] = useState<Poll[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingPolls, setLoadingPolls] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/polls')
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
        setFilteredPolls(pollsData)
      } catch (error) {
        console.error('Error fetching polls:', error)
      } finally {
        setLoadingPolls(false)
      }
    }
    
    fetchPolls()
  }, [user])

  // Filter polls based on tab and search query
  useEffect(() => {
    if (!polls.length) return

    let filtered = [...polls]
    
    // Filter by tab
    if (activeTab === 'active') {
      filtered = filtered.filter(poll => poll.status === 'active')
    } else if (activeTab === 'ended') {
      filtered = filtered.filter(poll => poll.status === 'ended')
    } else if (activeTab === 'my-polls') {
      filtered = filtered.filter(poll => poll.creatorId === user?.id)
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(poll => 
        poll.title.toLowerCase().includes(query) || 
        poll.description.toLowerCase().includes(query)
      )
    }
    
    setFilteredPolls(filtered)
  }, [activeTab, searchQuery, polls, user])
  
  if (loading || loadingPolls) {
    return (
      <div className="space-y-6 p-6 flex justify-center items-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading polls...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Polls</h1>
        <Link href="/polls/create">
          <Button>Create New Poll</Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Search polls..." 
          className="max-w-sm" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <Button variant="ghost" onClick={() => setSearchQuery('')}>
            Clear
          </Button>
        )}
      </div>

      <Tabs 
        defaultValue="all" 
        className="space-y-4" 
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="all">All Polls</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="ended">Ended</TabsTrigger>
          <TabsTrigger value="my-polls">My Polls</TabsTrigger>
        </TabsList>

        {['all', 'active', 'ended', 'my-polls'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {filteredPolls.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'No polls match your search criteria.' 
                    : tab === 'my-polls' 
                      ? 'You haven\'t created any polls yet.' 
                      : 'No polls available.'}
                </p>
                {tab === 'my-polls' && (
                  <Link href="/polls/create" className="mt-4 inline-block">
                    <Button>Create Your First Poll</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPolls.map((poll) => (
                  <Card key={poll.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{poll.title}</CardTitle>
                        <Badge variant={poll.status === 'active' ? 'default' : 'secondary'}>
                          {poll.status.charAt(0).toUpperCase() + poll.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription>
                        {poll.creatorId === user?.id ? 'Created by you' : 'Created by ' + (poll.creator?.name || 'Anonymous')} • {new Date(poll.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {poll.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'}
                        </span>
                        <Link href={`/polls/${poll.id}`}>
                          <Button variant="outline" size="sm">
                            {poll.status === 'active' ? 'Vote' : 'View Results'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
