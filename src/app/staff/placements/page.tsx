import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2,
  Award,
  CheckCircle,
  Clock
} from 'lucide-react'

// Mock data for staff placement view
const mockPlacementData = {
  departmentStats: {
    totalApplications: 156,
    selected: 89,
    pending: 34,
    rejected: 33,
    placementRate: 57
  },
  myStudentsPlaced: 23,
  companiesRecruited: 12,
  recentPlacements: [
    { studentName: 'Alice Johnson', company: 'TechCorp Solutions', position: 'Software Engineer', package: 12.5, status: 'SELECTED', date: '2024-01-15' },
    { studentName: 'Bob Smith', company: 'InnovateTech', position: 'Frontend Developer', package: 10.0, status: 'SELECTED', date: '2024-01-12' },
    { studentName: 'Carol Brown', company: 'DataDynamics', position: 'Data Analyst', package: 8.5, status: 'SELECTED', date: '2024-01-10' },
    { studentName: 'David Wilson', company: 'CloudSystems', position: 'DevOps Engineer', package: 11.0, status: 'INTERVIEWED', date: '2024-01-08' },
    { studentName: 'Emma Davis', company: 'AI Innovations', position: 'ML Engineer', package: 15.0, status: 'PENDING', date: '2024-01-05' }
  ],
  upcomingInterviews: [
    { studentName: 'John Doe', company: 'TechStart Inc', position: 'Full Stack Developer', date: '2024-01-20', time: '10:00 AM' },
    { studentName: 'Jane Smith', company: 'Innovation Labs', position: 'UI/UX Designer', date: '2024-01-22', time: '2:00 PM' },
    { studentName: 'Mike Johnson', company: 'Data Corp', position: 'Data Scientist', date: '2024-01-25', time: '11:30 AM' }
  ]
}

export default async function StaffPlacementsPage() {
  const session = await getServerSession(authOptions)

  const stats = [
    {
      title: 'Department Applications',
      value: mockPlacementData.departmentStats.totalApplications,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Students Selected',
      value: mockPlacementData.departmentStats.selected,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'My Students Placed',
      value: mockPlacementData.myStudentsPlaced,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Placement Rate',
      value: `${mockPlacementData.departmentStats.placementRate}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Placement Statistics</h1>
        <p className="mt-2 text-gray-600">
          Track placement performance for {session?.user.departmentName}
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

      {/* Upcoming Interviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Upcoming Interviews
          </CardTitle>
          <CardDescription>
            Scheduled interviews for department students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPlacementData.upcomingInterviews.map((interview, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                <div>
                  <h4 className="font-medium">{interview.studentName}</h4>
                  <p className="text-sm text-gray-600">
                    {interview.position} at {interview.company}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-600">
                    {interview.date}
                  </div>
                  <div className="text-xs text-gray-500">
                    {interview.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Placements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            Recent Placement Updates
          </CardTitle>
          <CardDescription>
            Latest placement activities and results from the department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPlacementData.recentPlacements.map((placement, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{placement.studentName}</h4>
                  <p className="text-sm text-gray-600">
                    {placement.position} at {placement.company}
                  </p>
                  <p className="text-xs text-gray-500">
                    Package: ₹{placement.package} LPA • {placement.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {placement.status === 'SELECTED' && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      <CheckCircle className="h-3 w-3" />
                      Selected
                    </span>
                  )}
                  {placement.status === 'INTERVIEWED' && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      <Clock className="h-3 w-3" />
                      Interviewed
                    </span>
                  )}
                  {placement.status === 'PENDING' && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                      <Clock className="h-3 w-3" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Actions</CardTitle>
          <CardDescription>
            Common placement-related tasks for staff members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium">Student Guidance</h3>
              <p className="text-sm text-gray-600">Help students with placement preparation</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <Building2 className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium">Company Coordination</h3>
              <p className="text-sm text-gray-600">Coordinate with recruiting companies</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-medium">Track Progress</h3>
              <p className="text-sm text-gray-600">Monitor student placement progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
