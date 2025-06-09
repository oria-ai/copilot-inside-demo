
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ArrowLeft } from 'lucide-react';

interface ManagerDashboardProps {
  userData: any;
  onBack: () => void;
}

const ManagerDashboard = ({ userData, onBack }: ManagerDashboardProps) => {
  const [activeView, setActiveView] = useState('content');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('');

  const modules = [
    {
      id: 'basics',
      title: 'יסודות',
      departments: ['development', 'management'],
      progress: 67,
      trend: '+5%',
      rating: 4.2
    },
    {
      id: 'excel',
      title: 'אקסל',
      departments: ['development'],
      progress: 45,
      trend: '-2%',
      rating: 3.8
    }
  ];

  const workers = [
    { id: '1', name: 'יוסי כהן', department: 'development' },
    { id: '2', name: 'שרה לוי', department: 'management' },
    { id: '3', name: 'דוד ישראלי', department: 'development' }
  ];

  const renderContentManagement = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">ניהול תוכן</h2>
      <div className="grid gap-4">
        {modules.map((module) => (
          <Card key={module.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{module.title}</h3>
                <div className="flex gap-2 mt-2">
                  {module.departments.map((dept) => (
                    <span key={dept} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {dept === 'development' ? 'פיתוח' : dept === 'management' ? 'ניהול' : 'כספים'}
                    </span>
                  ))}
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 ml-1" />
                    הוסף מחלקה
                  </Button>
                </DialogTrigger>
                <DialogContent className="text-right" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>הוסף מחלקה למודול</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר מחלקה" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">פיתוח</SelectItem>
                        <SelectItem value="management">ניהול</SelectItem>
                        <SelectItem value="finance">כספים</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="w-full">הוסף</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderModuleStatistics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">סטטיסטיקות מודולים</h2>
      <div className="grid gap-4">
        {modules.map((module) => (
          <Card key={module.id} className="p-4">
            <h3 className="text-lg font-semibold mb-4">{module.title}</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{module.progress}%</div>
                <div className="text-sm text-gray-600">התקדמות כללית</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${module.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {module.trend}
                </div>
                <div className="text-sm text-gray-600">מגמה שבועית</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{module.rating}</div>
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
            <SelectItem value="management">ניהול</SelectItem>
            <SelectItem value="finance">כספים</SelectItem>
          </SelectContent>
        </Select>
        
        <Select onValueChange={setSelectedWorker}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="בחר עובד" />
          </SelectTrigger>
          <SelectContent>
            {workers
              .filter(w => !selectedDepartment || w.department === selectedDepartment)
              .map(worker => (
                <SelectItem key={worker.id} value={worker.id}>
                  {worker.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Worker modules */}
      {selectedWorker && (
        <div className="grid gap-4">
          {modules.map((module) => (
            <Card key={module.id} className="p-4">
              <h3 className="text-lg font-semibold mb-4">{module.title}</h3>
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
        <div className="w-64 bg-white border-l p-4">
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
              סטטיסטיקות מודולים
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
          {activeView === 'modules' && renderModuleStatistics()}
          {activeView === 'workers' && renderWorkerStatistics()}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
