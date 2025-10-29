import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import Navbar from './components/Navbar';
import Home from './components/Home';
import DoctorSearch from './components/DoctorSearch';
import MedicineSearch from './components/MedicineSearch';
import LabSearch from './components/LabSearch';
import BlogFeed from './components/BlogFeed';
import Profile from './components/Profile';
import Tools from './components/Tools';
import MyAppointments from './components/MyAppointments';
import MyRecords from './components/MyRecords';

function App() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  
  if (!isAuthenticated) { 
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <Home navigate={setCurrentView} />;
      case 'doctors':
        return <DoctorSearch />;
      case 'my-appointments':
        return <MyAppointments />;
      case 'my-records':
        return <MyRecords />;
      case 'medicines':
        return <MedicineSearch />;
      case 'labs':
        return <LabSearch />;
      case 'blogs':
        return <BlogFeed />;
      case 'profile':
        return <Profile />;
      case 'tools':
        return <Tools />;
      default:
        return <Home navigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans transition-colors duration-200">
      <Navbar navigate={setCurrentView} currentView={currentView} />
      {/* NEW UI STRUCTURE:
        - The main content container is now the hero/body wrapper.
        - The top padding (pt-8) creates separation from the fixed navbar.
      */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 pt-8"> 
        {renderContent()}
      </main>
    </div>
  );
}
export default App;
