import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  GraduationCap, 
  FileText, 
  TrendingUp,
  Building2,
  Award,
  Clock,
  CheckCircle
} from 'lucide-react'

async function getDashboardData(departmentId: string) {
  const [
    studentsCount,
    testsCount,
    placementsCount,
    recentTests,
    placementStats
  ] = await Promise.all([
    prisma.student.count({
      where: { departmentId, isActive: true }
    }),
    prisma.test.count({
      where: { departmentId }
    }),
    prisma.placement.count({
      where: { departmentId }
    }),
    prisma.test.findMany({
      where: { departmentId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        createdBy: {
          select: { firstName: true, lastName: true }
        },
        _count: {
          select: { submissions: true }
        }
      }
    }),
    prisma.placement.groupBy({
      by: ['status'],
      where: { departmentId },
      _count: { status: true }
    })
  ])

  return {
    studentsCount,
    testsCount,
    placementsCount,
    recentTests,
    placementStats
  }
}

export default async function HODDashboard() {
  const session = await getServerSession(authOptions)
  const data = await getDashboardData(session!.user.departmentId)

  const stats = [
    {
      title: 'Total Students',
      value: data.studentsCount,
      icon: GraduationCap,
      description: 'Active students in department',
      color: 'text-blue-600'
    },
    {
      title: 'Total Tests',
      value: data.testsCount,
      icon: FileText,
      description: 'Tests created by staff',
      color: 'text-green-600'
    },
    {
      title: 'Placements',
      value: data.placementsCount,
      icon: Award,
      description: 'Total placement records',
      color: 'text-purple-600'
    },
    {
      title: 'Department',
      value: session!.user.departmentName,
      icon: Building2,
      description: 'Your department',
      color: 'text-orange-600',
      isText: true
    }
  ]

  const selectedPlacements = data.placementStats.find(p => p.status === 'SELECTED')?._count.status || 0
  const totalPlacements = data.placementStats.reduce((sum, p) => sum + p._count.status, 0)
  const placementRate = totalPlacements > 0 ? Math.round((selectedPlacements / totalPlacements) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">HOD Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {session!.user.name}. Here's what's happening in your department.
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
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.isText ? stat.value : stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placement Rate Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Placement Success Rate
          </CardTitle>
          <CardDescription>
            Current placement statistics for your department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {placementRate}%
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {selectedPlacements} selected out of {totalPlacements} total applications
          </p>
          <div className="mt-4 space-y-2">
            {data.placementStats.map((stat) => (
              <div key={stat.status} className="flex justify-between text-sm">
                <span className="capitalize">{stat.status.toLowerCase()}</span>
                <span className="font-medium">{stat._count.status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Recent Tests
          </CardTitle>
          <CardDescription>
            Latest tests created by your department staff
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentTests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No tests created yet
            </p>
          ) : (
            <div className="space-y-4">
              {data.recentTests.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{test.title}</h4>
                    <p className="text-sm text-gray-600">
                      Created by {test.createdBy.firstName} {test.createdBy.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {test.type} • {test.duration} minutes • {test.totalMarks} marks
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for HOD users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/hod/placements"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Award className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-medium">View Placements</h3>
              <p className="text-sm text-gray-600">Check placement statistics</p>
            </a>
            <a
              href="/hod/test-performance"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium">Test Performance</h3>
              <p className="text-sm text-gray-600">Analyze test results</p>
            </a>
            <a
              href="/hod/students"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <GraduationCap className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium">Manage Students</h3>
              <p className="text-sm text-gray-600">View student records</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
