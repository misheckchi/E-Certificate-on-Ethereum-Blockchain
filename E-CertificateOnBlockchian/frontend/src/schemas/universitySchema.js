// University Schema for validation and type checking
export const UniversitySchema = {
  universityId: 'number',
  name: 'string',
  admin: 'string', // Ethereum address
  website: 'string',
  logo: 'string', // IPFS URL
  contactEmail: 'string',
  createdAt: 'date',
  isActive: 'boolean',
  certificateCount: 'number',
  minters: ['string'] // Array of addresses
};

// Validation function
export const validateUniversity = (data) => {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('University name is required and must be a string');
  }
  
  if (!data.admin) {
    errors.push('Admin address is required');
  } else if (!/^0x[a-fA-F0-9]{40}$/.test(data.admin)) {
    errors.push('Invalid Ethereum address format for admin. Must be 42 characters starting with 0x');
  }
  
  if (data.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
    errors.push('Invalid email format');
  }
  
  if (data.website && typeof data.website !== 'string') {
    errors.push('Website must be a string');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Formatter for displaying university data
export const formatUniversityData = (university) => {
  return {
    universityId: Number(university.universityId || 0),
    name: university.name || 'Unknown',
    admin: university.admin || '0x0',
    website: university.website || '',
    logo: university.logo || '',
    contactEmail: university.contactEmail || '',
    createdAt: university.createdAt ? new Date(university.createdAt) : new Date(),
    isActive: university.isActive !== undefined ? university.isActive : true,
    certificateCount: Number(university.certificateCount || 0),
    minters: Array.isArray(university.minters) ? university.minters : []
  };
};
