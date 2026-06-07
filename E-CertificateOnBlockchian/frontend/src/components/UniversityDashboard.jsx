import React, { useState, useContext, useEffect } from 'react';
import { UniversityService } from '../services/universityService';
import { DarkModeContext } from './DarkModeContext';
import { UniversityManager } from './UniversityManager';

export const UniversityDashboard = ({ provider, signer, account, isOwner }) => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [newMinter, setNewMinter] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('list');

  const universityService = provider && signer ? new UniversityService(provider, signer) : null;

  // Fetch universities
  const fetchUniversities = async () => {
    if (!universityService) return;
    try {
      setLoading(true);
      // Fetch from contract (you'd need to add a function to get all universities)
      // For now, this is a placeholder
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, [universityService]);

  const handleAddMinter = async () => {
    if (!selectedUniversity || !newMinter) {
      setMessage({ type: 'error', text: 'Please select a university and enter a minter address' });
      return;
    }

    try {
      setLoading(true);
      await universityService.addMinterToUniversity(selectedUniversity.universityId, newMinter);
      setMessage({ type: 'success', text: 'Minter added successfully!' });
      setNewMinter('');
      // Refresh universities
      await fetchUniversities();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMinter = async (universityId, minerAddress) => {
    try {
      setLoading(true);
      await universityService.removeMinterFromUniversity(universityId, minerAddress);
      setMessage({ type: 'success', text: 'Minter removed successfully!' });
      await fetchUniversities();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUniversityCreated = () => {
    setMessage({ type: 'success', text: 'University created! Refreshing list...' });
    setTimeout(fetchUniversities, 2000);
  };

  if (!isOwner) {
    return (
      <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          You need to be the contract owner to access the University Dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        University Management Dashboard
      </h1>

      {message.text && (
        <div
          className={`mb-4 p-4 rounded-lg border ${
            message.type === 'success'
              ? isDarkMode
                ? 'bg-green-900 border-green-700 text-green-300'
                : 'bg-green-100 border-green-400 text-green-700'
              : isDarkMode
              ? 'bg-red-900 border-red-700 text-red-300'
              : 'bg-red-100 border-red-400 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'list'
              ? isDarkMode
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'border-b-2 border-blue-600 text-blue-600'
              : isDarkMode
              ? 'text-gray-400'
              : 'text-gray-600'
          }`}
        >
          Universities
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'create'
              ? isDarkMode
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'border-b-2 border-blue-600 text-blue-600'
              : isDarkMode
              ? 'text-gray-400'
              : 'text-gray-600'
          }`}
        >
          Register New University
        </button>
      </div>

      {/* Universities List Tab */}
      {activeTab === 'list' && (
        <div>
          {universities.length === 0 ? (
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              No universities registered yet.
            </p>
          ) : (
            <div className="space-y-4">
              {universities.map(uni => (
                <div
                  key={uni.universityId}
                  className={`p-4 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {uni.name}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        ID: {uni.universityId} | Certificates: {uni.certCount}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        uni.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {uni.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Minters List */}
                  {selectedUniversity?.universityId === uni.universityId && (
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Add Minter
                      </h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMinter}
                          onChange={(e) => setNewMinter(e.target.value)}
                          placeholder="0x..."
                          className={`flex-1 px-3 py-2 rounded border font-mono text-sm ${
                            isDarkMode
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        <button
                          onClick={handleAddMinter}
                          disabled={loading}
                          className={`px-4 py-2 rounded font-medium ${
                            loading
                              ? 'bg-gray-400 cursor-not-allowed'
                              : isDarkMode
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedUniversity(selectedUniversity?.universityId === uni.universityId ? null : uni)}
                    className={`mt-3 px-4 py-2 rounded font-medium ${
                      isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {selectedUniversity?.universityId === uni.universityId ? 'Collapse' : 'Manage'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create University Tab */}
      {activeTab === 'create' && universityService && (
        <UniversityManager
          provider={provider}
          signer={signer}
          onUniversityCreated={handleUniversityCreated}
        />
      )}
    </div>
  );
};
