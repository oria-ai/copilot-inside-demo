import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Trophy, ArrowLeft, FileText, MessageSquare, LogOut } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { progressStorage } from '@/lib/localStorage';

export interface UserData {
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
  onLogout: () => void;
}

const api = 'http://localhost:4000';

const StudentDashboard = ({ userData, onModuleClick, onLogout }: StudentDashboardProps) => {
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [totalLessons, setTotalLessons] = useState(6);
  const [lesson2Progress, setLesson2Progress] = useState<number | null>(null);

  // To control the space between the cards, change the value of 'centerSpaceWidth' below
  /** Adjust this number to control the space between the cards (in pixels) */
  const centerSpaceWidth = 90; // <--- CHANGE THIS NUMBER FOR SPACING

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'prompt' | 'feedback' | null>(null);

  // Feedback HTML (from user)
  const feedbackHtml = `<p class="mb-4">היי, הנה משוב על הפרומפט שלך:</p><ul class="list-disc list-inside mb-4 space-y-1"><li class="mb-1"><strong>תפקיד:</strong> חסר. הפרומפט לא מציין מי אמור לסכם את הפגישה.</li><li class="mb-1"><strong>מטרה:</strong> קיימת, אך כללית מאוד - "שאוכל לשלוח מייל לכולם".</li><li class="mb-1"><strong>הקשר:</strong> חסר לחלוטין. אין שום מידע על הפגישה עצמה (נושא, משתתפים, החלטות שהתקבלו וכו').</li><li class="mb-1"><strong>תוצר רצוי:</strong> חסר פירוט. "סיכום" זה כללי מדי. מה בדיוק צריך לכלול הסיכום? מה אורך הסיכום הרצוי?</li></ul><p class="mb-4">המלצות לשיפור:</p><ul class="list-disc list-inside mb-4 space-y-1"><li class="mb-1">הוסף תפקיד: לדוגמה, "בתור עוזר/ת אישי/ת...".</li><li class="mb-1">פרט את ההקשר: ציין את נושא הפגישה, תאריך, משתתפים מרכזיים, מטרת הפגישה.</li><li class="mb-1">הגדר את התוצר הרצוי בצורה מפורטת: לדוגמה, "סיכום תמציתי של עיקרי הדברים, החלטות שהתקבלו ופעולות המשך נדרשות, באורך של עד 200 מילים".</li><li class="mb-1">חדד את המטרה: פרט למה הסיכום ישמש, לדוגמה "כדי ליידע את כל המשתתפים על ההחלטות שהתקבלו ולתאם את המשך הפעילות".</li></ul>`;

  useEffect(() => {
    const fetchProgress = () => {
      // Get progress from localStorage instead of API
      const data = progressStorage.getProgress(userData.id || userData.email);
      const total = data.reduce((sum, p) => sum + (p.percent || 0), 0);
      setCompletedLessons(data.filter(p => p.percent === 100).length);
      setOverallProgress(Math.round((total / (totalLessons * 100)) * 100));
      // Find lesson2 progress
      const lesson2 = data.find((p) => p.lessonId === 'lesson2');
      setLesson2Progress(lesson2 ? lesson2.percent : 0);
    };
    fetchProgress();
  }, [userData, totalLessons]);

  const modules = [
    {
      id: 'basics',
      title: 'יסודות השימוש בקופיילוט',
      progress: overallProgress,
      lessons: 2,
      completedLessons: completedLessons
    },
    {
      id: 'excel',
      title: 'קופיילוט באקסל',
      progress: 0,
      lessons: 2,
      completedLessons: 0
    },
    {
      id: 'word',
      title: 'קופיילוט בוורד',
      progress: 0,
      lessons: 2,
      completedLessons: 0
    }
  ];

  const assignments = [
    {
      id: 'task2',
      title: 'משימה 2 - שיפור פרומפט',
      prompt: 'כתוב לי בבקשה סיכום של הפגישה שהייתה שאוכל לשלוח',
      feedback: feedbackHtml,
      status: 'completed',
      grade: 95
    }
  ];

  // Helper to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

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
              <div className="font-semibold">{userData.name}</div>
              <div className="text-sm opacity-90">{userData.department}</div>
            </div>
            <button
              className="p-2 rounded-full hover:bg-white/30 transition-colors"
              title="התנתק"
              onClick={onLogout}
              type="button"
            >
              <LogOut className="w-5 h-5" />
            </button>
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
              <p className="text-medium-gray">התחילו את המסע שלכם בעולם ה-AI</p>
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
              <h2 className="text-2xl font-bold text-dark-gray mb-2">ההגשות שלי</h2>
              <p className="text-medium-gray">משימות שהוגשו וקיבלו משוב</p>
            </div>
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Conditional rendering for lesson2 progress */}
              {lesson2Progress === 0 && (
                <div className="bg-white rounded-3xl shadow-card border-0 p-8 text-center text-xl text-medium-gray font-semibold">
                  עדיין לא הוגשו משימות
                </div>
              )}
              {lesson2Progress === 100 && assignments.map((assignment) => (
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
                    <div className="bg-light-gray rounded-2xl p-4 cursor-pointer" onClick={() => { setModalType('prompt'); setModalOpen(true); }}>
                      <h4 className="font-semibold text-dark-gray mb-2">הפרומפט שלי:</h4>
                      <p className="text-sm text-medium-gray leading-relaxed">
                        {truncateText(assignment.prompt, 40)}
                        {assignment.prompt.length > 40 && <span className="text-blue-500"> קרא עוד</span>}
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border-2 border-green/20 cursor-pointer" onClick={() => { setModalType('feedback'); setModalOpen(true); }}>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-green" />
                        <h4 className="font-semibold text-dark-gray">משוב :</h4>
                      </div>
                      <div className="text-sm text-medium-gray leading-relaxed">
                        {/* Render only a preview of the feedback (strip HTML tags for preview) */}
                        {truncateText(assignment.feedback.replace(/<[^>]+>/g, ''), 40)}
                        {assignment.feedback.replace(/<[^>]+>/g, '').length > 40 && <span className="text-blue-500"> קרא עוד</span>}
                      </div>
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

      {/* Modal for full prompt/feedback */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30 z-40" />
          <div className="relative bg-white rounded-3xl shadow-xl max-w-lg w-full mx-auto p-8 z-50" dir="rtl">
            <button onClick={() => setModalOpen(false)} className="absolute left-4 top-4 text-gray-400 hover:text-gray-600 text-2xl">×</button>
            <h2 className="text-2xl font-bold mb-4 text-dark-gray">
              {modalType === 'prompt' ? 'הפרומפט שלי' : 'משוב AI על המשימה'}
            </h2>
            <div className="prose prose-sm max-w-none text-gray-700" style={{ direction: 'rtl' }}>
              {modalType === 'prompt' ? (
                <div>{assignments[0].prompt}</div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: assignments[0].feedback }} />
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
