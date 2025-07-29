import React, { useState, useEffect } from 'react';
import Login from './Login';
import StudentDashboard from './StudentDashboard';
import ManagerDashboard from './ManagerDashboard';
import ModuleView from './ModuleView';
import type { UserData } from './StudentDashboard';
import { userStorage } from "@/lib/localStorage";

const Index = () => {
  const [currentView, setCurrentView] = useState<'login' | 'student' | 'manager' | 'module'>('login');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentModule, setCurrentModule] = useState<string>('');

  // Check for saved user data on app startup
  useEffect(() => {
    const savedUser = userStorage.getCurrentUser();
    if (savedUser) {
      setUserData(savedUser);
      setCurrentView(savedUser.role === 'manager' ? 'manager' : 'student');
    }
  }, []);

  const handleLogin = (data: UserData) => {
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
    // Clear user data from localStorage
    userStorage.clearCurrentUser();
    setUserData(null);
    setCurrentView('login');
  };

  if (currentView === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  if (currentView === 'student') {
    return <StudentDashboard userData={userData} onModuleClick={handleModuleClick} onLogout={handleLogout} />;
  }

  if (currentView === 'manager') {
    return <ManagerDashboard userData={{
      id: userData?.id || userData?.email || 'unknown',
      name: userData?.name || 'Unknown',
      role: userData?.role || 'manager'
    }} onBack={handleLogout} />;
  }

  if (currentView === 'module') {
    return <ModuleView moduleId={currentModule} userId={userData?.id || userData?.email} copilotLanguage={userData?.copilotLanguage || 'hebrew'} onBack={handleBackToDashboard} />;
  }

  return null;
};

export default Index;
