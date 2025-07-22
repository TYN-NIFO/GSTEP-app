import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Award,
  CheckCircle,
  Clock,
  BarChart3,
  Edit
} from 'lucide-react'

// Mock data for staff test performance view
const mockTestData = {
  myTests: {
    total: 8,
    published: 6,
    draft: 2,
    totalSubmissions: 234
  },
  departmentStats: {
    totalTests: 24,
    averageScore: 78.5,
    passRate: 82
  },
  myTestResults: [
    { 
      title: 'Data Structures & Algorithms', 
      type: 'TECHNICAL', 
      submissions: 45, 
      avgScore: 84.2, 
      passRate: 89,
      status: 'PUBLISHED',
      date: '2024-01-15'
    },
    { 
      title: 'JavaScript Fundamentals', 
      type: 'CODING', 
      submissions: 38, 
      avgScore: 79.5, 
      passRate: 85,
      status: 'PUBLISHED',
      date: '2024-01-10'
    },
    { 
      title: 'Object Oriented Programming', 
      type: 'TECHNICAL', 
      submissions: 42, 
      avgScore: 76.8, 
      passRate: 78,
      status: 'PUBLISHED',
      date: '2024-01-05'
    },
    { 
      title: 'Advanced Algorithms', 
      type: 'TECHNICAL', 
      submissions: 0, 
      avgScore: 0, 
      passRate: 0,
      status: 'DRAFT',
      date: '2024-01-18'
    }
  ],
  studentPerformance: [
    { name: 'Alice Johnson', rollNumber: 'CSE2021001', testsCompleted: 6, avgScore: 94.5, lastTest: '2024-01-15' },
    { name: 'Bob Smith', rollNumber: 'CSE2021002', testsCompleted: 5, avgScore: 87.2, lastTest: '2024-01-12' },
    { name: 'Carol Brown', rollNumber: 'CSE2021003', testsCompleted: 6, avgScore: 91.8, lastTest: '2024-01-10' },
    { name: 'David Wilson', rollNumber: 'CSE2021004', testsCompleted: 4, avgScore: 83.7, lastTest: '2024-01-08' },
    { name: 'Emma Davis', rollNumber: 'CSE2021005', testsCompleted: 5, avgScore: 89.9, lastTest: '2024-01-05' }
  ],
  recentSubmissions: [
    { studentName: 'Alice Johnson', testTitle: 'Data Structures & Algorithms', score: 95, status: 'PASSED', submittedAt: '2024-01-15 10:30 AM' },
    { studentName: 'Bob Smith', testTitle: 'JavaScript Fundamentals', score: 82, status: 'PASSED', submittedAt: '2024-01-15 09:45 AM' },
    { studentName: 'Carol Brown', testTitle: 'Data Structures & Algorithms', score: 88, status: 'PASSED', submittedAt: '2024-01-14 02:15 PM' },
    { studentName: 'David Wilson', testTitle: 'JavaScript Fundamentals', score: 76, status: 'PASSED', submittedAt: '2024-01-14 11:20 AM' }
  ]
}

export default async function StaffTestPerformancePage() {
  const session = await getServerSession(authOptions)

  const stats = [
    {
      title: 'My Tests',
      value: mockTestData.myTests.total,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Submissions',
      value: mockTestData.myTests.totalSubmissions,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Published Tests',
      value: mockTestData.myTests.published,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Draft Tests',
      value: mockTestData.myTests.draft,
      icon: Edit,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Test Performance Analytics</h1>
        <p className="mt-2 text-gray-600">
          Analyze performance of tests you've created for {session?.user.departmentName}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            My Test Results
          </CardTitle>
          <CardDescription>
            Performance analytics for tests you've created
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTestData.myTestResults.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{test.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      test.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {test.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {test.type} • {test.submissions} submissions • {test.date}
                  </p>
                </div>
                <div className="text-right">
                  {test.status === 'PUBLISHED' ? (
                    <>
                      <div className="text-lg font-semibold text-blue-600">
                        {test.avgScore}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {test.passRate}% pass rate
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No submissions yet
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            Recent Test Submissions
          </CardTitle>
          <CardDescription>
            Latest submissions to your tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockTestData.recentSubmissions.map((submission, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{submission.studentName}</h4>
                  <p className="text-sm text-gray-600">
                    {submission.testTitle}
                  </p>
                  <p className="text-xs text-gray-500">
                    Submitted: {submission.submittedAt}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-blue-600">
                    {submission.score}%
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    submission.status === 'PASSED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {submission.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student Performance in My Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Student Performance in My Tests
          </CardTitle>
          <CardDescription>
            How students are performing in tests you've created
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockTestData.studentPerformance.map((student, index) => (
              <div key={student.rollNumber} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{student.name}</h4>
                  <p className="text-sm text-gray-600">
                    {student.rollNumber} • {student.testsCompleted} tests completed
                  </p>
                  <p className="text-xs text-gray-500">
                    Last test: {student.lastTest}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-purple-600">
                    {student.avgScore}%
                  </div>
                  <div className="text-xs text-gray-500">average score</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for test management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium">Create New Test</h3>
              <p className="text-sm text-gray-600">Design a new test for students</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium">View Analytics</h3>
              <p className="text-sm text-gray-600">Detailed performance analytics</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-medium">Student Progress</h3>
              <p className="text-sm text-gray-600">Track individual student progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
