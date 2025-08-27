import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Share2, Eye, Copy } from "lucide-react"
import Link from "next/link"

interface PollSuccessProps {
  pollId: string
  pollTitle: string
  pollUrl: string
}

export function PollSuccess({ pollId, pollTitle, pollUrl }: PollSuccessProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Poll Created Successfully!</CardTitle>
          <CardDescription className="text-green-700">
            Your poll "{pollTitle}" has been created and is now live.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Poll URL</h3>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-gray-100 px-2 py-1 rounded text-sm break-all">
                {pollUrl}
              </code>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/polls/${pollId}`} className="flex-1">
              <Button className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Poll
              </Button>
            </Link>
            
            <Button variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share Poll
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
            
            <Link href="/polls" className="flex-1">
              <Button variant="outline" className="w-full">
                View All Polls
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

