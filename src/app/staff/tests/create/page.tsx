import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  Plus, 
  Save,
  ArrowLeft,
  Clock,
  Award,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'

export default async function CreateTestPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/staff/tests">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tests
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Test</h1>
          <p className="mt-2 text-gray-600">
            Design a new test for {session?.user.departmentName} students
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Set up the basic details for your test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="form-label">Test Title *</label>
                <Input 
                  placeholder="e.g., Data Structures and Algorithms"
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input min-h-[100px] resize-none"
                  placeholder="Brief description of what this test covers..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Test Type *</label>
                  <select className="form-input">
                    <option value="">Select test type</option>
                    <option value="APTITUDE">Aptitude</option>
                    <option value="TECHNICAL">Technical</option>
                    <option value="CODING">Coding</option>
                    <option value="INTERVIEW">Interview</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Duration (minutes) *</label>
                  <Input 
                    type="number"
                    placeholder="90"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Total Marks *</label>
                  <Input 
                    type="number"
                    placeholder="100"
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="form-label">Passing Marks *</label>
                  <Input 
                    type="number"
                    placeholder="60"
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Instructions for Students</label>
                <textarea 
                  className="form-input min-h-[120px] resize-none"
                  placeholder="Enter detailed instructions for students taking this test..."
                />
              </div>

              <div>
                <label className="form-label">Schedule Test (Optional)</label>
                <Input 
                  type="datetime-local"
                  className="form-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to publish immediately
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-green-600" />
                Questions
              </CardTitle>
              <CardDescription>
                Add questions to your test
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No questions added yet</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Question
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Preview Test
              </Button>
              <Button variant="outline" className="w-full" disabled>
                <Award className="h-4 w-4 mr-2" />
                Publish Test
              </Button>
              <p className="text-xs text-gray-500">
                Add at least one question to publish
              </p>
            </CardContent>
          </Card>

          {/* Test Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Test Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Questions:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Marks:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">0 mins</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pass Marks:</span>
                <span className="font-medium">0</span>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Creating Effective Tests</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Use clear, unambiguous questions</li>
                    <li>• Set appropriate time limits</li>
                    <li>• Include varied difficulty levels</li>
                    <li>• Provide helpful explanations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Question Types</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Multiple Choice (MCQ)</li>
                    <li>• True/False</li>
                    <li>• Short Answer</li>
                    <li>• Coding Problems</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
