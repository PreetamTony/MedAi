import React from 'react';
import { Calendar, Activity, Brain, Utensils, Bell, FileText, Heart, Ambulance, Dumbbell, Video, ChevronRight } from 'lucide-react';
import ReminderList from './features/ReminderList';
import MoodTracker from './features/MoodTracker';
import AppointmentManager from './features/AppointmentManager';
import FitnessTracker from './features/FitnessTracker';
import DietPlanner from './features/DietPlanner';
import HealthEducation from './features/HealthEducation';
import HealthCoaching from './features/HealthCoaching';
import EmergencyServices from './features/EmergencyServices';
import RehabExercises from './features/RehabExercises';
import DoctorConsultation from './features/DoctorConsultation';

const DashboardCard = ({ 
  title, 
  subtitle, 
  icon, 
  iconBg, 
  iconColor, 
  children, 
  className = '',
  expandable = false
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
  className?: string;
  expandable?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = React.useState(!expandable);

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md ${className}`}>
      <div 
        className={`flex items-center justify-between p-5 ${expandable ? 'cursor-pointer' : ''}`}
        onClick={() => expandable && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`${iconBg} p-3 rounded-xl`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>
        {expandable && (
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        )}
      </div>
      {isExpanded && (
        <div className="px-5 pb-5">
          <div className="border-t border-gray-100 pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default function HealthDashboard() {
  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 md:p-8">
        <div className="max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Your Health Dashboard</h2>
          <p className="text-blue-100">
            Monitor your health metrics, track appointments, and manage your wellness journey all in one place. 
            Get personalized insights and recommendations based on your health data.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Doctor Consultation', icon: <Video className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-100' },
          { title: 'Emergency Services', icon: <Ambulance className="w-5 h-5 text-red-600" />, bg: 'bg-red-100' },
          { title: 'Health Coaching', icon: <Heart className="w-5 h-5 text-green-600" />, bg: 'bg-green-100' },
          { title: 'Appointments', icon: <Calendar className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-100' }
        ].map((action, index) => (
          <button
            key={index}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all"
          >
            <div className={`${action.bg} p-2 rounded-lg`}>
              {action.icon}
            </div>
            <span className="font-medium text-gray-800">{action.title}</span>
          </button>
        ))}
      </div>

      {/* Primary Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Doctor Consultation"
          subtitle="Connect with healthcare professionals"
          icon={<Video className="w-6 h-6 text-purple-600" />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          className="lg:col-span-2"
          expandable
        >
          <DoctorConsultation />
        </DashboardCard>

        <DashboardCard
          title="Emergency"
          subtitle="Quick access to emergency services"
          icon={<Ambulance className="w-6 h-6 text-red-600" />}
          iconBg="bg-red-100"
          iconColor="text-red-600"
          expandable
        >
          <EmergencyServices />
        </DashboardCard>
      </div>

      {/* Health Monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Health Coaching"
          subtitle="Personalized wellness guidance"
          icon={<Heart className="w-6 h-6 text-green-600" />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          className="lg:col-span-2"
          expandable
        >
          <HealthCoaching />
        </DashboardCard>

        <DashboardCard
          title="Appointments"
          subtitle="Manage your medical visits"
          icon={<Calendar className="w-6 h-6 text-indigo-600" />}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
          expandable
        >
          <AppointmentManager />
        </DashboardCard>

        <DashboardCard
          title="Fitness"
          subtitle="Track your physical activity"
          icon={<Activity className="w-6 h-6 text-orange-600" />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          expandable
        >
          <FitnessTracker />
        </DashboardCard>

        <DashboardCard
          title="Diet"
          subtitle="Manage your nutrition"
          icon={<Utensils className="w-6 h-6 text-yellow-600" />}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
          expandable
        >
          <DietPlanner />
        </DashboardCard>

        <DashboardCard
          title="Mood"
          subtitle="Monitor your emotional wellbeing"
          icon={<Brain className="w-6 h-6 text-pink-600" />}
          iconBg="bg-pink-100"
          iconColor="text-pink-600"
          expandable
        >
          <MoodTracker />
        </DashboardCard>
      </div>

      {/* Additional Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Reminders"
          subtitle="Stay on top of your health"
          icon={<Bell className="w-6 h-6 text-blue-600" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          expandable
        >
          <ReminderList />
        </DashboardCard>

        <DashboardCard
          title="Education"
          subtitle="Learn about health topics"
          icon={<FileText className="w-6 h-6 text-teal-600" />}
          iconBg="bg-teal-100"
          iconColor="text-teal-600"
          expandable
        >
          <HealthEducation />
        </DashboardCard>

        <DashboardCard
          title="Rehabilitation"
          subtitle="Recovery exercises and tracking"
          icon={<Dumbbell className="w-6 h-6 text-cyan-600" />}
          iconBg="bg-cyan-100"
          iconColor="text-cyan-600"
          expandable
        >
          <RehabExercises />
        </DashboardCard>
      </div>
    </div>
  );
}