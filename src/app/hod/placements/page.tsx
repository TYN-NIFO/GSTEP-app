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
  Clock,
  XCircle
} from 'lucide-react'

// Mock data for placements
const mockPlacementData = {
  totalApplications: 156,
  selected: 89,
  pending: 34,
  rejected: 33,
  placementRate: 57,
  topCompanies: [
    { name: 'TechCorp Solutions', selected: 15, applied: 25 },
    { name: 'InnovateTech', selected: 12, applied: 20 },
    { name: 'DataDynamics', selected: 8, applied: 15 },
    { name: 'CloudSystems', selected: 6, applied: 12 },
    { name: 'AI Innovations', selected: 5, applied: 10 }
  ],
  recentPlacements: [
    { studentName: 'Alice Johnson', company: 'TechCorp Solutions', position: 'Software Engineer', package: 12.5, status: 'SELECTED' },
    { studentName: 'Bob Smith', company: 'InnovateTech', position: 'Frontend Developer', package: 10.0, status: 'SELECTED' },
    { studentName: 'Carol Brown', company: 'DataDynamics', position: 'Data Analyst', package: 8.5, status: 'SELECTED' },
    { studentName: 'David Wilson', company: 'CloudSystems', position: 'DevOps Engineer', package: 11.0, status: 'INTERVIEWED' },
    { studentName: 'Emma Davis', company: 'AI Innovations', position: 'ML Engineer', package: 15.0, status: 'PENDING' }
  ]
}

export default async function HODPlacementsPage() {
  const session = await getServerSession(authOptions)

  const stats = [
    {
      title: 'Total Applications',
      value: mockPlacementData.totalApplications,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Students Selected',
      value: mockPlacementData.selected,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Results',
      value: mockPlacementData.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Placement Rate',
      value: `${mockPlacementData.placementRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
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

      {/* Top Companies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Top Recruiting Companies
          </CardTitle>
          <CardDescription>
            Companies with highest placement rates from your department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPlacementData.topCompanies.map((company, index) => (
              <div key={company.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{company.name}</h4>
                    <p className="text-sm text-gray-600">
                      {company.selected} selected out of {company.applied} applications
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    {Math.round((company.selected / company.applied) * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">success rate</div>
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
            <Award className="h-5 w-5 text-purple-600" />
            Recent Placement Updates
          </CardTitle>
          <CardDescription>
            Latest placement activities and results
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
                    Package: ₹{placement.package} LPA
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
    </div>
  )
}
