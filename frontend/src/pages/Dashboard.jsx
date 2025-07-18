import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../components/ui/Card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  RadialBarChart, RadialBar
} from 'recharts';
import { 
  Users, FolderOpen, CheckCircle, Clock, TrendingUp, Calendar,
  Activity, Target, Award, Briefcase
} from 'lucide-react';
import Header from "../components/Header/Header";
import { IconLayoutGrid } from "@tabler/icons-react";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [details, setDetails] = useState(null);

  // Örneğin token'ı localStorage'dan alıyoruz
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summaryRes = await axios.get("http://localhost:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const detailsRes = await axios.get("http://localhost:5000/api/dashboard/details", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSummary(summaryRes.data);
        setDetails(detailsRes.data.data);
      } catch (err) {
        console.error("Dashboard verisi alınamadı:", err);
      }
    };

    fetchData();
  }, [token]);

  if (!summary || !details) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Chart colors
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  const gradientColors = [
    'from-blue-500 to-blue-600',
    'from-emerald-500 to-emerald-600', 
    'from-amber-500 to-amber-600',
    'from-red-500 to-red-600',
    'from-purple-500 to-purple-600',
    'from-cyan-500 to-cyan-600'
  ];

  // Prepare chart data - API'den gelen verileri kontrol et
  const taskCompletionData = details?.userTaskStats?.map(user => ({
    name: user.fullName.split(' ')[0],
    completed: user.completedTasks,
    ongoing: user.ongoingTasks,
    total: user.totalTasks,
    completionRate: Math.round((user.completedTasks / user.totalTasks) * 100)
  })) || [];

  const processDistributionData = details?.processTaskStats?.map((proc, index) => ({
    ...proc,
    fill: colors[index % colors.length]
  })) || [];

  const statusDistributionData = details?.taskStatusStats?.map((status, index) => ({
    ...status,
    fill: colors[index % colors.length]
  })) || [];

  const completionRate = summary ? Math.round((summary.completedTasks / summary.totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
            <div>
              <Header 
                title="Dashboard"
                subtitle="Yönetim Paneli"
                icon={IconLayoutGrid}
              />
            </div>
            <div className="flex justify-end items-center space-x-4 px-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Son Güncelleme</p>
                <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString('tr-TR')}</p>
              </div>
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
           
         
       
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <KPICard
            title="Toplam Proje"
            value={summary?.totalProjects || 0}
            icon={<FolderOpen className="h-6 w-6" />}
            gradient="from-blue-500 to-blue-600"
            change="+12%"
            changeType="positive"
          />
          <KPICard
            title="Toplam Görev"
            value={summary?.totalTasks || 0}
            icon={<Target className="h-6 w-6" />}
            gradient="from-emerald-500 to-emerald-600"
            change="+8%"
            changeType="positive"
          />
          <KPICard
            title="Tamamlanan"
            value={summary?.completedTasks || 0}
            icon={<CheckCircle className="h-6 w-6" />}
            gradient="from-green-500 to-green-600"
            change="+15%"
            changeType="positive"
          />
          <KPICard
            title="Devam Eden"
            value={summary?.ongoingTasks || 0}
            icon={<Clock className="h-6 w-6" />}
            gradient="from-amber-500 to-amber-600"
            change="-5%"
            changeType="negative"
          />
          <KPICard
            title="Toplam Kullanıcı"
            value={summary?.totalUsers || 0}
            icon={<Users className="h-6 w-6" />}
            gradient="from-purple-500 to-purple-600"
            change="+2"
            changeType="positive"
          />
          <KPICard
            title="Bu Ay Başlayan"
            value={summary?.projectsStartedThisMonth || 0}
            icon={<Calendar className="h-6 w-6" />}
            gradient="from-cyan-500 to-cyan-600"
            change="+25%"
            changeType="positive"
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Completion Rate Gauge */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tamamlanma Oranı</h3>
                <Award className="h-5 w-5 text-gray-400" />
              </div>
              <div className="relative">
                <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{value: completionRate, fill: '#3B82F6'}]}>
                    <RadialBar dataKey="value" cornerRadius={10} fill="#3B82F6" />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{completionRate}%</div>
                    <div className="text-sm text-gray-500">Tamamlandı</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task Status Distribution */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Görev Durumu</h3>
                <Briefcase className="h-5 w-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {statusDistributionData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.fill}}></div>
                    <span className="text-xs text-gray-600">{item.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Process Distribution */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Proses Dağılımı</h3>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={processDistributionData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="processName" type="category" width={80} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="totalTasks" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* User Performance Chart */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Kullanıcı Performansı</h3>
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskCompletionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10B981" name="Tamamlanan" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ongoing" fill="#F59E0B" name="Devam Eden" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed User Stats */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Detaylı Kullanıcı İstatistikleri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {details?.userTaskStats?.map((user, index) => (
                <UserStatCard
                  key={user.userId}
                  user={user}
                  gradient={gradientColors[index % gradientColors.length]}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// KPI Card Component
const KPICard = ({ title, value, icon, gradient, change, changeType }) => (
  <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} text-white`}>
          {icon}
        </div>
        <div className={`text-sm font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </CardContent>
  </Card>
);

// User Stat Card Component
const UserStatCard = ({ user, gradient }) => {
  const completionRate = Math.round((user.completedTasks / user.totalTasks) * 100);
  
  return (
    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center text-white font-semibold`}>
            {user.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{user.fullName}</h4>
            <p className="text-sm text-gray-500">{completionRate}% tamamlandı</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Toplam</span>
            <span className="font-medium">{user.totalTasks}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tamamlanan</span>
            <span className="font-medium text-green-600">{user.completedTasks}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Devam Eden</span>
            <span className="font-medium text-amber-600">{user.ongoingTasks}</span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;