import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Trophy, ArrowLeft, FileText, MessageSquare } from 'lucide-react';

interface UserData {
  id?: string;
  email: string;
  department: string;
  copilotLanguage: string;
  studyingLanguage: string;
  role: string;
  name: string;
  password?: string;
}

interface StudentDashboardProps {
  userData: UserData;
  onModuleClick: (moduleId: string) => void;
}

const api = 'http://localhost:4000';

const StudentDashboard = ({ userData, onModuleClick }: StudentDashboardProps) => {
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [totalLessons, setTotalLessons] = useState(3);

  // To control the space between the cards, change the value of 'centerSpaceWidth' below
  /** Adjust this number to control the space between the cards (in pixels) */
  const centerSpaceWidth = 90; // <--- CHANGE THIS NUMBER FOR SPACING

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
      description: 'יסודות השימוש בקופיילוט',
      lessons: totalLessons,
      completedLessons: completedLessons
    }
  ];

  const assignments = [
    {
      id: 'task2',
      title: 'משימה 2: יצירת פונקציה עם AI',
      prompt: 'צרו פונקציה שמחשבת את הממוצע של רשימת מספרים, תוך שימוש ב-Copilot',
      feedback: 'הפתרון שלכם מצוין! הקוד נקי ויעיל. שימו לב לטיפול במקרי קיצון כמו רשימה ריקה.',
      status: 'completed',
      grade: 95
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
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl px-6 py-4 text-white">
            <div className="text-sm opacity-90">שלום,</div>
            <div className="font-semibold">{userData.email}</div>
            <div className="text-sm opacity-90">{userData.department}</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top Section - My Assignments and My Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 lg:flex lg:flex-row lg:gap-0">
          {/* My Courses - Right Side (now on the left) */}
          <div className="flex-1 flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-dark-gray mb-2">הקורסים שלי</h2>
              <p className="text-medium-gray">התחילו את המסע שלכם לעולם ה-AI</p>
            </div>
            <div className="space-y-6 flex-1 flex flex-col">
              {modules.map((module) => (
                <Card 
                  key={module.id} 
                  className="bg-gradient-card shadow-card hover:shadow-xl transition-all duration-300 cursor-pointer rounded-3xl border-0 overflow-hidden group flex flex-col h-full"
                  onClick={() => onModuleClick(module.id)}
                >
                  <div className="h-32 bg-gradient-turquoise relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-0"></div>
                    <div className="relative z-10 p-6 pb-0">
                      <h3 className="text-xl font-bold text-white drop-shadow mb-2">{module.title}</h3>
                    </div>
                    <div className="absolute bottom-4 right-4 z-10">
                      <div className="bg-white/20 rounded-2xl px-4 py-2">
                        <span className="text-white font-semibold">{module.progress}%</span>
                      </div>
                    </div>
                  </div>
                  <CardHeader className="pb-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-medium-gray" dir="rtl">
                        <span>{module.completedLessons}/{module.lessons} שיעורים</span>
                        <span>{module.progress}% הושלם</span>
                      </div>
                      <Progress value={module.progress} className="h-3 rounded-full" dir="rtl" />
                    </div>
                    <p className="text-medium-gray mt-2">{module.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0 mt-auto">
                    <Button className="w-full bg-gradient-turquoise hover:opacity-90 text-white rounded-3xl h-12 font-semibold shadow-soft transition-all duration-300 group-hover:scale-105">
                      המשך לימוד
                      <ArrowLeft className="mr-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          {/* Center space for large screens (no divider) */}
          <div className="hidden lg:block" style={{ minWidth: centerSpaceWidth }} />
          {/* My Assignments - Left Side (now on the right) */}
          <div className="flex-1 flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-dark-gray mb-2">המשימות שלי</h2>
              <p className="text-medium-gray">משימות שהוגשו וקיבלו משובים</p>
            </div>
            <div className="space-y-4 flex-1 flex flex-col">
              {assignments.map((assignment) => (
                <Card 
                  key={assignment.id} 
                  className="bg-gradient-card shadow-card rounded-3xl border-0 overflow-hidden flex flex-col h-full"
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-turquoise w-12 h-12 rounded-2xl flex items-center justify-center">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-dark-gray">{assignment.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">

                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4 mt-auto">
                    <div className="bg-light-gray rounded-2xl p-4">
                      <h4 className="font-semibold text-dark-gray mb-2">הוראות המשימה:</h4>
                      <p className="text-sm text-medium-gray leading-relaxed">{assignment.prompt}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border-2 border-green/20">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-green" />
                        <h4 className="font-semibold text-dark-gray">משוב AI:</h4>
                      </div>
                      <p className="text-sm text-medium-gray leading-relaxed">{assignment.feedback}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards - Moved to Bottom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-card shadow-card rounded-3xl border-0">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-turquoise w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark-gray mb-1">{totalLessons}</h3>
              <p className="text-medium-gray">שיעורים זמינים</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card rounded-3xl border-0">
            <CardContent className="p-6 text-center">
              <div className="bg-green w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark-gray mb-1">{completedLessons}</h3>
              <p className="text-medium-gray">שיעורים הושלמו</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card rounded-3xl border-0">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-turquoise w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark-gray mb-1">{overallProgress}%</h3>
              <p className="text-medium-gray">התקדמות כללית</p>
            </CardContent>
          </Card>
        </div>

        {/* Open Tasks Section - Removed since assignments moved to top */}
      </div>
    </div>
  );
};

export default StudentDashboard;
