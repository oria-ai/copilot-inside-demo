import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHelpers } from '@/lib/api';
import StudentDashboard from '@/pages/StudentDashboard';
import ManagerDashboard from '@/pages/ManagerDashboard';

const RoleDashboard = () => {
  const navigate = useNavigate();
  const { user } = authHelpers.getAuthData();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect based on user role
    switch (user.role) {
      case 'MANAGER':
        navigate('/manager');
        break;
      case 'AUTHOR':
        navigate('/authoring');
        break;
      case 'LEARNER':
      default:
        // Stay on dashboard for learners
        break;
    }
  }, [user?.role, navigate]); // Only depend on role, not entire user object

  // If user is a learner, show the student dashboard
  if (user?.role === 'LEARNER') {
    return <StudentDashboard />;
  }

  // For other roles, show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-light flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">מפנה...</span>
    </div>
  );
};

export default RoleDashboard;
