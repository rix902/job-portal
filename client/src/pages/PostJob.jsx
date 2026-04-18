import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, MapPin, DollarSign, AlignLeft, Send, Loader2, Building } from 'lucide-react';
import toast from 'react-hot-toast';

const PostJob = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [fetchingCompanies, setFetchingCompanies] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`);
      if (res.data.company) {
        setCompanies([res.data.company]);
        setFormData(prev => ({ ...prev, company: res.data.company._id }));
      } else {
        toast.error('Please create a company profile first!');
        navigate('/profile');
      }
    } catch (err) {
      toast.error('Failed to load profile data');
    } finally {
      setFetchingCompanies(false);
    }
  };

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/jobs`, formData);
      toast.success('Job posted successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCompanies) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <h1 className="text-3xl font-bold flex items-center">
            <Briefcase className="w-8 h-8 mr-3" />
            Post a New Job
          </h1>
          <p className="mt-2 text-blue-100">Fill in the details below to reach thousands of potential candidates.</p>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                Job Title
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={onChange}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                  <Building className="w-4 h-4 mr-2 text-gray-400" /> Company
                </label>
                <select
                  name="company"
                  required
                  value={formData.company}
                  onChange={onChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">Select Company</option>
                  {companies.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" /> Location
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={onChange}
                  placeholder="e.g. Remote or Bangalore, India"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-gray-400" /> Salary Range
              </label>
              <input
                type="text"
                name="salary"
                required
                value={formData.salary}
                onChange={onChange}
                placeholder="e.g. ₹15,00,000 - ₹25,00,000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                <AlignLeft className="w-4 h-4 mr-2 text-gray-400" /> Job Description
              </label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={onChange}
                rows={8}
                placeholder="Describe the role, responsibilities, and requirements..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-6 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-70 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
              ) : (
                <Send className="w-6 h-6 mr-2" />
              )}
              {loading ? 'Posting Job...' : 'Publish Job Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
