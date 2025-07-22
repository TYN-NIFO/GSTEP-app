import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  GraduationCap, 
  Users, 
  TrendingUp, 
  Award,
  Mail,
  Phone,
  Calendar,
  FileText
} from 'lucide-react'

// Mock data for students (same as HOD but from staff perspective)
const mockStudentData = {
  totalStudents: 156,
  myTestTakers: 89, // Students who have taken tests created by this staff
  averagePerformance: 82.5,
  recentTestTakers: [
    {
      name: 'Alice Johnson',
      rollNumber: 'CSE2021001',
      email: 'alice.johnson@student.edu',
      year: 4,
      semester: 8,
      cgpa: 8.5,
      testsCompleted: 6,
      avgScore: 94.5,
      lastTestDate: '2024-01-15',
      lastTestScore: 95
    },
    {
      name: 'Bob Smith',
      rollNumber: 'CSE2021002',
      email: 'bob.smith@student.edu',
      year: 4,
      semester: 8,
      cgpa: 7.8,
      testsCompleted: 5,
      avgScore: 87.2,
      lastTestDate: '2024-01-12',
      lastTestScore: 82
    },
    {
      name: 'Carol Brown',
      rollNumber: 'CSE2021003',
      email: 'carol.brown@student.edu',
      year: 3,
      semester: 6,
      cgpa: 9.1,
      testsCompleted: 6,
      avgScore: 91.8,
      lastTestDate: '2024-01-10',
      lastTestScore: 88
    },
    {
      name: 'David Wilson',
      rollNumber: 'CSE2021004',
      email: 'david.wilson@student.edu',
      year: 4,
      semester: 8,
      cgpa: 8.2,
      testsCompleted: 4,
      avgScore: 83.7,
      lastTestDate: '2024-01-08',
      lastTestScore: 76
    },
    {
      name: 'Emma Davis',
      rollNumber: 'CSE2021005',
      email: 'emma.davis@student.edu',
      year: 2,
      semester: 4,
      cgpa: 8.8,
      testsCompleted: 5,
      avgScore: 89.9,
      lastTestDate: '2024-01-05',
      lastTestScore: 92
    }
  ],
  topPerformers: [
    { name: 'Alice Johnson', rollNumber: 'CSE2021001', avgScore: 94.5, testsCompleted: 6 },
    { name: 'Carol Brown', rollNumber: 'CSE2021003', avgScore: 91.8, testsCompleted: 6 },
    { name: 'Emma Davis', rollNumber: 'CSE2021005', avgScore: 89.9, testsCompleted: 5 },
    { name: 'Bob Smith', rollNumber: 'CSE2021002', avgScore: 87.2, testsCompleted: 5 },
    { name: 'David Wilson', rollNumber: 'CSE2021004', avgScore: 83.7, testsCompleted: 4 }
  ],
  performanceByTest: [
    { testName: 'Data Structures & Algorithms', avgScore: 84.2, submissions: 45 },
    { testName: 'JavaScript Fundamentals', avgScore: 79.5, submissions: 38 },
    { testName: 'Object Oriented Programming', avgScore: 76.8, submissions: 42 }
  ]
}

export default async function StaffStudentsPage() {
  const session = await getServerSession(authOptions)

  const stats = [
    {
      title: 'Department Students',
      value: mockStudentData.totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'My Test Takers',
      value: mockStudentData.myTestTakers,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Average Performance',
      value: `${mockStudentData.averagePerformance}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Top Performers',
      value: mockStudentData.topPerformers.length,
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Performance</h1>
        <p className="mt-2 text-gray-600">
          Track student performance in your tests for {session?.user.departmentName}
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

      {/* Performance by Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Performance by My Tests
          </CardTitle>
          <CardDescription>
            How students are performing in tests you've created
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockStudentData.performanceByTest.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{test.testName}</h4>
                  <p className="text-sm text-gray-600">
                    {test.submissions} students attempted
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-blue-600">
                    {test.avgScore}%
                  </div>
                  <div className="text-xs text-gray-500">average score</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers in My Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Top Performers in My Tests
          </CardTitle>
          <CardDescription>
            Students with highest average scores in your tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockStudentData.topPerformers.map((student, index) => (
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

      {/* Recent Test Takers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Recent Test Activity
          </CardTitle>
          <CardDescription>
            Students who recently took your tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockStudentData.recentTestTakers.map((student) => (
              <div key={student.rollNumber} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-lg">{student.name}</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        Year {student.year}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        {student.rollNumber}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {student.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        CGPA: {student.cgpa}
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {student.testsCompleted} tests completed
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Last test: {student.lastTestDate} • Score: {student.lastTestScore}%
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-semibold text-green-600">
                      {student.avgScore}%
                    </div>
                    <div className="text-xs text-gray-500">avg in my tests</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Student Guidance Actions</CardTitle>
          <CardDescription>
            Tools to help students improve their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium">Create Practice Test</h3>
              <p className="text-sm text-gray-600">Design practice tests for weak areas</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium">Student Feedback</h3>
              <p className="text-sm text-gray-600">Provide personalized feedback</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <Award className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-medium">Performance Report</h3>
              <p className="text-sm text-gray-600">Generate detailed performance reports</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
