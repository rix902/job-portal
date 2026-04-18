import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import JobSeekerDashboard from '../components/JobSeekerDashboard';
import RecruiterDashboard from '../components/RecruiterDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-500">
          Welcome back, {user.name}! ({user.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'})
        </p>
      </div>

      {user.role === 'jobseeker' ? (
        <JobSeekerDashboard />
      ) : (
        <RecruiterDashboard />
      )}
    </div>
  );
};

export default Dashboard;
