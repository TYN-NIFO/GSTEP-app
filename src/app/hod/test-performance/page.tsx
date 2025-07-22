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
  BarChart3
} from 'lucide-react'

// Mock data for test performance
const mockTestData = {
  totalTests: 24,
  totalSubmissions: 456,
  averageScore: 78.5,
  passRate: 82,
  testsByType: [
    { type: 'APTITUDE', count: 8, avgScore: 75.2, submissions: 156 },
    { type: 'TECHNICAL', count: 10, avgScore: 82.1, submissions: 189 },
    { type: 'CODING', count: 4, avgScore: 71.8, submissions: 78 },
    { type: 'INTERVIEW', count: 2, avgScore: 85.3, submissions: 33 }
  ],
  recentTests: [
    { 
      title: 'Data Structures & Algorithms', 
      type: 'TECHNICAL', 
      submissions: 45, 
      avgScore: 84.2, 
      passRate: 89,
      createdBy: 'Prof. Michael Brown',
      date: '2024-01-15'
    },
    { 
      title: 'Logical Reasoning Test', 
      type: 'APTITUDE', 
      submissions: 52, 
      avgScore: 76.8, 
      passRate: 78,
      createdBy: 'Prof. Emily Davis',
      date: '2024-01-12'
    },
    { 
      title: 'JavaScript Fundamentals', 
      type: 'CODING', 
      submissions: 38, 
      avgScore: 79.5, 
      passRate: 85,
      createdBy: 'Prof. Michael Brown',
      date: '2024-01-10'
    },
    { 
      title: 'Database Management', 
      type: 'TECHNICAL', 
      submissions: 41, 
      avgScore: 81.3, 
      passRate: 87,
      createdBy: 'Prof. Emily Davis',
      date: '2024-01-08'
    }
  ],
  topPerformers: [
    { name: 'Alice Johnson', rollNumber: 'CSE2021001', avgScore: 94.5, testsCompleted: 12 },
    { name: 'Bob Smith', rollNumber: 'CSE2021002', avgScore: 91.2, testsCompleted: 11 },
    { name: 'Carol Brown', rollNumber: 'CSE2021003', avgScore: 89.8, testsCompleted: 13 },
    { name: 'David Wilson', rollNumber: 'CSE2021004', avgScore: 88.7, testsCompleted: 10 },
    { name: 'Emma Davis', rollNumber: 'CSE2021005', avgScore: 87.9, testsCompleted: 12 }
  ]
}

export default async function HODTestPerformancePage() {
  const session = await getServerSession(authOptions)

  const stats = [
    {
      title: 'Total Tests',
      value: mockTestData.totalTests,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Submissions',
      value: mockTestData.totalSubmissions,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Average Score',
      value: `${mockTestData.averageScore}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Pass Rate',
      value: `${mockTestData.passRate}%`,
      icon: CheckCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Test Performance Reports</h1>
        <p className="mt-2 text-gray-600">
          Analyze student test performance for {session?.user.departmentName}
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

      {/* Test Performance by Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Performance by Test Type
          </CardTitle>
          <CardDescription>
            Average scores and submission counts by test category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTestData.testsByType.map((testType) => (
              <div key={testType.type} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium capitalize">{testType.type.toLowerCase()} Tests</h4>
                  <p className="text-sm text-gray-600">
                    {testType.count} tests • {testType.submissions} submissions
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-blue-600">
                    {testType.avgScore.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">average score</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            Recent Test Results
          </CardTitle>
          <CardDescription>
            Latest test performance data from your department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTestData.recentTests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{test.title}</h4>
                  <p className="text-sm text-gray-600">
                    {test.type} • Created by {test.createdBy}
                  </p>
                  <p className="text-xs text-gray-500">
                    {test.date} • {test.submissions} submissions
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    {test.avgScore}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {test.passRate}% pass rate
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Top Performing Students
          </CardTitle>
          <CardDescription>
            Students with highest average test scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTestData.topPerformers.map((student, index) => (
              <div key={student.rollNumber} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{student.name}</h4>
                    <p className="text-sm text-gray-600">
                      {student.rollNumber} • {student.testsCompleted} tests completed
                    </p>
                  </div>
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
    </div>
  )
}
