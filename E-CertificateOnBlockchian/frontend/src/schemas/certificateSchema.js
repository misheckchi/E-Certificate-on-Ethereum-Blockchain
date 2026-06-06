// Certificate Metadata Schema
export const CertificateMetadataSchema = {
  tokenId: 'number',
  universityId: 'number',
  studentName: 'string',
  studentEmail: 'string',
  certificateURL: 'string', // IPFS link
  metadata: {
    issued_at: 'date',
    issued_by: 'string',
    degree_type: 'string',
    cgpa: 'string',
    department: 'string'
  }
};

// Certificate validation function
export const validateCertificate = (data) => {
  const errors = [];
  
  if (!data.tokenId || typeof data.tokenId !== 'number') {
    errors.push('Token ID is required and must be a number');
  }
  
  if (!data.universityId || typeof data.universityId !== 'number') {
    errors.push('University ID is required and must be a number');
  }
  
  if (!data.studentName || typeof data.studentName !== 'string' || data.studentName.trim() === '') {
    errors.push('Student name is required and must be a string');
  }
  
  if (data.studentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.studentEmail)) {
    errors.push('Invalid student email format');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Certificate data formatter
export const formatCertificateData = (certificate) => {
  return {
    tokenId: Number(certificate.tokenId || 0),
    universityId: Number(certificate.universityId || 0),
    studentName: certificate.name || certificate.studentName || 'Unknown',
    studentEmail: certificate.studentEmail || '',
    department: certificate.department || '',
    examinationYear: certificate.examinationYear || '',
    letterGrade: certificate.letterGrade || '',
    cgpa: certificate.cgpa || '',
    issueDate: certificate.issueDate || new Date().toISOString(),
    serialNo: certificate.serialNo || '',
    registrationNumber: certificate.registrationNumber || '',
    certificateURL: certificate.certificateURL || '',
    schoolName: certificate.schoolName || '',
    status: certificate.status || 'active'
  };
};

// Certificate generation metadata
export const generateCertificateMetadata = (certificate, university) => {
  return {
    tokenId: certificate.tokenId || 0,
    universityId: certificate.universityId || 0,
    universityName: university?.name || 'Unknown University',
    studentName: certificate.name || 'Unknown Student',
    studentEmail: certificate.studentEmail || '',
    studentAddress: certificate.student || '',
    registrationNumber: certificate.registrationNumber || '',
    department: certificate.department || '',
    examinationYear: certificate.examinationYear || '',
    letterGrade: certificate.letterGrade || '',
    cgpa: certificate.cgpa || '',
    issueDate: certificate.issueDate || new Date().toISOString(),
    serialNo: certificate.serialNo || '',
    metadata: {
      issued_at: new Date(certificate.issueDate || Date.now()),
      issued_by: university?.name || 'Blockchain Certificate System',
      degree_type: 'Certificate',
      cgpa: certificate.cgpa || 'N/A',
      department: certificate.department || 'General'
    }
  };
};
