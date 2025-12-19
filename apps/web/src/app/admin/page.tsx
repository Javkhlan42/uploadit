import { requireAdmin } from '../../lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, 
  Users, 
  Database, 
  Settings, 
  Activity,
  LogOut,
  User,
  Mail,
  Calendar,
  CheckCircle,
  TrendingUp,
  FileText,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export default async function AdminPage() {
  try {
    const user = await requireAdmin();
    
    // Mock data for demonstration
    const stats = {
      totalUsers: 1248,
      totalOrganizations: 567,
      activeCategories: 24,
      monthlyGrowth: 12.5
    };

    const recentActivity = [
      { action: 'Шинэ хэрэглэгч бүртгэгдсэн', user: 'user@example.com', time: '5 минутын өмнө' },
      { action: 'Байгууллага нэмэгдсэн', user: 'admin@yellowbook.mn', time: '15 минутын өмнө' },
      { action: 'Ангилал шинэчлэгдсэн', user: 'editor@yellowbook.mn', time: '1 цагийн өмнө' },
    ];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        {/* Header with User Info */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="bg-yellow-400 rounded-full p-3">
                  <Shield className="w-6 h-6 text-yellow-900" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Yellow Books удирдлагын систем</p>
                </div>
              </div>
              
              {/* User Profile Section */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <p className="text-sm font-semibold text-gray-900">
                      {user.name || 'Admin User'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">{(user as any).email}</p>
                  <Badge className="mt-1 bg-yellow-400 text-yellow-900 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-yellow-900 font-bold text-lg border-2 border-yellow-300">
                  {user.name?.[0]?.toUpperCase() || 'A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Message */}
          <div className="mb-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-yellow-900 mb-2">
                  Сайн байна уу, {user.name || 'Admin'}! 👋
                </h2>
                <p className="text-yellow-800">
                  Та системд <strong>admin</strong> эрхээр нэвтэрсэн байна. 
                  Бүх удирдлагын функцүүд боломжтой.
                </p>
              </div>
              <Link href="/api/auth/signout">
                <Button variant="outline" className="bg-white hover:bg-yellow-50 text-yellow-900 border-yellow-300">
                  <LogOut className="w-4 h-4 mr-2" />
                  Гарах
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Нийт хэрэглэгч
                  </CardTitle>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
                <p className="text-xs text-green-600 flex items-center mt-2">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% өнгөрсөн сараас
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Байгууллага
                  </CardTitle>
                  <Database className="w-5 h-5 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.totalOrganizations}</div>
                <p className="text-xs text-green-600 flex items-center mt-2">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8% өнгөрсөн сараас
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-orange-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Идэвхтэй ангилал
                  </CardTitle>
                  <Settings className="w-5 h-5 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.activeCategories}</div>
                <p className="text-xs text-gray-500 mt-2">Нийт ангиллын тоо</p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Сарын өсөлт
                  </CardTitle>
                  <BarChart3 className="w-5 h-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.monthlyGrowth}%</div>
                <p className="text-xs text-green-600 flex items-center mt-2">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Үргэлжилж байна
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Session Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-yellow-600" />
                  Миний session мэдээлэл
                </CardTitle>
                <CardDescription>Одоогийн нэвтэрсэн хэрэглэгчийн дэлгэрэнгүй</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Нэр</p>
                        <p className="text-base font-semibold text-gray-900">{user.name || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email хаяг</p>
                        <p className="text-base font-semibold text-gray-900">{(user as any).email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Эрхийн түвшин</p>
                        <Badge className="mt-1 bg-yellow-400 text-yellow-900">
                          {(user as any).role || 'admin'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Нэвтэрсэн цаг</p>
                        <p className="text-base font-semibold text-gray-900">
                          {new Date().toLocaleString('mn-MN')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">User ID</p>
                        <p className="text-sm font-mono text-gray-700">{(user as any).id || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-yellow-600" />
                  Сүүлийн үйл ажиллагаа
                </CardTitle>
                <CardDescription>Системийн сүүлийн үйлдлүүд</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-b-0">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500 truncate">{activity.user}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Info */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-green-900 mb-2">
                  🔒 Аюулгүй байдлын мэдээлэл
                </h3>
                <p className="text-sm text-green-700 mb-3">
                  Энэ хуудас зөвхөн <strong>admin</strong> эрхтэй хэрэглэгчид нээлттэй. 
                  Server-side session guard ашигласан.
                </p>
                <ul className="text-sm text-green-700 space-y-1.5">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    SSR Guard: getServerSession() ашигласан
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Role Check: session.user.role === &apos;admin&apos;
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    CSRF Protection: NextAuth автоматаар идэвхжүүлсэн
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Secure Cookies: httpOnly, sameSite: &apos;lax&apos;
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    redirect('/');
  }
}
