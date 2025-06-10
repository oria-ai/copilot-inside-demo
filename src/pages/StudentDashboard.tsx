
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Trophy, ArrowLeft } from 'lucide-react';

interface StudentDashboardProps {
  userData: any;
  onModuleClick: (moduleId: string) => void;
}

const api = 'http://localhost:4000';

const StudentDashboard = ({ userData, onModuleClick }: StudentDashboardProps) => {
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [totalLessons, setTotalLessons] = useState(3);

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
    <div className="min-h-screen bg-gradient-light" dir="rtl">
      {/* Header with gradient */}
      <header className="bg-gradient-turquoise shadow-soft border-b-0 px-6 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">ברוכים הבאים לפלטפורמה</h1>
            <p className="text-white/90">קורס אינטראקטיבי ב-Copilot שמביא אתכם לעבודה מעשית עם AI</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-white">
            <div className="text-sm opacity-90">שלום,</div>
            <div className="font-semibold">{userData.email}</div>
            <div className="text-sm opacity-90">{userData.department}</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-card shadow-card rounded-2xl border-0">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-turquoise w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark-gray mb-1">{totalLessons}</h3>
              <p className="text-medium-gray">שיעורים זמינים</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card rounded-2xl border-0">
            <CardContent className="p-6 text-center">
              <div className="bg-green w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark-gray mb-1">{completedLessons}</h3>
              <p className="text-medium-gray">שיעורים הושלמו</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card rounded-2xl border-0">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-turquoise w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark-gray mb-1">{overallProgress}%</h3>
              <p className="text-medium-gray">התקדמות כללית</p>
            </CardContent>
          </Card>
        </div>

        {/* My Courses Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-dark-gray mb-4">הקורסים שלי</h2>
            <p className="text-medium-gray text-lg">התחילו את המסע שלכם לעולם ה-AI</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module) => (
              <Card 
                key={module.id} 
                className="bg-gradient-card shadow-card hover:shadow-xl transition-all duration-300 cursor-pointer rounded-3xl border-0 overflow-hidden group"
                onClick={() => onModuleClick(module.id)}
              >
                <div className="h-32 bg-gradient-turquoise relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-white/20 rounded-xl px-3 py-1">
                      <span className="text-white font-semibold text-sm">{module.progress}%</span>
                    </div>
                  </div>
                </div>
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-dark-gray">{module.title}</CardTitle>
                  <p className="text-medium-gray">{module.description}</p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-medium-gray">
                      <span>{module.completedLessons}/{module.lessons} שיעורים</span>
                      <span>{module.progress}% הושלם</span>
                    </div>
                    <Progress value={module.progress} className="h-3 rounded-full" />
                    <Button className="w-full bg-gradient-turquoise hover:opacity-90 text-white rounded-2xl h-12 font-semibold shadow-soft transition-all duration-300 group-hover:scale-105">
                      המשך לימוד
                      <ArrowLeft className="mr-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Open Tasks Section */}
        <div className="bg-white rounded-3xl shadow-card p-8">
          <h3 className="text-2xl font-bold text-dark-gray mb-6 text-center">המשימות שלי</h3>
          <div className="text-center text-medium-gray py-12">
            <div className="bg-light-gray w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Clock className="h-10 w-10 text-medium-gray" />
            </div>
            <p className="text-lg">אין משימות פעילות כרגע</p>
            <p className="text-sm mt-2">השלימו שיעור כדי לקבל משימות חדשות</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
