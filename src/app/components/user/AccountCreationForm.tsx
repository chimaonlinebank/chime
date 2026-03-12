import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Upload, X } from 'lucide-react';
import { Logo } from '../Logo';

interface AccountCreationFormProps {
  onSubmit: (formData: AccountCreationFormData) => void;
  isLoading?: boolean;
}

export interface AccountCreationFormData {
  // Step 1: Personal Information
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  nationality: string;
  houseAddress: string;
  // Step 2: Occupation
  occupation: string;
  salaryRange: string;
  // Step 3: Account Setup
  accountType: 'CHECKING' | 'SAVINGS';
  currency: string;
  photo: File | null;
  pin: string;
  confirmPin?: string;
}

const nationalityList = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon',
  'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Czechia', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
  'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
  'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait',
  'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
  'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru',
  'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
  'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

const salaryRanges = [
  'Under $30,000',
  '$30,000 - $50,000',
  '$50,000 - $75,000',
  '$75,000 - $100,000',
  '$100,000 - $150,000',
  '$150,000 - $250,000',
  'Above $250,000',
  'Prefer not to say'
];

const occupations = [
  'Student', 'Unemployed', 'Self Employed', 'Homemaker', 'Retired',
  'Software Engineer', 'Healthcare Professional', 'Educator', 'Finance Professional',
  'Sales & Marketing', 'Manufacturing', 'Construction', 'Transportation',
  'Government Employee', 'Other'
];

export default function AccountCreationForm({ onSubmit, isLoading = false }: AccountCreationFormProps) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [nationalitySearch, setNationalitySearch] = useState('');
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nationalityRef = useRef<HTMLDivElement>(null);

  // Close nationality dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (nationalityRef.current && !nationalityRef.current.contains(event.target as Node)) {
        setShowNationalityDropdown(false);
      }
    };

    if (showNationalityDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNationalityDropdown]);
  
  const [formData, setFormData] = useState<AccountCreationFormData>({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'male',
    dateOfBirth: '',
    nationality: '',
    houseAddress: '',
    occupation: '',
    salaryRange: '',
    accountType: 'CHECKING',
    currency: 'USD',
    photo: null,
    pin: '',
    confirmPin: '',
  });

  const handleInputChange = (field: keyof AccountCreationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.houseAddress.trim()) newErrors.houseAddress = 'House address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.occupation) newErrors.occupation = 'Occupation is required';
    if (!formData.salaryRange) newErrors.salaryRange = 'Salary range is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    let valid = true;
    const newErrors: Record<string, string> = {};
    if (!formData.pin || formData.pin.length < 6) {
      newErrors.pin = 'PIN must be 6 digits';
      valid = false;
    }
    if (!formData.confirmPin || formData.confirmPin.length < 6) {
      newErrors.confirmPin = 'Please confirm your 6-digit PIN';
      valid = false;
    } else if (formData.pin !== formData.confirmPin) {
      newErrors.confirmPin = 'PINs do not match';
      valid = false;
    }
    setErrors(prev => ({ ...prev, ...newErrors }));
    return valid;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, photo: 'Please upload an image file' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: 'File size must be less than 5MB' }));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      handleInputChange('photo', file);
      setErrors(prev => ({ ...prev, photo: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep3()) {
      onSubmit(formData);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    handleInputChange('photo', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-full bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full rounded-2xl overflow-hidden flex flex-col"
      >
          {/* Header with Logo */}
          <div className="bg-gradient-to-r from-[#00b388] to-[#009670] px-8 py-6 text-white rounded-t-2xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-3">
              <Logo className="w-8 h-8" innerClassName="text-white font-bold text-lg" />
            </div>
            <h1 className="text-2xl font-bold text-center">Create Your Account</h1>
            <p className="text-sm text-gray-100 mt-2">Step {step} of 3</p>
          </div>

          {/* Progress Bar */}
          <div className="px-8 pt-6">
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    s <= step ? 'bg-[#00b388]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="px-8 py-6 overflow-y-auto flex-1">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>

                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b388] focus:border-transparent outline-none transition disabled:bg-gray-100"
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Middle Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Middle Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.middleName}
                      onChange={(e) => handleInputChange('middleName', e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b388] focus:border-transparent outline-none transition disabled:bg-gray-100"
                      placeholder="Michael"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b388] focus:border-transparent outline-none transition disabled:bg-gray-100"
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      value={formData.gender}
                      title="Gender"
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b388] focus:border-transparent outline-none transition disabled:bg-gray-100"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      title="Date of Birth"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b388] focus:border-transparent outline-none transition disabled:bg-gray-100"
                    />
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                    )}
                  </div>

                  {/* Nationality */}
                  <div ref={nationalityRef} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality *
                    </label>
                    <input
                      type="text"
                      placeholder="Search and select nationality..."
                      value={showNationalityDropdown ? nationalitySearch : formData.nationality}
                      onChange={(e) => {
                        setNationalitySearch(e.target.value);
                        setShowNationalityDropdown(true);
                      }}
                      onFocus={() => setShowNationalityDropdown(true)}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b388] focus:border-transparent outline-none transition disabled:bg-gray-100"
                    />
                    
                    {/* Dropdown List */}
                    {showNationalityDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
                      >
                        {nationalityList
                          .filter((nat) =>
                            nat.toLowerCase().includes(nationalitySearch.toLowerCase())
                          )
                          .map((nat) => (
                            <motion.button
                              key={nat}
                              type="button"
                              onClick={() => {
                                handleInputChange('nationality', nat);
                                setShowNationalityDropdown(false);
                                setNationalitySearch('');
                              }}
                              className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition ${
                                formData.nationality === nat ? 'bg-[#00b388]/10 text-[#00b388] font-semibold' : ''
                              }`}
                            >
                              {nat}
                            </motion.button>
                          ))}
                        {nationalityList.filter((nat) =>
                          nat.toLowerCase().includes(nationalitySearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-2 text-gray-500 text-sm">No countries found</div>
                        )}
                      </motion.div>
                    )}
                    
                    {errors.nationality && (
                      <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>
                    )}
                  </div>

                  {/* House Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      House Address *
                    </label>
                    <textarea
                      value={formData.houseAddress}
                      onChange={(e) => handleInputChange('houseAddress', e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b388] focus:border-transparent outline-none transition disabled:bg-gray-100 resize-none"
                      rows={3}
                      placeholder="Enter your complete address"
                    />
                    {errors.houseAddress && (
                      <p className="text-red-500 text-xs mt-1">{errors.houseAddress}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Occupation & Income</h2>

                  {/* Occupation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupation *
                    </label>
                    <select
                      value={formData.occupation}
                      title="Occupation"
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b388] focus:border-transparent outline-none transition disabled:bg-gray-100"
                    >
                      <option value="">Select Occupation</option>
                      {occupations.map((occ) => (
                        <option key={occ} value={occ}>
                          {occ}
                        </option>
                      ))}
                    </select>
                    {errors.occupation && (
                      <p className="text-red-500 text-xs mt-1">{errors.occupation}</p>
                    )}
                  </div>

                  {/* Salary Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Salary Range *
                    </label>
                    <select
                      value={formData.salaryRange}
                      title="Salary Range"
                      onChange={(e) => handleInputChange('salaryRange', e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b388] focus:border-transparent outline-none transition disabled:bg-gray-100"
                    >
                      <option value="">Select Salary Range</option>
                      {salaryRanges.map((range) => (
                        <option key={range} value={range}>
                          {range}
                        </option>
                      ))}
                    </select>
                    {errors.salaryRange && (
                      <p className="text-red-500 text-xs mt-1">{errors.salaryRange}</p>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <p className="text-sm text-blue-900">
                      💡 This information helps us understand your financial profile and provide better services.
                    </p>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Setup</h2>

                  {/* Account Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Account Type
                    </label>
                    <div className="space-y-2">
                      {['CHECKING', 'SAVINGS'].map((type) => (
                        <label key={type} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                          <input
                            type="radio"
                            value={type}
                            checked={formData.accountType === type}
                            onChange={(e) => handleInputChange('accountType', e.target.value)}
                            disabled={isLoading}
                            className="w-4 h-4"
                          />
                          <span className="ml-3 text-gray-900 font-medium">
                            {type === 'CHECKING' ? 'Checking Account (Recommended)' : 'Savings Account'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Currency
                    </label>
                    <select
                      value={formData.currency}
                      title="Currency"
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b388] focus:border-transparent outline-none transition disabled:bg-gray-100"
                    >
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                      <option value="CAD">Canadian Dollar (C$)</option>
                      <option value="AUD">Australian Dollar (A$)</option>
                    </select>
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Photo / Selfie *
                    </label>
                    <input
                      id="photoUpload"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={isLoading}
                      className="hidden"
                      title="Upload your photo or selfie"
                    />
                    {photoPreview ? (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          title="Remove photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#00b388] hover:bg-green-50 transition"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload your photo or selfie
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Max 5MB • JPEG, PNG, WebP
                        </p>
                      </div>
                    )}
                    {errors.photo && (
                      <p className="text-red-500 text-xs mt-1">{errors.photo}</p>
                    )}
                  </div>

                  {/* PIN Setup */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Set 6-Digit PIN *
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={formData.pin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        handleInputChange('pin', value);
                      }}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b388] focus:border-transparent outline-none transition disabled:bg-gray-100 tracking-widest text-center text-lg"
                      placeholder="••••••"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a 6-digit number. You'll use this to authorize transactions.
                    </p>
                    {errors.pin && (
                      <p className="text-red-500 text-xs mt-1">{errors.pin}</p>
                    )}
                  </div>

                  {/* Confirm PIN Setup */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm 6-Digit PIN *
                    </label>
                    <input
                      type="password"
                      id="confirmPin"
                      inputMode="numeric"
                      maxLength={6}
                      value={formData.confirmPin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        handleInputChange('confirmPin', value);
                      }}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b388] focus:border-transparent outline-none transition disabled:bg-gray-100 tracking-widest text-center text-lg"
                      placeholder="••••••"
                      title="Confirm your PIN"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Re-enter your PIN to confirm
                    </p>
                    {errors.confirmPin && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmPin}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handlePrev}
                disabled={step === 1 || isLoading}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </motion.button>

              {step < 3 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 bg-[#00b388] text-white font-semibold rounded-lg hover:bg-[#009670] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 bg-[#00b388] text-white font-semibold rounded-lg hover:bg-[#009670] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </motion.button>
              )}
            </div>
          </form>
      </motion.div>
    </div>
  );
}
