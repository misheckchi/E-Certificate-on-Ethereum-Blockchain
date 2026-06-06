import React, { useState, useContext } from 'react';
import { UniversityService } from '../services/universityService';
import { validateUniversity } from '../schemas/universitySchema';
import { DarkModeContext } from './DarkModeContext';

export const UniversityManager = ({ provider, signer, onUniversityCreated }) => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    admin: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleRegisterUniversity = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate input
      const validation = validateUniversity(formData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        setLoading(false);
        return;
      }

      const universityService = new UniversityService(provider, signer);
      const result = await universityService.registerUniversity(
        formData.name,
        formData.admin
      );

      setSuccess(`University registered successfully! Transaction: ${result.transactionHash}`);
      setFormData({ name: '', admin: '' });
      
      if (onUniversityCreated) {
        onUniversityCreated(result);
      }

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Register New University
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleRegisterUniversity} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            University Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Harvard University"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
            }`}
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Admin Wallet Address
          </label>
          <input
            type="text"
            name="admin"
            value={formData.admin}
            onChange={handleInputChange}
            placeholder="0x..."
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
            }`}
            required
          />
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Must be a valid Ethereum address (42 characters starting with 0x)
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg font-medium transition duration-200 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? 'Registering...' : 'Register University'}
        </button>
      </form>
    </div>
  );
};
