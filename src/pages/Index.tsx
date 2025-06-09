
import React, { useState } from 'react';
import Login from './Login';
import StudentDashboard from './StudentDashboard';
import ManagerDashboard from './ManagerDashboard';
import ModuleView from './ModuleView';

const Index = () => {
  const [currentView, setCurrentView] = useState<'login' | 'student' | 'manager' | 'module'>('login');
  const [userData, setUserData] = useState<any>(null);
  const [currentModule, setCurrentModule] = useState<string>('');

  const handleLogin = (data: any) => {
    setUserData(data);
    setCurrentView(data.role === 'manager' ? 'manager' : 'student');
  };

  const handleModuleClick = (moduleId: string) => {
    setCurrentModule(moduleId);
    setCurrentView('module');
  };

  const handleBackToDashboard = () => {
    setCurrentView(userData?.role === 'manager' ? 'manager' : 'student');
  };

  const handleLogout = () => {
    setUserData(null);
    setCurrentView('login');
  };

  if (currentView === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  if (currentView === 'student') {
    return <StudentDashboard userData={userData} onModuleClick={handleModuleClick} />;
  }

  if (currentView === 'manager') {
    return <ManagerDashboard userData={userData} onBack={handleLogout} />;
  }

  if (currentView === 'module') {
    return <ModuleView moduleId={currentModule} onBack={handleBackToDashboard} />;
  }

  return null;
};

export default Index;
