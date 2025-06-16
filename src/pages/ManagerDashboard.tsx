import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ArrowLeft, Lock, LockOpen, X } from 'lucide-react';
import { ChartContainer } from '@/components/ui/chart';
import * as RechartsPrimitive from 'recharts';

interface ManagerDashboardProps {
  userData: any;
  onBack: () => void;
}

const ManagerDashboard = ({ userData, onBack }: ManagerDashboardProps) => {
  const [activeView, setActiveView] = useState('content');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('');
  const [divisionLocks, setDivisionLocks] = useState<{ [id: string]: boolean }>({});
  const [moduleLocks, setModuleLocks] = useState<{ [key: string]: boolean }>({});

  const allModules = [
    { id: 'basics', title: 'יסודות' },
    { id: 'excel', title: 'אקסל' },
    { id: 'reports', title: 'דוחות' },
  ];

  const [divisionModulesState, setDivisionModulesState] = useState<{ [divisionId: string]: { id: string; title: string }[] }>(() => ({
    development: [
      { id: 'basics', title: 'יסודות' },
      { id: 'excel', title: 'אקסל' },
      { id: 'reports', title: 'דוחות' },
    ],
    digital: [
      { id: 'basics', title: 'יסודות' },
      { id: 'reports', title: 'דוחות' },
    ],
    management: [
      { id: 'reports', title: 'דוחות' },
    ],
  }));
  const [addCourseDialog, setAddCourseDialog] = useState<{ open: boolean; divisionId: string | null }>({ open: false, divisionId: null });
  const [selectedAddModule, setSelectedAddModule] = useState<string>('');
  const [removeDialog, setRemoveDialog] = useState<{ open: boolean; divisionId: string | null; moduleId: string | null }>({ open: false, divisionId: null, moduleId: null });

  const divisions = [
    {
      id: 'development',
      title: 'פיתוח',
      progress: 67,
      trend: '+5%',
      rating: 4.2,
      trendData: [{x:0,y:2},{x:1,y:3},{x:2,y:1},{x:3,y:4},{x:4,y:3}]
    },
    {
      id: 'digital',
      title: 'דיגיטל',
      progress: 45,
      trend: '-2%',
      rating: 3.8,
      trendData: [{x:0,y:4},{x:1,y:2},{x:2,y:3},{x:3,y:2},{x:4,y:1}]
    },
    {
      id: 'management',
      title: 'מנהלים',
      progress: 80,
      trend: '+3%',
      rating: 4.5,
      trendData: [{x:0,y:1},{x:1,y:2},{x:2,y:2},{x:3,y:3},{x:4,y:4}]
    }
  ];

  const workers = [
    { id: '1', name: 'ירון קרלינסקי', division: 'development' },
    { id: '2', name: 'שיר אליגור', division: 'management' },
    { id: '3', name: 'אוריה מסס', division: 'development' },
    { id: '4', name: 'נועם לאון', division: 'digital' },
    { id: '5', name: 'שקד הראל', division: 'digital' },
  ];

  const toggleModuleLock = (divisionId: string, moduleId: string) => {
    setModuleLocks((prev) => ({ ...prev, [`${divisionId}_${moduleId}`]: !prev[`${divisionId}_${moduleId}`] }));
  };

  const openAddCourseDialog = (divisionId: string) => setAddCourseDialog({ open: true, divisionId });
  const closeAddCourseDialog = () => { setAddCourseDialog({ open: false, divisionId: null }); setSelectedAddModule(''); };
  const handleAddModule = () => {
    if (!addCourseDialog.divisionId || !selectedAddModule) return;
    const moduleToAdd = allModules.find(m => m.id === selectedAddModule);
    if (!moduleToAdd) return;
    setDivisionModulesState(prev => ({
      ...prev,
      [addCourseDialog.divisionId!]: [...prev[addCourseDialog.divisionId!], moduleToAdd]
    }));
    closeAddCourseDialog();
  };

  const openRemoveDialog = (divisionId: string, moduleId: string) => setRemoveDialog({ open: true, divisionId, moduleId });
  const closeRemoveDialog = () => setRemoveDialog({ open: false, divisionId: null, moduleId: null });
  const handleRemoveModule = () => {
    if (!removeDialog.divisionId || !removeDialog.moduleId) return;
    setDivisionModulesState(prev => ({
      ...prev,
      [removeDialog.divisionId!]: prev[removeDialog.divisionId!].filter(m => m.id !== removeDialog.moduleId)
    }));
    closeRemoveDialog();
  };

  const renderContentManagement = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">הקצאת תכנים למחלקות</h2>
      <div className="grid gap-4">
        {divisions.map((division) => {
          const listedModules = divisionModulesState[division.id] || [];
          const availableModules = allModules.filter(m => !listedModules.some(lm => lm.id === m.id));
          return (
            <Card key={division.id} className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold whitespace-nowrap">{division.title}</h3>
                  <div className="flex gap-4">
                    {listedModules.map((module) => {
                      const locked = moduleLocks[`${division.id}_${module.id}`];
                      return (
                        <span
                          key={module.id}
                          className={`relative flex flex-col items-center gap-0 px-4 py-2 rounded-lg text-sm cursor-pointer select-none min-w-[64px] transition-colors duration-200
                            ${locked ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}
                          `}
                          onClick={() => toggleModuleLock(division.id, module.id)}
                        >
                          <button
                            type="button"
                            className="absolute top-1 left-1 p-0.5 rounded hover:bg-blue-200 focus:outline-none"
                            style={{ zIndex: 2 }}
                            onClick={e => { e.stopPropagation(); openRemoveDialog(division.id, module.id); }}
                            tabIndex={0}
                            title="הסר קורס"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <span className="font-semibold mb-1">{module.title}</span>
                          <span className="flex items-center justify-center gap-3 text-xs">
                            {locked ? (
                              <>
                                <span>חובה</span>
                                <Lock className="w-4 h-4 ml-1" />
                              </>
                            ) : (
                              <>
                                <span>רשות</span>
                                <LockOpen className="w-4 h-4 ml-1" />
                              </>
                            )}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => openAddCourseDialog(division.id)}
                  disabled={availableModules.length === 0}
                  className={availableModules.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <Plus className="h-4 w-4 ml-1" />
                  הוסף קורס
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      <Dialog open={addCourseDialog.open} onOpenChange={v => { if (!v) closeAddCourseDialog(); }}>
        <DialogContent className="text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוסף קורס</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedAddModule} onValueChange={setSelectedAddModule}>
              <SelectTrigger>
                <SelectValue placeholder="בחר קורס" />
              </SelectTrigger>
              <SelectContent>
                {addCourseDialog.divisionId && allModules.filter(m => !(divisionModulesState[addCourseDialog.divisionId!]?.some(lm => lm.id === m.id))).map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={handleAddModule} disabled={!selectedAddModule}>הוסף</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={removeDialog.open} onOpenChange={v => { if (!v) closeRemoveDialog(); }}>
        <DialogContent className="text-center flex flex-col items-center w-72" dir="rtl">
          <DialogHeader className="w-full">
            <DialogTitle className="w-full text-center">האם להסיר את הקורס?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 w-full flex flex-col items-center">
            <Button className="w-40 mx-auto" variant="destructive" onClick={handleRemoveModule}>אישור</Button>
            <Button className="w-40 mx-auto" variant="outline" onClick={closeRemoveDialog}>ביטול</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderDivisionStatistics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">סטטיסטיקות מחלקות</h2>
      <div className="grid gap-4">
        {divisions.map((division) => (
          <Card key={division.id} className="p-4">
            <h3 className="text-lg font-semibold mb-4">{division.title}</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{division.progress}%</div>
                <div className="text-sm text-gray-600">התקדמות כללית</div>
              </div>
              <div>
                {/* Placeholder line chart for trend */}
                <ChartContainer config={{ trend: { color: division.trend.startsWith('+') ? '#16a34a' : '#dc2626' } }} className="w-24 h-8 mx-auto">
                  <RechartsPrimitive.LineChart data={division.trendData}>
                    <RechartsPrimitive.Line type="monotone" dataKey="y" stroke={division.trend.startsWith('+') ? '#16a34a' : '#dc2626'} strokeWidth={2} dot={false} />
                  </RechartsPrimitive.LineChart>
                </ChartContainer>
                <div className="text-sm text-gray-600">מגמה שבועית</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{division.rating}</div>
                <div className="text-sm text-gray-600">דירוג הבנה ממוצע</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderWorkerStatistics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">סטטיסטיקות עובדים</h2>
      {/* Filters */}
      <div className="flex gap-4">
        <Select onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="בחר מחלקה" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="development">פיתוח</SelectItem>
            <SelectItem value="management">מנהלים</SelectItem>
            <SelectItem value="digital">דיגיטל</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setSelectedWorker}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="בחר עובד" />
          </SelectTrigger>
          <SelectContent>
            {workers
              .filter(w => !selectedDepartment || w.division === selectedDepartment)
              .map(worker => (
                <SelectItem key={worker.id} value={worker.id}>
                  {worker.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      {/* Worker divisions */}
      {selectedWorker && (
        <div className="grid gap-4">
          {divisions.map((division) => (
            <Card key={division.id} className="p-4">
              <h3 className="text-lg font-semibold mb-4">{division.title}</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">75%</div>
                  <div className="text-sm text-gray-600">התקדמות</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">טוב</div>
                  <div className="text-sm text-gray-600">קצב</div>
                </div>
                <div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">משוב</Button>
                    </DialogTrigger>
                    <DialogContent className="text-right" dir="rtl">
                      <DialogHeader>
                        <DialogTitle>משוב עובד</DialogTitle>
                      </DialogHeader>
                      <div className="p-4">
                        <p>כאן יוצג משוב מפורט על העובד - placeholder</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">פאנל ניהול</h1>
        </div>
      </header>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-l p-4 h-fit rounded-tl-2xl rounded-bl-2xl flex flex-col justify-start items-stretch">
          <div className="space-y-2">
            <Button
              variant={activeView === 'content' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('content')}
            >
              ניהול תוכן
            </Button>
            <Button
              variant={activeView === 'modules' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('modules')}
            >
              סטטיסטיקות מחלקות
            </Button>
            <Button
              variant={activeView === 'workers' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('workers')}
            >
              סטטיסטיקות עובדים
            </Button>
          </div>
        </div>
        {/* Main content */}
        <div className="flex-1 p-6">
          {activeView === 'content' && renderContentManagement()}
          {activeView === 'modules' && renderDivisionStatistics()}
          {activeView === 'workers' && renderWorkerStatistics()}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
