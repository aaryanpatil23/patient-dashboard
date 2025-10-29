import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
// Import all the icons we'll need for the new cards
import { 
  CalendarIcon, 
  PillIcon, 
  TestTubeIcon, 
  DocumentIcon, 
  HeartIcon, 
  SearchIcon,
  MyAppointmentsIcon, 
  MyRecordsIcon,
  UserGroupIcon 
} from './Icons'; 

// Sub-component: Quick Search Bar
const QuickSearchBar = ({ navigate }) => {
  const [searchTerm, setSearchTerm] = useState(''); // State for the input

  const handleSearch = () => {
    // Basic logic to route based on keywords
    const query = searchTerm.toLowerCase();
    let targetView = 'doctors'; // Default to Doctor Search (most common action)
    
    // FIX: Refined the keyword logic to be more useful
    if (query.includes('med') || query.includes('pharmacy')) {
      targetView = 'medicines';
    } else if (query.includes('test') || query.includes('lab')) {
      targetView = 'labs';
    } else if (query.includes('blog') || query.includes('feed')) {
      targetView = 'blogs';
    } else if (query.includes('bmi') || query.includes('tool') || query.includes('health')) {
      targetView = 'tools';
    } else if (query.includes('appoint') || query.includes('doc') || query.includes('dr')) {
      targetView = 'doctors'; // Explicitly redirect to doctor search
    }
    
    // Navigate to the determined page
    navigate(targetView);
    
    // Clear the input after search
    setSearchTerm('');
  };

  return (
    <div className="relative flex items-center w-full max-w-2xl mx-auto md:mt-6">
      <input 
        type="text" 
        placeholder="Search for Doctors, Medicines, or Services"
        className="w-full p-4 pl-12 rounded-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-xl focus:ring-2 focus:ring-indigo-500 transition-shadow"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        // Triggers search when Enter is pressed
        onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
      />
      <SearchIcon className="absolute left-4 w-6 h-6 text-indigo-500" />
      
      {/* Add an explicit search button for clarity */}
      <button 
        onClick={handleSearch} 
        className="absolute right-0 h-full px-6 bg-indigo-600 text-white font-medium rounded-r-full hover:bg-indigo-700 transition-colors"
        title="Search"
      >
        <SearchIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

// Sub-component: Main Feature Card
const FeatureCard = ({ title, description, icon, onClick, colSpan = 1 }) => (
  <button
    onClick={onClick}
    // Applying the general card style (card-glassmorphism)
    className={`p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all text-left card-glassmorphism lg:col-span-${colSpan} h-full border border-opacity-30`}
  >
    <div className="flex flex-col h-full justify-between">
      <div className="mb-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white/20 dark:bg-black/20 rounded-full mb-3 text-indigo-600 dark:text-indigo-300">
          {React.cloneElement(icon, { className: "w-6 h-6" })}
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{title}</h2>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 opacity-90">{description}</p>
    </div>
  </button>
);


function Home({ navigate }) {
  const { user } = useAuth();

  return (
    <div className="space-y-10">
      
      {/* 1. WELCOME HEADER & QUICK SEARCH */}
      <div className="text-center pt-4 pb-8">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white">
          Welcome, {user.fullName.split(' ')[0]}!
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mt-2">
          Find the right care, right now.
        </p>
        <QuickSearchBar navigate={navigate} />
      </div>

      {/* 2. FEATURE GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        
        {/* Primary Booking Feature (2-span card) */}
        <FeatureCard
          title="Book Appointment"
          description="Find specialized doctors near you and book your slot instantly."
          icon={<CalendarIcon />}
          onClick={() => navigate('doctors')}
          colSpan={2}
        />
        
        {/* Secondary Services */}
        <FeatureCard
          title="Order Medicines"
          description="View nearby pharmacy stocks and place an inquiry."
          icon={<PillIcon />}
          onClick={() => navigate('medicines')}
          colSpan={1}
        />
        <FeatureCard
          title="Schedule Tests"
          description="Find nearby labs and schedule home collection or clinic visit."
          icon={<TestTubeIcon />}
          onClick={() => navigate('labs')}
          colSpan={1}
        />

        {/* Tertiary Features / Quick Links */}
        <FeatureCard
          title="My Appointments"
          description="View upcoming bookings and manage cancellations."
          icon={<MyAppointmentsIcon />}
          onClick={() => navigate('my-appointments')}
          colSpan={1}
        />
        <FeatureCard
          title="My Records"
          description="Access your past prescriptions, advice, and history."
          icon={<MyRecordsIcon />}
          onClick={() => navigate('my-records')}
          colSpan={1}
        />
        <FeatureCard
          title="Health Feed"
          description="Read daily articles and expert health content."
          icon={<DocumentIcon />}
          onClick={() => navigate('blogs')}
          colSpan={1}
        />
        <FeatureCard
          title="Health Tools"
          description="Calculate BMI and track basic fitness stats."
          icon={<HeartIcon />}
          onClick={() => navigate('tools')}
          colSpan={1}
        />
        <FeatureCard
          title="My Profile"
          description="Update personal details and contact information."
          icon={<UserGroupIcon />}
          onClick={() => navigate('profile')}
          colSpan={1}
        />

      </div>
    </div>
  );
}

export default Home;
