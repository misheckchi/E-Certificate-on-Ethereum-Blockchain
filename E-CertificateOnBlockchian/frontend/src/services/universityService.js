import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../utils/contractInfo';

export class UniversityService {
  constructor(provider, signer) {
    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(contractAddress, contractABI, signer);
  }

  // Register a new university
  async registerUniversity(universityName, adminAddress) {
    try {
      const tx = await this.contract.registerUniversity(universityName, adminAddress);
      const receipt = await tx.wait();
      
      // Extract event data
      const iface = new ethers.Interface(contractABI);
      const logs = receipt.logs;
      
      for (const log of logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === 'UniversityRegistered') {
            return {
              success: true,
              universityId: parsed.args.universityId.toString(),
              transactionHash: receipt.transactionHash
            };
          }
        } catch (e) {
          // Continue if event parsing fails
        }
      }
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      throw new Error(`Failed to register university: ${error.message}`);
    }
  }

  // Get university by ID
  async getUniversity(universityId) {
    try {
      const university = await this.contract.getUniversity(universityId);
      return {
        universityId,
        name: university.name,
        admin: university.admin,
        isActive: university.isActive,
        certCount: Number(university.certCount)
      };
    } catch (error) {
      throw new Error(`Failed to fetch university: ${error.message}`);
    }
  }

  // Get university by name
  async getUniversityByName(universityName) {
    try {
      const university = await this.contract.getUniversityByName(universityName);
      return {
        name: university.name,
        admin: university.admin,
        isActive: university.isActive,
        certCount: Number(university.certCount)
      };
    } catch (error) {
      throw new Error(`Failed to fetch university by name: ${error.message}`);
    }
  }

  // Add minter to a university
  async addMinterToUniversity(universityId, minerAddress) {
    try {
      const tx = await this.contract.addMinterToUniversity(universityId, minerAddress);
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      throw new Error(`Failed to add minter: ${error.message}`);
    }
  }

  // Remove minter from university
  async removeMinterFromUniversity(universityId, minerAddress) {
    try {
      const tx = await this.contract.removeMinterFromUniversity(universityId, minerAddress);
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      throw new Error(`Failed to remove minter: ${error.message}`);
    }
  }

  // Issue certificate through university
  async issueCertificate(universityId, certificateData) {
    try {
      const tx = await this.contract.issueCertificate(
        universityId,
        certificateData.studentAddress,
        certificateData.registrationNumber,
        certificateData.name,
        certificateData.schoolName,
        certificateData.department,
        certificateData.examinationYear,
        certificateData.letterGrade,
        certificateData.cgpa,
        certificateData.issueDate,
        certificateData.token
      );
      
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      throw new Error(`Failed to issue certificate: ${error.message}`);
    }
  }

  // Burn certificate
  async burnCertificate(token) {
    try {
      const tx = await this.contract.burnCertificate(token);
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      throw new Error(`Failed to burn certificate: ${error.message}`);
    }
  }

  // Get certificate by token
  async getCertificateByToken(token) {
    try {
      const cert = await this.contract.getCertificateByToken(token);
      return {
        serialNo: cert.serialNo,
        registrationNumber: cert.registrationNumber,
        name: cert.name,
        schoolName: cert.schoolName,
        department: cert.department,
        examinationYear: cert.examinationYear,
        letterGrade: cert.letterGrade,
        cgpa: cert.cgpa,
        issueDate: cert.issueDate,
        student: cert.student,
        token: cert.token,
        universityId: Number(cert.universityId)
      };
    } catch (error) {
      throw new Error(`Failed to fetch certificate: ${error.message}`);
    }
  }

  // Get certificate by student address
  async getCertificate(studentAddress) {
    try {
      const cert = await this.contract.getCertificate(studentAddress);
      return {
        serialNo: cert.serialNo,
        registrationNumber: cert.registrationNumber,
        name: cert.name,
        schoolName: cert.schoolName,
        department: cert.department,
        examinationYear: cert.examinationYear,
        letterGrade: cert.letterGrade,
        cgpa: cert.cgpa,
        issueDate: cert.issueDate,
        student: cert.student,
        token: cert.token,
        universityId: Number(cert.universityId)
      };
    } catch (error) {
      throw new Error(`Failed to fetch certificate: ${error.message}`);
    }
  }

  // Verify certificate validity
  async isValidCertificate(token) {
    try {
      return await this.contract.isValidCertificate(token);
    } catch (error) {
      throw new Error(`Failed to verify certificate: ${error.message}`);
    }
  }

  // Get current signer address
  async getSignerAddress() {
    try {
      return await this.signer.getAddress();
    } catch (error) {
      throw new Error(`Failed to get signer address: ${error.message}`);
    }
  }

  // Check if connected as owner
  async isOwner() {
    try {
      const signerAddress = await this.getSignerAddress();
      const owner = await this.contract.owner();
      return signerAddress.toLowerCase() === owner.toLowerCase();
    } catch (error) {
      throw new Error(`Failed to check owner status: ${error.message}`);
    }
  }

  // Check if is minter for a university
  async isMinterForUniversity(universityId, address) {
    try {
      return await this.contract.universityMinters(universityId, address);
    } catch (error) {
      throw new Error(`Failed to check minter status: ${error.message}`);
    }
  }
}
