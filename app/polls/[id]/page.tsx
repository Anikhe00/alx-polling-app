"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Users,
  BarChart3,
  Share2,
  ArrowLeft,
  Calendar,
  User,
  CheckCircle,
  TrendingUp,
  Eye,
} from "lucide-react";

// Mock poll data
const mockPollData = {
  "1": {
    id: "1",
    title: "What's your favorite programming language?",
    description:
      "A comprehensive poll to determine the most popular programming language among developers in our community. This will help us understand current trends and preferences.",
    creator: {
      id: "creator-1",
      name: "John Doe",
      email: "john@example.com",
      avatar: "/placeholder-avatar.jpg",
    },
    status: "active",
    type: "single",
    isAnonymous: false,
    showResults: true,
    allowMultipleVotes: false,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    endDate: new Date("2024-02-15"),
    totalVotes: 1247,
    options: [
      {
        id: "1",
        pollId: "1",
        text: "JavaScript",
        votes: 456,
        percentage: 37,
        order: 1,
      },
      {
        id: "2",
        pollId: "1",
        text: "Python",
        votes: 345,
        percentage: 28,
        order: 2,
      },
      {
        id: "3",
        pollId: "1",
        text: "TypeScript",
        votes: 211,
        percentage: 17,
        order: 3,
      },
      {
        id: "4",
        pollId: "1",
        text: "Go",
        votes: 124,
        percentage: 10,
        order: 4,
      },
      {
        id: "5",
        pollId: "1",
        text: "Rust",
        votes: 111,
        percentage: 9,
        order: 5,
      },
    ],
  },
  "2": {
    id: "2",
    title: "Best framework for web development?",
    description:
      "Comparing popular web development frameworks and their adoption rates.",
    creator: {
      id: "creator-2",
      name: "Jane Smith",
      email: "jane@example.com",
      avatar: "/placeholder-avatar.jpg",
    },
    status: "active",
    type: "single",
    isAnonymous: false,
    showResults: true,
    allowMultipleVotes: false,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-22"),
    endDate: new Date("2024-02-20"),
    totalVotes: 892,
    options: [
      {
        id: "6",
        pollId: "2",
        text: "React",
        votes: 356,
        percentage: 40,
        order: 1,
      },
      {
        id: "7",
        pollId: "2",
        text: "Vue.js",
        votes: 267,
        percentage: 30,
        order: 2,
      },
      {
        id: "8",
        pollId: "2",
        text: "Angular",
        votes: 178,
        percentage: 20,
        order: 3,
      },
      {
        id: "9",
        pollId: "2",
        text: "Svelte",
        votes: 91,
        percentage: 10,
        order: 4,
      },
    ],
  },
  "3": {
    id: "3",
    title: "Remote work preferences",
    description: "Understanding team preferences for remote vs office work.",
    creator: {
      id: "creator-3",
      name: "Mike Johnson",
      email: "mike@example.com",
      avatar: "/placeholder-avatar.jpg",
    },
    status: "ended",
    type: "single",
    isAnonymous: true,
    showResults: true,
    allowMultipleVotes: false,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-25"),
    endDate: new Date("2024-01-25"),
    totalVotes: 156,
    options: [
      {
        id: "10",
        pollId: "3",
        text: "Fully Remote",
        votes: 87,
        percentage: 56,
        order: 1,
      },
      {
        id: "11",
        pollId: "3",
        text: "Hybrid",
        votes: 47,
        percentage: 30,
        order: 2,
      },
      {
        id: "12",
        pollId: "3",
        text: "Fully In-Office",
        votes: 22,
        percentage: 14,
        order: 3,
      },
    ],
  },
};

export default function PollDetailPage() {
  const params = useParams();
  const pollId = String(params.id);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"vote" | "results">("vote");
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [poll, setPoll] = useState(
    mockPollData[pollId as keyof typeof mockPollData] || null,
  );

  useEffect(() => {
    const pollData = mockPollData[pollId as keyof typeof mockPollData];
    if (pollData) {
      setPoll(pollData);
      // If poll is ended, show results by default
      if (pollData.status === "ended") {
        setActiveTab("results");
      }
    }
  }, [pollId]);

  const handleVoteSubmit = async () => {
    if (!selectedOptionId || submitting) return;

    setSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update mock data
    if (poll) {
      const updatedOptions = poll.options.map((option) => {
        if (option.id === selectedOptionId) {
          const newVotes = option.votes + 1;
          const newTotal = poll.totalVotes + 1;
          return {
            ...option,
            votes: newVotes,
            percentage: Math.round((newVotes / newTotal) * 100),
          };
        } else {
          return {
            ...option,
            percentage: Math.round(
              (option.votes / (poll.totalVotes + 1)) * 100,
            ),
          };
        }
      });

      setPoll({
        ...poll,
        totalVotes: poll.totalVotes + 1,
        options: updatedOptions,
      });
    }

    setHasVoted(true);
    setSubmitting(false);
    setActiveTab("results");
  };

  const handleShare = () => {
    const url = `${window.location.origin}/polls/${pollId}`;
    navigator.clipboard.writeText(url);
    // Could add a toast notification here
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

  const getDaysRemaining = (endDate: Date | null) => {
    if (!endDate) return null;
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (!poll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Poll Not Found
            </h3>
            <p className="text-gray-600 text-center mb-6">
              The poll you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Link href="/dashboard">
              <Button className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(poll.endDate);
  const isActive = poll.status === "active";
  const canVote = isActive && !hasVoted;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Badge
                className={`border ${getStatusColor(poll.status)}`}
                variant="secondary"
              >
                {poll.status.charAt(0).toUpperCase() + poll.status.slice(1)}
              </Badge>
              {daysRemaining !== null && daysRemaining > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {daysRemaining} days left
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {poll.title}
              </h1>
              <p className="text-gray-600 text-lg">{poll.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poll Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Created by
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={poll.creator.avatar || "/placeholder-avatar.jpg"}
                    />
                    <AvatarFallback>
                      {poll.creator.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">
                      {poll.creator.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {poll.creator.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Poll Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Poll Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Total Votes</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {poll.totalVotes.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">Options</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {poll.options.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Created</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {poll.createdAt.toLocaleDateString()}
                  </span>
                </div>

                {poll.endDate && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Ends</span>
                    </div>
                    <span
                      className={`font-semibold ${poll.endDate > new Date() ? "text-green-600" : "text-red-600"}`}
                    >
                      {poll.endDate.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Poll Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Anonymous voting
                  </span>
                  <Badge
                    variant={poll.isAnonymous ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {poll.isAnonymous ? "Yes" : "No"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Multiple votes</span>
                  <Badge
                    variant={poll.allowMultipleVotes ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {poll.allowMultipleVotes ? "Allowed" : "Not allowed"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Results visibility
                  </span>
                  <Badge
                    variant={poll.showResults ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {poll.showResults ? "Public" : "Private"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Voting/Results Area */}
          <div className="lg:col-span-2">
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "vote" | "results")
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="vote" disabled={!canVote && !isActive}>
                  {canVote ? "Vote" : hasVoted ? "Voted" : "Vote"}
                </TabsTrigger>
                <TabsTrigger
                  value="results"
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Results
                </TabsTrigger>
              </TabsList>

              {/* Vote Tab */}
              <TabsContent value="vote" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {hasVoted ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <BarChart3 className="h-5 w-5" />
                      )}
                      {hasVoted ? "Vote Submitted!" : "Cast Your Vote"}
                    </CardTitle>
                    <CardDescription>
                      {hasVoted
                        ? "Thank you for participating! View the results to see how others voted."
                        : isActive
                          ? "Select your preferred option below"
                          : "This poll has ended and is no longer accepting votes"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hasVoted ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Vote Recorded!
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Your vote has been successfully submitted.
                        </p>
                        <Button onClick={() => setActiveTab("results")}>
                          View Results
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {poll.options.map((option) => (
                          <label
                            key={option.id}
                            className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedOptionId === option.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:bg-gray-50"
                            } ${!isActive ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <input
                              type="radio"
                              name="vote"
                              value={option.id}
                              checked={selectedOptionId === option.id}
                              onChange={(e) =>
                                setSelectedOptionId(e.target.value)
                              }
                              disabled={!isActive}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span
                              className={`flex-1 ${selectedOptionId === option.id ? "font-medium text-blue-900" : "text-gray-700"}`}
                            >
                              {option.text}
                            </span>
                          </label>
                        ))}

                        {isActive && (
                          <Button
                            onClick={handleVoteSubmit}
                            disabled={!selectedOptionId || submitting}
                            className="w-full mt-6"
                          >
                            {submitting ? "Submitting..." : "Submit Vote"}
                          </Button>
                        )}

                        {!isActive && (
                          <div className="text-center py-4">
                            <p className="text-gray-500">
                              This poll is no longer active
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Results Tab */}
              <TabsContent value="results" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Live Results
                      </div>
                      <div className="text-sm text-gray-500">
                        {poll.totalVotes.toLocaleString()} total votes
                      </div>
                    </CardTitle>
                    <CardDescription>Real-time voting results</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {poll.options
                      .sort((a, b) => b.votes - a.votes)
                      .map((option, index) => (
                        <div key={option.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                  index === 0
                                    ? "bg-yellow-100 text-yellow-800"
                                    : index === 1
                                      ? "bg-gray-100 text-gray-800"
                                      : index === 2
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {index + 1}
                              </div>
                              <span className="font-medium text-gray-900">
                                {option.text}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                {option.percentage}%
                              </div>
                              <div className="text-xs text-gray-500">
                                {option.votes.toLocaleString()} votes
                              </div>
                            </div>
                          </div>
                          <div className="relative">
                            <Progress
                              value={option.percentage}
                              className="h-3"
                            />
                            {index === 0 && option.percentage > 0 && (
                              <div className="absolute -top-1 left-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                            )}
                          </div>
                        </div>
                      ))}

                    {poll.totalVotes === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No votes yet. Be the first to vote!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
