import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface StudentDashboardProps {
  userData: any;
  onModuleClick: (moduleId: string) => void;
}

const api = 'http://localhost:4000';

const StudentDashboard = ({ userData, onModuleClick }: StudentDashboardProps) => {
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [totalLessons, setTotalLessons] = useState(3); // update if you add more lessons

  useEffect(() => {
    const fetchProgress = async () => {
      const res = await fetch(`${api}/progress/${userData.id || userData.email}`);
      if (res.ok) {
        const data = await res.json();
        const total = data.reduce((sum, p) => sum + (p.percent || 0), 0);
        setCompletedLessons(data.filter(p => p.percent === 100).length);
        setOverallProgress(Math.round((total / (totalLessons * 100)) * 100));
      }
    };
    fetchProgress();
  }, [userData, totalLessons]);

  const modules = [
    {
      id: 'basics',
      title: 'יסודות',
      progress: overallProgress,
      description: 'לימוד יסודות המערכת',
      lessons: totalLessons,
      completedLessons: completedLessons
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">דף הבית</h1>
          <div className="text-sm text-gray-600">
            שלום, {userData.email} | {userData.department}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main content - 70% */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">המודולים שלי</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => (
                <Card key={module.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onModuleClick(module.id)}>
                  <CardHeader>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>{module.progress}% הושלם</span>
                        <span>{module.completedLessons}/{module.lessons} שיעורים</span>
                      </div>
                      <Progress value={module.progress} className="h-2" />
                      <Button className="w-full mt-3">המשך לימוד</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - 30% */}
        <div className="w-80 bg-white border-l p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">המשימות שלי</h3>
          <div className="text-center text-gray-500 py-8">
            <p>אין משימות פעילות כרגע</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
