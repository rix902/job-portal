import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Users, Building, Globe, MapPin, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobRes, profileRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/recruiter`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/profile`)
      ]);
      setJobs(jobRes.data);
      setCompany(profileRes.data.company);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Company Overview Card */}
      {company ? (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-100 uppercase">
              {company.name?.[0] || 'C'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 font-medium">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-blue-500" /> {company.location}
                </span>
                {company.website && company.website.trim() !== '' && (
                  <a 
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center hover:text-blue-600 transition-colors"
                  >
                    <Globe className="w-4 h-4 mr-1 text-blue-500" /> 
                    {(() => {
                      try {
                        const urlStr = company.website.trim();
                        const validUrl = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
                        const urlObj = new URL(validUrl);
                        return urlObj.hostname || 'Website';
                      } catch (e) {
                        return 'Website';
                      }
                    })()}
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-gray-50 px-6 py-3 rounded-2xl text-center">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Jobs</p>
              <p className="text-xl font-bold text-gray-900">{jobs.length}</p>
            </div>
            <Link to="/profile" className="flex items-center px-6 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
              Edit Company
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 rounded-3xl p-8 border border-yellow-100 text-center">
          <Building className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-yellow-800">Complete Your Company Profile</h3>
          <p className="text-yellow-700 text-sm mt-1 max-w-md mx-auto">
            You need to add your company details before you can start posting jobs and reaching candidates.
          </p>
          <Link to="/profile" className="mt-6 inline-block bg-yellow-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-yellow-700 transition-all shadow-lg shadow-yellow-100">
            Setup Company Now
          </Link>
        </div>
      )}

      {/* Jobs Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
            My Job Listings
          </h2>
          {company && (
            <Link 
              to="/post-job"
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center shadow-lg shadow-blue-100 active:scale-95"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Post New Job
            </Link>
          )}
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No jobs posted yet</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              Once you post your first job, it will appear here for you to manage.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 flex flex-col group">
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-4 font-medium">
                    <MapPin className="w-4 h-4 mr-1 text-red-400" /> {job.location}
                    <span className="mx-2">•</span>
                    <span className="text-blue-600 font-bold">{job.salary}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-50">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                    job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {job.status}
                  </span>
                  <button className="text-blue-600 text-sm font-bold hover:underline">
                    View Applicants
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
