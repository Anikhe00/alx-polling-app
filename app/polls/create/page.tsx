"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react"
import Link from "next/link"
import { BreadcrumbNav } from "@/components/layout/breadcrumb-nav"
import { usePolls } from "@/hooks/use-polls"
import { useAuth } from "@/hooks/use-auth"

interface PollFormData {
  title: string
  description: string
  type: 'single' | 'multiple' | 'ranking'
  endDate: string
  isAnonymous: boolean
  showResults: boolean
  allowMultipleVotes: boolean
  options: string[]
}

export default function CreatePollPage() {
  const router = useRouter()
  const { createNewPoll, loading } = usePolls()
  const { user, loading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirectedFrom=/polls/create')
    }
  }, [user, authLoading, router])
  const [formData, setFormData] = useState<PollFormData>({
    title: '',
    description: '',
    type: 'single',
    endDate: '',
    isAnonymous: false,
    showResults: true,
    allowMultipleVotes: false,
    options: ['', '', '', '']
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const updateFormData = (field: keyof PollFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }))
    }
  }

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    // TODO: Implement poll creation
    console.log('Creating poll:', formData)
    // Redirect to dashboard or poll page
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() !== '' && formData.description.trim() !== ''
      case 2:
        return formData.options.filter(opt => opt.trim() !== '').length >= 2
      case 3:
        return true // Settings are optional
      case 4:
        return true // Review step
      default:
        return false
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Breadcrumb navigation */}
      <BreadcrumbNav 
        items={[
          { label: "Polls", href: "/polls" },
          { label: "Create Poll" }
        ]} 
      />

      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold">Create New Poll</h1>
            <p className="text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </div>
        <Link href="/polls">
          <Button variant="outline">
            Cancel
          </Button>
        </Link>
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Basic Info</span>
              <span>Options</span>
              <span>Settings</span>
              <span>Review</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Basic Information"}
            {currentStep === 2 && "Poll Options"}
            {currentStep === 3 && "Poll Settings"}
            {currentStep === 4 && "Review & Create"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Tell us about your poll"}
            {currentStep === 2 && "Add the voting options"}
            {currentStep === 3 && "Configure poll settings"}
            {currentStep === 4 && "Review your poll before creating"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Poll Title *</Label>
                <Input 
                  id="title" 
                  placeholder="What's your favorite programming language?"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe what this poll is about..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Poll Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => updateFormData('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Choice</SelectItem>
                    <SelectItem value="multiple">Multiple Choice</SelectItem>
                    <SelectItem value="ranking">Ranking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date (Optional)</Label>
                <Input 
                  id="end-date" 
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => updateFormData('endDate', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Poll Options */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Poll Options *</Label>
                <p className="text-sm text-muted-foreground">
                  Add at least 2 options for your poll
                </p>
              </div>
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                  />
                  {formData.options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addOption} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Option
              </Button>
            </div>
          )}

          {/* Step 3: Poll Settings */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="anonymous" 
                    className="rounded"
                    checked={formData.isAnonymous}
                    onChange={(e) => updateFormData('isAnonymous', e.target.checked)}
                  />
                  <Label htmlFor="anonymous">Allow anonymous voting</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="results" 
                    className="rounded"
                    checked={formData.showResults}
                    onChange={(e) => updateFormData('showResults', e.target.checked)}
                  />
                  <Label htmlFor="results">Show results immediately</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="multiple-votes" 
                    className="rounded"
                    checked={formData.allowMultipleVotes}
                    onChange={(e) => updateFormData('allowMultipleVotes', e.target.checked)}
                  />
                  <Label htmlFor="multiple-votes">Allow multiple votes per user</Label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Poll Title</h3>
                  <p className="text-muted-foreground">{formData.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Description</h3>
                  <p className="text-muted-foreground">{formData.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Poll Type</h3>
                  <Badge variant="secondary">{formData.type}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold">Options</h3>
                  <div className="space-y-1">
                    {formData.options.filter(opt => opt.trim() !== '').map((option, index) => (
                      <div key={index} className="text-muted-foreground">
                        {index + 1}. {option}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Settings</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Anonymous voting: {formData.isAnonymous ? 'Yes' : 'No'}</div>
                    <div>Show results immediately: {formData.showResults ? 'Yes' : 'No'}</div>
                    <div>Allow multiple votes: {formData.allowMultipleVotes ? 'Yes' : 'No'}</div>
                    {formData.endDate && <div>End date: {new Date(formData.endDate).toLocaleString()}</div>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex space-x-2">
          {currentStep < totalSteps ? (
            <Button 
              onClick={nextStep}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={async () => {
                const sanitized: PollFormData = {
                  ...formData,
                  options: formData.options.filter(opt => opt.trim() !== ''),
                }

                if (sanitized.options.length < 2) {
                  return
                }

                const creatorId = user?.id || '1'
                const result = await createNewPoll(sanitized, creatorId)
                if (result?.success && result.pollId) {
                  router.push(`/polls/${result.pollId}`)
                } else {
                  console.error(result?.error || 'Failed to create poll')
                }
              }}
              disabled={!canProceed() || loading}
            >
              Create Poll
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
