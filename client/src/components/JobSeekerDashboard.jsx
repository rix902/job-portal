import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Briefcase, Clock, CheckCircle, XCircle, Search, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const JobSeekerDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appRes, jobRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/applications/me`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`)
      ]);
      setApplications(appRes.data);
      setAvailableJobs(jobRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'applied': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'shortlisted': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  // Basic "analysis" logic for matching jobs
  const matchedJobs = availableJobs.filter(job => {
    if (!user?.profile?.skills || user.profile.skills.length === 0) return true;
    const jobContent = (job.title + ' ' + job.description).toLowerCase();
    return user.profile.skills.some(skill => jobContent.includes(skill.toLowerCase()));
  }).slice(0, 3);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Briefcase className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Applications</p>
            <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Shortlisted</p>
            <p className="text-2xl font-bold text-gray-900">
              {applications.filter(a => a.status === 'shortlisted').length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Star className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Matched Jobs</p>
            <p className="text-2xl font-bold text-gray-900">{matchedJobs.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Applications */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Clock className="w-6 h-6 mr-2 text-blue-600" />
                Recent Applications
              </h2>
            </div>

            {applications.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">You haven't applied to any jobs yet.</p>
                <Link to="/jobs" className="mt-4 inline-block text-blue-600 font-medium hover:underline">
                  Browse available jobs
                </Link>
              </div>
            ) : (
              <div className="bg-white shadow-sm overflow-hidden rounded-xl border border-gray-100">
                <ul className="divide-y divide-gray-100">
                  {applications.map((app) => (
                    <li key={app._id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center font-bold text-blue-600">
                            {app.jobId?.company?.name?.[0] || 'J'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{app.jobId?.title || 'Job Unavailable'}</h3>
                            <p className="text-sm text-gray-500">{app.jobId?.company?.name || 'Company Unknown'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                            app.status === 'shortlisted' ? 'bg-green-100 text-green-700' : 
                            app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {getStatusIcon(app.status)}
                            <span className="capitalize">{app.status}</span>
                          </div>
                          <p className="text-xs text-gray-400 hidden sm:block">
                            {new Date(app.appliedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Search className="w-6 h-6 mr-2 text-blue-600" />
                New Opportunities
              </h2>
              <Link to="/jobs" className="text-blue-600 text-sm font-medium hover:underline flex items-center">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {availableJobs.slice(0, 4).map((job) => (
                <Link key={job._id} to="/jobs" className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-blue-300 transition-all group">
                  <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{job.company?.name}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{job.location}</span>
                    <span className="text-sm font-semibold text-blue-600">{job.salary}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Matched Jobs / Sidebar */}
        <div className="space-y-8">
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-xl font-bold mb-2 flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Smart Matching
            </h2>
            <p className="text-blue-100 text-sm mb-6">
              Based on your skills and profile analysis, we found these matches for you.
            </p>
            
            <div className="space-y-4">
              {matchedJobs.length > 0 ? (
                matchedJobs.map(job => (
                  <div key={job._id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <h4 className="font-semibold text-white truncate">{job.title}</h4>
                    <p className="text-xs text-blue-100 mb-3">{job.company?.name}</p>
                    <Link to="/jobs" className="text-xs bg-white text-blue-600 px-3 py-1.5 rounded-lg font-bold inline-block hover:bg-blue-50 transition-colors">
                      Apply Now
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-blue-200 text-sm">
                  Complete your profile to get matched!
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Quick Profile Tips</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 mr-2 shrink-0" />
                Add specific technical skills to improve matching.
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 mr-2 shrink-0" />
                Upload a professional resume in PDF format.
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 mr-2 shrink-0" />
                Write a compelling bio to attract recruiters.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
