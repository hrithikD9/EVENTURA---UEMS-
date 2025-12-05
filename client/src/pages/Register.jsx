import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building, CreditCard, Eye, EyeOff, Users, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'student', // Default role
    studentId: '',
    teacherId: '',
    staffId: '',
    organizationName: '',
    organizationCode: '',
  });
  const [errors, setErrors] = useState({});

  const roles = [
    {
      id: 'student',
      label: 'Student',
      description: 'University student',
      icon: Users,
      color: 'bg-blue-100 text-blue-600 border-blue-200'
    },
    {
      id: 'faculty',
      label: 'Faculty',
      description: 'Teaching staff',
      icon: UserCheck,
      color: 'bg-green-100 text-green-600 border-green-200'
    },
    {
      id: 'staff',
      label: 'Staff',
      description: 'University staff',
      icon: User,
      color: 'bg-purple-100 text-purple-600 border-purple-200'
    },
    {
      id: 'organizer',
      label: 'Organizer',
      description: 'Event organizer',
      icon: Shield,
      color: 'bg-orange-100 text-orange-600 border-orange-200'
    }
  ];

  const departments = [
    'Computer Science & Engineering',
    'Electrical & Electronic Engineering',
    'Business Administration',
    'English',
    'Law',
    'Economics',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Other',
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.endsWith('@neub.edu.bd')) {
      newErrors.email = 'Please use your university email (@neub.edu.bd)';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Department validation (not required for staff and organizer)
    if ((formData.role === 'student' || formData.role === 'faculty') && !formData.department) {
      newErrors.department = 'Please select your department';
    }

    // Role-specific validations
    if (formData.role === 'student' && !formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    }

    if (formData.role === 'faculty' && !formData.teacherId.trim()) {
      newErrors.teacherId = 'Teacher ID is required';
    }

    if (formData.role === 'staff' && !formData.staffId.trim()) {
      newErrors.staffId = 'Staff ID is required';
    }

    if (formData.role === 'organizer') {
      if (!formData.organizationName.trim()) {
        newErrors.organizationName = 'Organization name is required';
      }
      if (!formData.organizationCode.trim()) {
        newErrors.organizationCode = 'Organization code is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      // Add department for students and faculty only
      if (formData.role === 'student' || formData.role === 'faculty') {
        userData.department = formData.department;
      }

      // Add role-specific data
      if (formData.role === 'student') {
        userData.studentId = formData.studentId;
      } else if (formData.role === 'faculty') {
        userData.teacherId = formData.teacherId;
      } else if (formData.role === 'staff') {
        userData.staffId = formData.staffId;
      } else if (formData.role === 'organizer') {
        userData.organizationName = formData.organizationName;
        userData.organizationCode = formData.organizationCode;
      }

      await register(userData);
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">Join Eventura and never miss an event</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am registering as <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className={`relative flex items-center p-4 cursor-pointer rounded-lg border-2 transition-all ${
                      formData.role === role.id
                        ? role.color
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.id}
                      checked={formData.role === role.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <role.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">{role.label}</div>
                      <div className="text-xs text-gray-500">{role.description}</div>
                    </div>
                    {formData.role === role.id && (
                      <div className="absolute top-2 right-2">
                        <div className="h-2 w-2 bg-current rounded-full"></div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                University Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="you@neub.edu.bd"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Department & ID Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department - Only for Student and Faculty */}
              {(formData.role === 'student' || formData.role === 'faculty') && (
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      id="department"
                      name="department"
                      required
                      value={formData.department}
                      onChange={handleChange}
                      className={`input pl-10 ${errors.department ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
                </div>
              )}

              {/* Organization Name - Only for Organizer */}
              {formData.role === 'organizer' && (
                <div>
                  <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="organizationName"
                      name="organizationName"
                      type="text"
                      required
                      value={formData.organizationName}
                      onChange={handleChange}
                      className={`input pl-10 ${errors.organizationName ? 'border-red-500' : ''}`}
                      placeholder="e.g., CSE Society"
                    />
                  </div>
                  {errors.organizationName && <p className="mt-1 text-sm text-red-600">{errors.organizationName}</p>}
                </div>
              )}

              {/* Dynamic ID Field */}
              <div>
                {formData.role === 'student' && (
                  <>
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                      Student ID <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="studentId"
                        name="studentId"
                        type="text"
                        required
                        value={formData.studentId}
                        onChange={handleChange}
                        className={`input pl-10 ${errors.studentId ? 'border-red-500' : ''}`}
                        placeholder="e.g., 20230001"
                      />
                    </div>
                    {errors.studentId && <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>}
                  </>
                )}

                {formData.role === 'faculty' && (
                  <>
                    <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-2">
                      Faculty ID <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="teacherId"
                        name="teacherId"
                        type="text"
                        required
                        value={formData.teacherId}
                        onChange={handleChange}
                        className={`input pl-10 ${errors.teacherId ? 'border-red-500' : ''}`}
                        placeholder="e.g., FAC001"
                      />
                    </div>
                    {errors.teacherId && <p className="mt-1 text-sm text-red-600">{errors.teacherId}</p>}
                  </>
                )}

                {formData.role === 'staff' && (
                  <>
                    <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 mb-2">
                      Staff ID <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="staffId"
                        name="staffId"
                        type="text"
                        required
                        value={formData.staffId}
                        onChange={handleChange}
                        className={`input pl-10 ${errors.staffId ? 'border-red-500' : ''}`}
                        placeholder="e.g., STF001"
                      />
                    </div>
                    {errors.staffId && <p className="mt-1 text-sm text-red-600">{errors.staffId}</p>}
                  </>
                )}

                {formData.role === 'organizer' && (
                  <>
                    <label htmlFor="organizationCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="organizationCode"
                        name="organizationCode"
                        type="text"
                        required
                        value={formData.organizationCode}
                        onChange={handleChange}
                        className={`input pl-10 ${errors.organizationCode ? 'border-red-500' : ''}`}
                        placeholder="e.g., CSE-SOC-001"
                      />
                    </div>
                    {errors.organizationCode && <p className="mt-1 text-sm text-red-600">{errors.organizationCode}</p>}
                    <p className="mt-1 text-xs text-gray-500">Contact your organization for the code</p>
                  </>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 mt-0.5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-teal-600 hover:text-teal-700 font-medium">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-teal-600 hover:text-teal-700 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              Create Account
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
