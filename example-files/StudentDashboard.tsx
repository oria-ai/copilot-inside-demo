import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Trophy, ArrowLeft, FileText, MessageSquare, LogOut } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { authHelpers, contentAPI } from '@/lib/api';

interface Step {
  id: number;
  title: string;
  type: string;
  order: number;
}

interface Module {
  id: number;
  title: string;
  description?: string;
  iconPath?: string;
  progress: number; // This comes from user_module_enrollment.progressPerc
  steps: Step[];
}

interface UserProgress {
  stepId: number;
  status: string;
  progressPercent: number;
  lastScreen: number;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = authHelpers.getAuthData();
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'prompt' | 'feedback' | null>(null);

  useEffect(() => {
    if (!authHelpers.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [modulesData, progressData] = await Promise.all([
          contentAPI.getModules(),
          contentAPI.getProgress()
        ]);
        
        setModules(modulesData);
        setProgress(progressData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        setError(error.response?.data?.message || error.message || 'שגיאה בטעינת הנתונים');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    authHelpers.clearAuthData();
    navigate('/login');
  };

  const handleModuleClick = (moduleId: number) => {
    // Find the first step of the module
    const module = modules.find(m => m.id === moduleId);
    if (module && module.steps && module.steps.length > 0) {
      const firstStep = module.steps.sort((a, b) => a.order - b.order)[0];
      navigate(`/modules/${moduleId}/step/${firstStep.id}`);
    } else {
      // Handle case where module has no steps, maybe navigate to a module overview
      console.log(`Module ${moduleId} has no steps to navigate to.`);
    }
  };

  const getCompletedSteps = (module: Module) => {
    const moduleStepIds = module.steps.map(step => step.id);
    const moduleProgress = progress.filter(p => moduleStepIds.includes(p.stepId));
    return moduleProgress.filter(p => p.status === 'COMPLETED').length;
  };

  const getOverallProgress = () => {
    if (!modules.length) return 0;
    
    const totalProgress = modules.reduce((sum, module) => {
      return sum + module.progress; // Use progress from user_module_enrollment
    }, 0);
    
    return Math.round(totalProgress / modules.length);
  };

  const getTotalSteps = () => {
    return modules.reduce((sum, module) => sum + module.steps.length, 0);
  };

  const getTotalCompletedSteps = () => {
    return modules.reduce((sum, module) => sum + getCompletedSteps(module), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">טוען נתונים...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-light flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-red-800 font-medium mb-2">שגיאה בטעינת הנתונים</h3>
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            נסה שוב
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light" dir="rtl">
      {/* Header with gradient */}
      <header className="bg-gradient-turquoise shadow-soft border-b-0 px-6 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">ברוכים הבאים לקורס Copilot Inside</h1>
            <p className="text-white/90">קורס מבוסס AI על מייקרוסופט קופיילוט, שיעזור לכם להספיק 20% יותר בעבודה</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl px-6 py-4 text-white flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="text-sm opacity-90">שלום,</div>
              <div className="font-semibold">{user?.name || 'משתמש'}</div>
              {/* <div className="text-sm opacity-90">{user?.department || ''}</div> */}
            </div>
            <button
              className="p-2 rounded-full hover:bg-white/30 transition-colors"
              title="התנתק"
              onClick={handleLogout}
              type="button"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Modules Section */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-dark-gray mb-2">הקורסים שלי</h2>
            <p className="text-medium-gray">התחילו את המסע שלכם בעולם ה-AI</p>
          </div>
          
          {modules.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-card border-0 p-8 text-center">
              <p className="text-xl text-medium-gray font-semibold">אין מודולים זמינים כרגע</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => {
                const moduleProgress = module.progress; // Use progress from user_module_enrollment
                const completedSteps = getCompletedSteps(module);
                
                return (
                  <Card 
                    key={module.id} 
                    className="bg-gradient-card shadow-card hover:shadow-xl transition-all duration-300 cursor-pointer rounded-3xl border-0 overflow-hidden group flex flex-col h-full"
                    onClick={() => handleModuleClick(module.id)}
                  >
                    <div className="h-32 bg-gradient-turquoise relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-0"></div>
                      <div className="relative z-10 p-6 pb-0">
                        <h3 className="text-xl font-bold text-white drop-shadow mb-2">{module.title}</h3>
                        {module.description && (
                          <p className="text-white/80 text-sm">{module.description}</p>
                        )}
                      </div>
                      <div className="absolute bottom-4 left-4 z-10">
                        <div className="bg-white/20 rounded-2xl px-4 py-2">
                          <span className="text-white font-semibold">{moduleProgress}%</span>
                        </div>
                      </div>
                    </div>
                    <CardHeader className="pb-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm text-medium-gray" dir="rtl">
                          <span>{completedSteps}/{module.steps.length} שלבים</span>
                          <span>{moduleProgress}% הושלם</span>
                        </div>
                        <Progress value={moduleProgress} className="h-3 rounded-full" dir="rtl" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 mt-auto">
                      <Button
                        className="w-full bg-gradient-turquoise hover:opacity-90 text-white rounded-3xl h-12 font-semibold shadow-soft transition-all duration-300 group-hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModuleClick(module.id);
                        }}
                      >
                        המשך לימוד
                        <ArrowLeft className="mr-2 h-4 w-4" />
                      </Button>
                     </CardContent>
                   </Card>
                 );
               })}
             </div>
           )}
         </div>

        <div className="mb-12 text-center">
            <Button
                size="lg"
                className="rounded-full h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg"
                onClick={() => navigate('/chat')}
            >
                <MessageSquare className="ml-3 h-6 w-6" />
                יש לכם שאלה? שוחחו עם המורה הפרטי שלכם
            </Button>
        </div>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-card shadow-card rounded-3xl border-0">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-turquoise w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark-gray mb-1">{getTotalSteps()}</h3>
              <p className="text-medium-gray">שלבים זמינים</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card rounded-3xl border-0">
            <CardContent className="p-6 text-center">
              <div className="bg-green w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark-gray mb-1">{getTotalCompletedSteps()}</h3>
              <p className="text-medium-gray">שלבים הושלמו</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card rounded-3xl border-0">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-turquoise w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark-gray mb-1">{getOverallProgress()}%</h3>
              <p className="text-medium-gray">התקדמות כללית</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
