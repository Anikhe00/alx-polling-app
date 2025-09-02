'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"
import { Poll, Vote } from "@/lib/types"

// Extended interfaces for the profile page
interface UserPoll extends Poll {
  total_votes?: number;
  created_at: string;
  end_date: string;
}

interface UserVote extends Vote {
  created_at: string;
  poll: {
    id: string;
    title: string;
  };
  poll_id: string;
}

// Extended user interface for profile page
interface ProfileUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  username?: string;
  bio?: string;
  polls?: UserPoll[];
  votes?: UserVote[];
}

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, loading } = useAuth();
  const [userInitials, setUserInitials] = useState('JD');
  const [user, setUser] = useState<ProfileUser | null>(null);
  
  useEffect(() => {
    if (!loading && !authUser) {
      router.push('/login');
    } else if (authUser) {
      // Convert auth user to profile user
      const profileUser: ProfileUser = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.name || '',
        created_at: authUser.createdAt?.toISOString() || new Date().toISOString(),
        // Mock data for now - would be fetched from database in a real implementation
        polls: [],
        votes: []
      };
      
      setUser(profileUser);
      
      // Get initials from user name
      if (authUser.name) {
        const nameParts = authUser.name.split(' ');
        const initials = nameParts.length > 1 
          ? `${nameParts[0][0]}${nameParts[1][0]}` 
          : nameParts[0].substring(0, 2);
        setUserInitials(initials.toUpperCase());
      }
    }
  }, [authUser, loading, router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatar_url || "/placeholder-avatar.jpg"} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{user.name || 'User'}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <p className="text-sm text-muted-foreground">
            Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="polls">My Polls</TabsTrigger>
          <TabsTrigger value="votes">My Votes</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user.name || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue={user.username || ''} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user.email} disabled />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" defaultValue={user.bio || ''} placeholder="Tell us about yourself..." />
              </div>
              <Button onClick={() => alert('Profile update functionality will be implemented soon')}>Update Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="polls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Polls</CardTitle>
              <CardDescription>
                Polls you've created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.polls && user.polls.length > 0 ? (
                  user.polls.map((poll) => (
                    <div key={poll.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{poll.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(poll.created_at).toLocaleDateString()} • {poll.total_votes || 0} votes
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {new Date(poll.end_date) > new Date() ? 'Active' : 'Ended'}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/polls/${poll.id}`)}>
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You haven't created any polls yet.</p>
                    <Button className="mt-4" onClick={() => router.push('/polls/create')}>Create Your First Poll</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="votes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Votes</CardTitle>
              <CardDescription>
                Polls you've participated in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.votes && user.votes.length > 0 ? (
                  user.votes.map((vote) => (
                    <div key={vote.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{vote.poll.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Voted on {new Date(vote.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/polls/${vote.poll_id}`)}>
                        View Poll
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You haven't voted on any polls yet.</p>
                    <Button className="mt-4" onClick={() => router.push('/polls')}>Browse Polls</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button onClick={() => alert('Password change functionality will be implemented soon')}>Change Password</Button>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Irreversible account actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => alert('Account deletion functionality will be implemented soon')}>Delete Account</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
