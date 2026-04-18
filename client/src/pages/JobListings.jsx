import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin, DollarSign, Building, Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchTerm, locationFilter, jobs]);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`);
      setJobs(res.data);
      setFilteredJobs(res.data);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let tempJobs = jobs;

    if (searchTerm) {
      tempJobs = tempJobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      tempJobs = tempJobs.filter(job => 
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredJobs(tempJobs);
  };

  const handleApply = async (jobId) => {
    if (!user) {
      toast.error('Please login to apply for jobs');
      return;
    }
    
    if (user.role !== 'jobseeker') {
      toast.error('Only job seekers can apply for jobs');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/applications/apply/${jobId}`);
      toast.success('Successfully applied for the job!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Explore Opportunities</h1>
        <p className="mt-3 text-lg text-gray-600">Discover your next career move in Bangalore and beyond.</p>
        
        {/* Search and Filter Bar */}
        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by job title, company, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="relative md:w-64">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Location (e.g. Bangalore)"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.map((job) => (
          <div key={job._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300">
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-blue-600 text-xl">
                  {job.company?.name?.[0] || 'J'}
                </div>
                <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                  New
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{job.title}</h3>
              
              <div className="space-y-3 mb-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="font-medium">{job.company?.name || 'Company Name'}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-red-500" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                  <span className="font-semibold text-gray-900">{job.salary}</span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                {job.description}
              </p>
            </div>
            
            <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
              <span className="text-xs font-medium text-gray-400">
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleApply(job._id)}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
              >
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredJobs.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No matching jobs found</h3>
          <p className="text-gray-500 max-w-sm mx-auto">Try adjusting your search terms or location filter to find more opportunities.</p>
        </div>
      )}
    </div>
  );
};

export default JobListings;
