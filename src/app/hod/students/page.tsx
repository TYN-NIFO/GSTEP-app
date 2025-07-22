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
  Calendar
} from 'lucide-react'

// Mock data for students
const mockStudentData = {
  totalStudents: 156,
  activeStudents: 148,
  averageCGPA: 8.2,
  placedStudents: 89,
  studentsByYear: [
    { year: 1, count: 42, avgCGPA: 8.5 },
    { year: 2, count: 38, avgCGPA: 8.3 },
    { year: 3, count: 35, avgCGPA: 8.1 },
    { year: 4, count: 33, avgCGPA: 7.9 }
  ],
  recentStudents: [
    {
      name: 'Alice Johnson',
      rollNumber: 'CSE2021001',
      email: 'alice.johnson@student.edu',
      phone: '+1234567890',
      year: 4,
      semester: 8,
      cgpa: 8.5,
      status: 'Active',
      placementStatus: 'Placed'
    },
    {
      name: 'Bob Smith',
      rollNumber: 'CSE2021002',
      email: 'bob.smith@student.edu',
      phone: '+1234567891',
      year: 4,
      semester: 8,
      cgpa: 7.8,
      status: 'Active',
      placementStatus: 'Interviewing'
    },
    {
      name: 'Carol Brown',
      rollNumber: 'CSE2021003',
      email: 'carol.brown@student.edu',
      phone: '+1234567892',
      year: 3,
      semester: 6,
      cgpa: 9.1,
      status: 'Active',
      placementStatus: 'Not Applied'
    },
    {
      name: 'David Wilson',
      rollNumber: 'CSE2021004',
      email: 'david.wilson@student.edu',
      phone: '+1234567893',
      year: 4,
      semester: 8,
      cgpa: 8.2,
      status: 'Active',
      placementStatus: 'Applied'
    },
    {
      name: 'Emma Davis',
      rollNumber: 'CSE2021005',
      email: 'emma.davis@student.edu',
      phone: '+1234567894',
      year: 2,
      semester: 4,
      cgpa: 8.8,
      status: 'Active',
      placementStatus: 'Not Eligible'
    }
  ],
  topPerformers: [
    { name: 'Carol Brown', rollNumber: 'CSE2021003', cgpa: 9.1, year: 3 },
    { name: 'Emma Davis', rollNumber: 'CSE2021005', cgpa: 8.8, year: 2 },
    { name: 'Alice Johnson', rollNumber: 'CSE2021001', cgpa: 8.5, year: 4 },
    { name: 'David Wilson', rollNumber: 'CSE2021004', cgpa: 8.2, year: 4 },
    { name: 'Bob Smith', rollNumber: 'CSE2021002', cgpa: 7.8, year: 4 }
  ]
}

export default async function HODStudentsPage() {
  const session = await getServerSession(authOptions)

  const stats = [
    {
      title: 'Total Students',
      value: mockStudentData.totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Students',
      value: mockStudentData.activeStudents,
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Average CGPA',
      value: mockStudentData.averageCGPA.toFixed(1),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Placed Students',
      value: mockStudentData.placedStudents,
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
        <p className="mt-2 text-gray-600">
          Manage and track students in {session?.user.departmentName}
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

      {/* Students by Year */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Students by Academic Year
          </CardTitle>
          <CardDescription>
            Distribution of students across different academic years
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockStudentData.studentsByYear.map((yearData) => (
              <div key={yearData.year} className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {yearData.count}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Year {yearData.year}
                </div>
                <div className="text-xs text-gray-500">
                  Avg CGPA: {yearData.avgCGPA}
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
            Top Academic Performers
          </CardTitle>
          <CardDescription>
            Students with highest CGPA in the department
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
                      {student.rollNumber} • Year {student.year}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-purple-600">
                    {student.cgpa}
                  </div>
                  <div className="text-xs text-gray-500">CGPA</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Student Directory
          </CardTitle>
          <CardDescription>
            Complete list of students with their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockStudentData.recentStudents.map((student) => (
              <div key={student.rollNumber} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-lg">{student.name}</h4>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        {student.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        {student.rollNumber}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {student.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {student.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Year {student.year}, Semester {student.semester}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-semibold text-blue-600">
                      {student.cgpa}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">CGPA</div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      student.placementStatus === 'Placed' ? 'bg-green-100 text-green-700' :
                      student.placementStatus === 'Interviewing' ? 'bg-blue-100 text-blue-700' :
                      student.placementStatus === 'Applied' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {student.placementStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
