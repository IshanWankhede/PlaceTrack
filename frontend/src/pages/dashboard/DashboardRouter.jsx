import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import AdminOverview from './AdminOverview.jsx';
import StudentOverview from './StudentOverview.jsx';

export default function DashboardRouter() {
  const { activeRole } = useAuth();

  if (activeRole === 'STUDENT') {
    return <StudentOverview />;
  }

  if (activeRole === 'STAFF') {
    return <AdminOverview roleVariant="STAFF" />;
  }

  return <AdminOverview roleVariant="ADMIN" />;
}
