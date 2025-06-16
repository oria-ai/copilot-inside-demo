import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Trophy, Target, ChevronRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleProgress } from '@/hooks/useModuleProgress';

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  copilotLanguage: string;
  studyingLanguage: string;
  role: string;
}

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

// Mock data for modules
const modules = [
  {
    id: '1',
    title: 'מודול 1: יסודות הקופיילוט',
    progress: 75,
    lessons: 8,
    completedLessons: 6
  },
  {
    id: '2', 
    title: 'מודול 2: שיטות עבודה מתקדמות',
    progress: 30,
    lessons: 10,
    completedLessons: 3
  },
  {
    id: '3',
    title: 'מודול 3: אופטימיזציה וביצועים',
    progress: 0,
    lessons: 6,
    completedLessons: 0
  }
];

const StudentDashboard = ({ user, onLogout }: StudentDashboardProps) => {
  const navigate = useNavigate();
  const { getModuleProgress } = useModuleProgress();
  const [moduleProgress, setModuleProgress] = useState<any[]>([]);

  useEffect(() => {
    // Load progress for all modules
    const loadProgress = async () => {
      const progressData = await Promise.all(
        modules.map(async (module) => {
          const progress = await getModuleProgress(module.id);
          return {
            ...module,
            progress: progress?.completionPercentage || 0,
            completedLessons: progress?.completedLessons || 0
          };
        })
      );
      setModuleProgress(progressData);
    };
    
    loadProgress();
  }, [getModuleProgress]);

  const handleModuleClick = (moduleId: string) => {
    navigate(`/module/${moduleId}`);
  };

  const totalProgress = moduleProgress.length > 0 
    ? Math.round(moduleProgress.reduce((sum, module) => sum + module.progress, 0) / moduleProgress.length)
    : 0;

  const totalLessons = moduleProgress.reduce((sum, module) => sum + module.lessons, 0);
  const totalCompleted = moduleProgress.reduce((sum, module) => sum + module.completedLessons, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <img src="/squarelogo.png" alt="Copilot Inside" className="h-8 w-8" />
              <h1 className="text-xl font-semibold text-gray-900">Copilot Inside</h1>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-sm text-gray-600">שלום, {user.name}</span>
              <Button variant="outline" onClick={onLogout}>
                התנתק
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">ברוך הבא, {user.name}!</h2>
          <p className="text-lg text-gray-600">המשך במסע הלמידה שלך עם בינה מלאכותית</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-2xl font-bold text-gray-900">{totalProgress}%</p>
                  <p className="text-sm text-gray-600">התקדמות כוללת</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-2xl font-bold text-gray-900">{totalCompleted}</p>
                  <p className="text-sm text-gray-600">שיעורים הושלמו</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="mr-4">
                  <p className="text-2xl font-bold text-gray-900">{totalLessons - totalCompleted}</p>
                  <p className="text-sm text-gray-600">שיעורים נותרו</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <div className="mr-4">
                  <p className="text-2xl font-bold text-gray-900">{moduleProgress.filter(m => m.progress === 100).length}</p>
                  <p className="text-sm text-gray-600">מודולים הושלמו</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modules Grid */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">המודולים שלי</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {(moduleProgress.length > 0 ? moduleProgress : modules).map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <Badge variant={module.progress === 100 ? "default" : module.progress > 0 ? "secondary" : "outline"}>
                      {module.progress === 100 ? "הושלם" : module.progress > 0 ? "בתהליך" : "לא התחיל"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>התקדמות</span>
                        <span>{module.progress}%</span>
                      </div>
                      <Progress value={module.progress} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{module.completedLessons} מתוך {module.lessons} שיעורים</span>
                      <div className="flex items-center">
                        <Play className="h-4 w-4 ml-1" />
                        <span>המשך</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={() => handleModuleClick(module.id)}
                      variant={module.progress > 0 ? "default" : "outline"}
                    >
                      {module.progress === 0 ? "התחל מודול" : "המשך לימוד"}
                      <ChevronRight className="h-4 w-4 mr-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
