import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  FileText, 
  Plus, 
  TrendingUp,
  Clock,
  CheckCircle,
  Award,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

async function getStaffDashboardData(departmentId: string, userId: string) {
  const [
    myTestsCount,
    totalSubmissions,
    recentTests,
    departmentStats
  ] = await Promise.all([
    prisma.test.count({
      where: { 
        departmentId,
        createdById: userId
      }
    }),
    prisma.testSubmission.count({
      where: {
        test: {
          departmentId,
          createdById: userId
        }
      }
    }),
    prisma.test.findMany({
      where: { 
        departmentId,
        createdById: userId
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    }),
    {
      studentsCount: await prisma.student.count({
        where: { departmentId, isActive: true }
      }),
      placementsCount: await prisma.placement.count({
        where: { departmentId }
      })
    }
  ])

  return {
    myTestsCount,
    totalSubmissions,
    recentTests,
    departmentStats
  }
}

export default async function StaffDashboard() {
  const session = await getServerSession(authOptions)
  const data = await getStaffDashboardData(session!.user.departmentId, session!.user.id)

  const stats = [
    {
      title: 'My Tests',
      value: data.myTestsCount,
      icon: FileText,
      description: 'Tests created by you',
      color: 'text-blue-600'
    },
    {
      title: 'Total Submissions',
      value: data.totalSubmissions,
      icon: Users,
      description: 'Submissions to your tests',
      color: 'text-green-600'
    },
    {
      title: 'Department Students',
      value: data.departmentStats.studentsCount,
      icon: Users,
      description: 'Active students',
      color: 'text-purple-600'
    },
    {
      title: 'Department Placements',
      value: data.departmentStats.placementsCount,
      icon: Award,
      description: 'Total placements',
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {session!.user.name}. Manage your tests and track student performance.
          </p>
        </div>
        <Link href="/staff/tests/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Test
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My Recent Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            My Recent Tests
          </CardTitle>
          <CardDescription>
            Tests you've created recently
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentTests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No tests created yet</p>
              <Link href="/staff/tests/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Test
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.recentTests.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{test.title}</h4>
                    <p className="text-sm text-gray-600">
                      {test.type} • {test.duration} minutes • {test.totalMarks} marks
                    </p>
                    <p className="text-xs text-gray-500">
                      Created {new Date(test.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      {test._count.submissions} submissions
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                      <CheckCircle className="h-3 w-3" />
                      {test.status}
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center pt-4">
                <Link href="/staff/tests">
                  <Button variant="outline">View All Tests</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Create Test
            </CardTitle>
            <CardDescription>
              Create a new test for students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/staff/tests/create">
              <Button className="w-full">
                Create New Test
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              View Performance
            </CardTitle>
            <CardDescription>
              Analyze test performance data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/staff/test-performance">
              <Button variant="outline" className="w-full">
                View Performance
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Placement Stats
            </CardTitle>
            <CardDescription>
              Check placement statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/staff/placements">
              <Button variant="outline" className="w-full">
                View Placements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Tips for Staff */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Tips for Effective Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Creating Quality Tests</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Use clear, unambiguous questions</li>
                <li>• Set appropriate time limits</li>
                <li>• Include varied difficulty levels</li>
                <li>• Provide helpful explanations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Analyzing Results</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Review average scores regularly</li>
                <li>• Identify common mistakes</li>
                <li>• Adjust future test difficulty</li>
                <li>• Provide feedback to students</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
