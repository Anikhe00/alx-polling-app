"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Edit, Trash2, BarChart3, Users, Calendar, Plus } from "lucide-react";

// Mock poll data
const mockPolls = [
  {
    id: "1",
    title: "What's your favorite programming language?",
    description:
      "A poll to determine the most popular programming language among developers.",
    status: "active",
    optionCount: 5,
    totalVotes: 1247,
    createdAt: new Date("2024-01-15"),
    endDate: new Date("2024-02-15"),
  },
  {
    id: "2",
    title: "Best framework for web development?",
    description: "Comparing popular web development frameworks.",
    status: "active",
    optionCount: 4,
    totalVotes: 892,
    createdAt: new Date("2024-01-20"),
    endDate: new Date("2024-02-20"),
  },
  {
    id: "3",
    title: "Remote work preferences",
    description: "Understanding team preferences for remote vs office work.",
    status: "ended",
    optionCount: 3,
    totalVotes: 156,
    createdAt: new Date("2024-01-10"),
    endDate: new Date("2024-01-25"),
  },
  {
    id: "4",
    title: "Coffee or Tea?",
    description: "The eternal question - what's your preferred morning drink?",
    status: "active",
    optionCount: 2,
    totalVotes: 523,
    createdAt: new Date("2024-01-22"),
    endDate: null,
  },
  {
    id: "5",
    title: "Meeting frequency preference",
    description: "How often should team meetings be scheduled?",
    status: "draft",
    optionCount: 4,
    totalVotes: 0,
    createdAt: new Date("2024-01-25"),
    endDate: new Date("2024-03-01"),
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [polls, setPolls] = useState(mockPolls);
  const [stats] = useState({
    totalPolls: 5,
    activePolls: 3,
    totalVotes: 2818,
    monthlyVotes: 89,
  });

  const handleEdit = (pollId: string) => {
    console.log("Edit poll:", pollId);
    router.push(`/polls/${pollId}/edit`);
  };

  const handleDelete = (pollId: string) => {
    console.log("Delete poll:", pollId);
    if (confirm("Are you sure you want to delete this poll?")) {
      setPolls(polls.filter((poll) => poll.id !== pollId));
    }
  };

  const handleView = (pollId: string) => {
    router.push(`/polls/${pollId}`);
  };

  // Mock user for now
  const mockUser = {
    name: "Demo User",
    email: "demo@example.com",
    id: "demo-123",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "ended":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {mockUser.name}!</p>
          </div>
          <div className="flex gap-3">
            <Link href="/polls/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Poll
              </Button>
            </Link>
            <Button
              variant="outline"
              disabled
              className="flex items-center gap-2"
            >
              Sign Out (Disabled)
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Polls
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalPolls}
              </div>
              <p className="text-xs text-gray-500 mt-1">Polls created</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Polls
              </CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.activePolls}
              </div>
              <p className="text-xs text-gray-500 mt-1">Currently running</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Votes
              </CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalVotes.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Across all polls</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                This Month
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.monthlyVotes}
              </div>
              <p className="text-xs text-gray-500 mt-1">Votes this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Polls Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Polls</h2>
            <p className="text-gray-600 text-sm">
              Manage and monitor your polls
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Filter
            </Button>
            <Button variant="outline" size="sm">
              Sort
            </Button>
          </div>
        </div>

        {/* Poll Cards Grid */}
        {polls.length === 0 ? (
          <Card className="bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No polls yet
              </h3>
              <p className="text-gray-600 text-center max-w-sm mb-6">
                Create your first poll to start collecting responses and
                insights from your audience.
              </p>
              <Link href="/polls/create">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Poll
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => (
              <Card
                key={poll.id}
                className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 h-80 flex flex-col"
              >
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <Badge
                      variant="secondary"
                      className={`text-xs font-medium border ${getStatusColor(poll.status)}`}
                    >
                      {poll.status.charAt(0).toUpperCase() +
                        poll.status.slice(1)}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(poll.id)}
                        className="h-8 w-8 p-0 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(poll.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle
                    className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors line-clamp-1"
                    onClick={() => handleView(poll.id)}
                  >
                    {poll.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 line-clamp-2 min-h-[2.5rem]">
                    {poll.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 flex-1">
                    {/* Poll Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {poll.optionCount}
                        </div>
                        <div className="text-xs text-gray-500">Options</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {poll.totalVotes.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Votes</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {Math.floor(
                            (Date.now() - poll.createdAt.getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}
                          d
                        </div>
                        <div className="text-xs text-gray-500">Age</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(poll.id)}
                      className="flex-1 text-xs"
                    >
                      View Poll
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          `${window.location.origin}/polls/${poll.id}`,
                        )
                      }
                      className="flex-1 text-xs"
                    >
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button (if needed) */}
        {polls.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" className="px-8">
              Load More Polls
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
