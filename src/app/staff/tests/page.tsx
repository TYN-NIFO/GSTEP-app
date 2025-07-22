import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Plus,
  Edit,
  Eye,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  BarChart3,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

// Mock data for staff tests
const mockTestsData = {
  myTests: [
    {
      id: '1',
      title: 'Data Structures & Algorithms',
      description: 'Comprehensive test covering arrays, linked lists, trees, and graphs',
      type: 'TECHNICAL',
      status: 'PUBLISHED',
      duration: 120,
      totalMarks: 100,
      passingMarks: 60,
      questions: 25,
      submissions: 45,
      avgScore: 84.2,
      createdAt: '2024-01-15',
      scheduledAt: null
    },
    {
      id: '2',
      title: 'JavaScript Fundamentals',
      description: 'Basic to intermediate JavaScript concepts and coding problems',
      type: 'CODING',
      status: 'PUBLISHED',
      duration: 90,
      totalMarks: 80,
      passingMarks: 48,
      questions: 20,
      submissions: 38,
      avgScore: 79.5,
      createdAt: '2024-01-10',
      scheduledAt: null
    },
    {
      id: '3',
      title: 'Object Oriented Programming',
      description: 'OOP concepts, inheritance, polymorphism, and design patterns',
      type: 'TECHNICAL',
      status: 'PUBLISHED',
      duration: 100,
      totalMarks: 90,
      passingMarks: 54,
      questions: 22,
      submissions: 42,
      avgScore: 76.8,
      createdAt: '2024-01-05',
      scheduledAt: null
    },
    {
      id: '4',
      title: 'Advanced Algorithms',
      description: 'Dynamic programming, graph algorithms, and optimization techniques',
      type: 'TECHNICAL',
      status: 'DRAFT',
      duration: 150,
      totalMarks: 120,
      passingMarks: 72,
      questions: 18,
      submissions: 0,
      avgScore: 0,
      createdAt: '2024-01-18',
      scheduledAt: '2024-01-25'
    },
    {
      id: '5',
      title: 'Database Management Systems',
      description: 'SQL queries, normalization, transactions, and database design',
      type: 'TECHNICAL',
      status: 'DRAFT',
      duration: 110,
      totalMarks: 95,
      passingMarks: 57,
      questions: 24,
      submissions: 0,
      avgScore: 0,
      createdAt: '2024-01-20',
      scheduledAt: '2024-01-28'
    }
  ]
}

export default async function StaffTestsPage() {
  const session = await getServerSession(authOptions)

  const publishedTests = mockTestsData.myTests.filter(test => test.status === 'PUBLISHED')
  const draftTests = mockTestsData.myTests.filter(test => test.status === 'DRAFT')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tests</h1>
          <p className="mt-2 text-gray-600">
            Create and manage tests for {session?.user.departmentName} students
          </p>
        </div>
        <Link href="/staff/tests/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Test
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{mockTestsData.myTests.length}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{publishedTests.length}</div>
                <div className="text-sm text-gray-600">Published</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{draftTests.length}</div>
                <div className="text-sm text-gray-600">Drafts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {publishedTests.reduce((sum, test) => sum + test.submissions, 0)}
                </div>
                <div className="text-sm text-gray-600">Submissions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Published Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Published Tests
          </CardTitle>
          <CardDescription>
            Tests that are live and available to students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {publishedTests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No published tests yet</p>
              <Link href="/staff/tests/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Test
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {publishedTests.map((test) => (
                <div key={test.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium">{test.title}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          {test.status}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {test.type}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{test.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {test.duration} mins
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {test.questions} questions
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {test.submissions} submissions
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          {test.avgScore}% avg score
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Results
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Draft Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-yellow-600" />
            Draft Tests
          </CardTitle>
          <CardDescription>
            Tests that are being prepared and not yet published
          </CardDescription>
        </CardHeader>
        <CardContent>
          {draftTests.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No draft tests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {draftTests.map((test) => (
                <div key={test.id} className="p-4 border rounded-lg bg-yellow-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium">{test.title}</h3>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                          {test.status}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {test.type}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{test.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {test.duration} mins
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {test.questions} questions
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          Not published
                        </div>
                        {test.scheduledAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Scheduled: {test.scheduledAt}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Publish
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
