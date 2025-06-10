
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, CheckCircle } from 'lucide-react';

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
      description: 'לימוד יסודות המערכת והכרת הטכנולוגיה',
      lessons: totalLessons,
      completedLessons: completedLessons,
      thumbnail: '🤖'
    }
  ];

  const openTasks = [
    {
      id: 1,
      title: 'השלם שיעור ראשון',
      description: 'צפה בסרטון והשלם את המדריך האינטראקטיבי',
      status: completedLessons >= 1 ? 'completed' : 'pending',
      icon: BookOpen
    },
    {
      id: 2,
      title: 'תרגל כתיבת פרומפטים',
      description: 'השלם את משימת הכתיבה בשיעור השני',
      status: completedLessons >= 2 ? 'completed' : 'pending',
      icon: Clock
    },
    {
      id: 3,
      title: 'סיים את הקורס',
      description: 'השלם את כל השיעורים והמשימות',
      status: completedLessons >= 3 ? 'completed' : 'pending',
      icon: CheckCircle
    }
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="container-main">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🤖</div>
              <h1 className="text-xl font-bold text-foreground">Hands-On-AI</h1>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">דף הבית</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">הקורסים שלי</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">משימות פתוחות</a>
              <Button variant="ghost" className="text-muted-foreground hover:text-primary">התנתק</Button>
            </nav>
            <div className="text-secondary">
              שלום, {userData.email} | {userData.department}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section bg-card">
        <div className="container-main text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            קורס אינטראקטיבי של Copilot<br />
            שמעניק לך ניסיון מעשי עם AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            למד להשתמש בכלי AI המתקדמים ביותר דרך תרגול מעשי ומשימות אמיתיות
          </p>
        </div>
      </section>

      {/* My Courses Section */}
      <section className="section-alt">
        <div className="container-main">
          <h2 className="text-3xl font-bold text-foreground mb-8">הקורסים שלי</h2>
          <div className="grid-cards">
            {modules.map((module) => (
              <Card 
                key={module.id} 
                className="card-elevated hover:shadow-lg transition-all duration-200 cursor-pointer group" 
                onClick={() => onModuleClick(module.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-4xl">{module.thumbnail}</div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {module.title}
                      </CardTitle>
                      <p className="text-secondary mt-1">{module.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-foreground">{module.progress}% הושלם</span>
                    <span className="text-muted-foreground">{module.completedLessons}/{module.lessons} שיעורים</span>
                  </div>
                  <Progress value={module.progress} className="h-3" />
                  <Button className="btn-primary w-full">
                    {module.progress > 0 ? 'המשך לימוד' : 'התחל לימוד'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Open Tasks Section */}
      <section className="section">
        <div className="container-main">
          <h2 className="text-3xl font-bold text-foreground mb-8">משימות פתוחות</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {openTasks.map((task) => (
              <Card key={task.id} className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      task.status === 'completed' 
                        ? 'bg-accent/10 text-accent' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      <task.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{task.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed'
                            ? 'bg-accent/10 text-accent'
                            : 'bg-orange-100 text-orange-600'
                        }`}>
                          {task.status === 'completed' ? 'הושלם' : 'ממתין'}
                        </span>
                      </div>
                      <p className="text-secondary">{task.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="container-main py-8">
          <div className="text-center">
            <p className="text-secondary">
              © 2024 Hands-On-AI. פלטפורמת למידה אינטראקטיבית לטכנולוגיות AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudentDashboard;
