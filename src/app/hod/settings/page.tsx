import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Settings, 
  User, 
  Lock,
  Bell,
  Shield,
  Database,
  Download,
  Mail
} from 'lucide-react'

export default async function HODSettingsPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">First Name</label>
                  <Input 
                    defaultValue={session?.user.name?.split(' ')[0] || ''}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <Input 
                    defaultValue={session?.user.name?.split(' ').slice(1).join(' ') || ''}
                    className="form-input"
                  />
                </div>
              </div>
              
              <div>
                <label className="form-label">Email Address</label>
                <Input 
                  type="email"
                  defaultValue={session?.user.email || ''}
                  className="form-input"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Contact administrator to change email address
                </p>
              </div>

              <div>
                <label className="form-label">Department</label>
                <Input 
                  defaultValue={session?.user.departmentName || ''}
                  className="form-input"
                  disabled
                />
              </div>

              <div>
                <label className="form-label">Role</label>
                <Input 
                  defaultValue={session?.user.role || ''}
                  className="form-input"
                  disabled
                />
              </div>

              <Button>
                <User className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-600" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="form-label">Current Password</label>
                <Input 
                  type="password"
                  placeholder="Enter current password"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">New Password</label>
                <Input 
                  type="password"
                  placeholder="Enter new password"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Confirm New Password</label>
                <Input 
                  type="password"
                  placeholder="Confirm new password"
                  className="form-input"
                />
              </div>

              <Button variant="outline">
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-green-600" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">New Test Submissions</h4>
                    <p className="text-sm text-gray-600">Get notified when students submit tests</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Placement Updates</h4>
                    <p className="text-sm text-gray-600">Receive updates about student placements</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Reports</h4>
                    <p className="text-sm text-gray-600">Get weekly summary reports</p>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">System Updates</h4>
                    <p className="text-sm text-gray-600">Important system announcements</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>

              <Button variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Account Type:</span>
                <span className="font-medium">HOD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium">{session?.user.departmentName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Login:</span>
                <span className="font-medium">Today</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Account Status:</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-purple-600" />
                Data Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Export your department's data for backup or analysis
              </p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Placement Data
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Test Reports
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Student Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-orange-600" />
                Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Need help? Contact our support team
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <div className="text-xs text-gray-500">
                <p>Email: support@hodsystem.edu</p>
                <p>Phone: +1 (555) 123-4567</p>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-gray-600" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Version:</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Last Update:</span>
                <span>Jan 2024</span>
              </div>
              <div className="flex justify-between">
                <span>Server Status:</span>
                <span className="text-green-600">Online</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
