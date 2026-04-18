import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Briefcase, Award, Save, Loader2, Building, Globe, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    skills: '',
    education: ''
  });

  const [companyData, setCompanyData] = useState({
    name: '',
    description: '',
    website: '',
    location: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    
    setFormData({
      name: user.name || '',
      email: user.email || '',
      bio: user.profile?.bio || '',
      skills: user.profile?.skills?.join(', ') || '',
      education: user.profile?.education || ''
    });

    if (user.role === 'recruiter') {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`);
        if (res.data.company) {
          setCompanyData({
            name: res.data.company.name || '',
            description: res.data.company.description || '',
            website: res.data.company.website || '',
            location: res.data.company.location || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch company data');
      }
    }
  };

  const onProfileChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const onCompanyChange = (e) => setCompanyData({ ...companyData, [e.target.name]: e.target.value });

  const onProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const profileData = {
      bio: formData.bio,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== ''),
      education: formData.education
    };

    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/profile`, profileData);
      setUser({ ...user, profile: res.data.profile });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onCompanySubmit = async (e) => {
    e.preventDefault();
    setCompanyLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/profile/company`, companyData);
      toast.success('Company information updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update company information');
    } finally {
      setCompanyLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Personal Profile Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 h-32 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-md flex items-center justify-center border-4 border-white">
              <User className="w-12 h-12 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
          <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
          <p className="text-gray-500 capitalize font-medium">{user?.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}</p>
          
          <form onSubmit={onProfileSubmit} className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input type="text" value={formData.name} disabled className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <input type="email" value={formData.email} disabled className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-gray-400" /> Professional Bio
              </label>
              <textarea name="bio" value={formData.bio} onChange={onProfileChange} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tell us about yourself..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-gray-400" /> Skills (Comma separated)
                </label>
                <input type="text" name="skills" value={formData.skills} onChange={onProfileChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="React, Node.js, etc." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-gray-400" /> Education
                </label>
                <input type="text" name="education" value={formData.education} onChange={onProfileChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Degree/University" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-70">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              Save Profile Changes
            </button>
          </form>
        </div>
      </div>

      {/* Recruiter Specific: Company Section */}
      {user?.role === 'recruiter' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-800 p-8 text-white">
            <h2 className="text-2xl font-bold flex items-center">
              <Building className="w-6 h-6 mr-3 text-blue-400" />
              Company Information
            </h2>
            <p className="mt-1 text-gray-400">This info is required before you can post any jobs.</p>
          </div>
          
          <form onSubmit={onCompanySubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                  Company Name
                </label>
                <input name="name" value={companyData.name} onChange={onCompanyChange} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Acme Inc" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-gray-400" /> Website URL
                </label>
                <input name="website" value={companyData.website} onChange={onCompanyChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" /> Headquarters Location
              </label>
              <input name="location" value={companyData.location} onChange={onCompanyChange} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Bangalore, India" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Company Description</label>
              <textarea name="description" value={companyData.description} onChange={onCompanyChange} rows={4} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tell candidates about your company mission and culture..." />
            </div>

            <button type="submit" disabled={companyLoading} className="flex items-center justify-center px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-100 disabled:opacity-70">
              {companyLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              Update Company Details
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
