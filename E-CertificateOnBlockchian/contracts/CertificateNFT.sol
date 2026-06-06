// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateNFT is ERC721, Ownable {
    
    struct University {
        string name;
        address admin;
        bool isActive;
        uint256 certCount;
    }
    
    struct Certificate {
        string serialNo;
        string registrationNumber;
        string name;
        string schoolName;
        string department;
        string examinationYear;
        string letterGrade;
        string cgpa;
        string issueDate;
        address student;
        string token;
        uint256 universityId;
    }

    // University mappings
    mapping(uint256 => University) public universities;
    mapping(string => uint256) public universityNameToId;
    mapping(address => uint256) public addressToUniversityId;
    uint256 public nextUniversityId = 1;
    
    // Certificate mappings
    mapping(address => uint256) public studentToTokenId;
    mapping(uint256 => Certificate) public certificates;
    mapping(string => uint256) public tokenToTokenId;
    mapping(string => bool) public registrationNumberUsed;
    mapping(uint256 => address) public certificateIssuer;
    
    // University-specific minters
    mapping(uint256 => mapping(address => bool)) public universityMinters;
    
    // Legacy support
    mapping(address => bool) public minters;
    
    uint256 public nextTokenId = 1;
    uint256 public nextSerialNo = 10001;

    event UniversityRegistered(uint256 indexed universityId, string name, address admin);
    event UniversityDeactivated(uint256 indexed universityId);
    event CertificateIssued(uint256 indexed universityId, address indexed student, uint256 tokenId, string token);
    event CertificateBurned(uint256 indexed universityId, address indexed student, uint256 tokenId, string token);
    event MinterAddedToUniversity(uint256 indexed universityId, address indexed minter);
    event MinterRemovedFromUniversity(uint256 indexed universityId, address indexed minter);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    constructor() ERC721("CertificateNFT", "CERT") Ownable(msg.sender) {}

    // ============ UNIVERSITY MANAGEMENT ============
    
    function registerUniversity(
        string memory universityName,
        address universityAdmin
    ) external onlyOwner returns (uint256) {
        require(universityNameToId[universityName] == 0, "University already registered");
        require(universityAdmin != address(0), "Invalid admin address");
        
        uint256 universityId = nextUniversityId++;
        universities[universityId] = University(universityName, universityAdmin, true, 0);
        universityNameToId[universityName] = universityId;
        addressToUniversityId[universityAdmin] = universityId;
        
        emit UniversityRegistered(universityId, universityName, universityAdmin);
        return universityId;
    }

    function deactivateUniversity(uint256 universityId) external onlyOwner {
        require(universities[universityId].isActive, "University not active");
        universities[universityId].isActive = false;
        emit UniversityDeactivated(universityId);
    }

    function addMinterToUniversity(uint256 universityId, address minter) external {
        require(msg.sender == universities[universityId].admin || msg.sender == owner(), "Not authorized");
        require(universities[universityId].isActive, "University not active");
        require(!universityMinters[universityId][minter], "Already a minter");
        
        universityMinters[universityId][minter] = true;
        emit MinterAddedToUniversity(universityId, minter);
    }

    function removeMinterFromUniversity(uint256 universityId, address minter) external {
        require(msg.sender == universities[universityId].admin || msg.sender == owner(), "Not authorized");
        require(universityMinters[universityId][minter], "Not a minter");
        
        universityMinters[universityId][minter] = false;
        emit MinterRemovedFromUniversity(universityId, minter);
    }

    // ============ LEGACY SUPPORT (BACKWARD COMPATIBILITY) ============
    
    function addMinter(address minter) external onlyOwner {
        require(!minters[minter], "Already a minter");
        minters[minter] = true;
        emit MinterAdded(minter);
    }

    function removeMinter(address minter) external onlyOwner {
        require(minters[minter], "Not a minter");
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    modifier onlyMinterOrOwner() {
        require(minters[msg.sender] || msg.sender == owner(), "Not minter or owner");
        _;
    }

    // ============ CERTIFICATE ISSUANCE ============
    
    function issueCertificate(
        uint256 universityId,
        address student,
        string memory registrationNumber,
        string memory name,
        string memory schoolName,
        string memory department,
        string memory examinationYear,
        string memory letterGrade,
        string memory cgpa,
        string memory issueDate,
        string memory token
    ) external {
        require(universities[universityId].isActive, "University not active");
        require(
            universityMinters[universityId][msg.sender] || msg.sender == universities[universityId].admin || msg.sender == owner(),
            "Not authorized for this university"
        );
        require(studentToTokenId[student] == 0, "Student already has a certificate");
        require(tokenToTokenId[token] == 0, "Token already used");
        require(!registrationNumberUsed[registrationNumber], "Registration number already used");
        
        uint256 tokenId = nextTokenId++;
        string memory serialNo = _toString(nextSerialNo++);
        
        _safeMint(student, tokenId);
        
        certificates[tokenId] = Certificate(
            serialNo,
            registrationNumber,
            name,
            schoolName,
            department,
            examinationYear,
            letterGrade,
            cgpa,
            issueDate,
            student,
            token,
            universityId
        );
        
        studentToTokenId[student] = tokenId;
        tokenToTokenId[token] = tokenId;
        registrationNumberUsed[registrationNumber] = true;
        certificateIssuer[tokenId] = msg.sender;
        
        universities[universityId].certCount++;
        
        emit CertificateIssued(universityId, student, tokenId, token);
    }

    // Legacy issue function for backward compatibility
    function issueCertificateLegacy(
        address student,
        string memory registrationNumber,
        string memory name,
        string memory schoolName,
        string memory department,
        string memory examinationYear,
        string memory letterGrade,
        string memory cgpa,
        string memory issueDate,
        string memory token
    ) external onlyMinterOrOwner {
        require(studentToTokenId[student] == 0, "Student already has a certificate");
        require(tokenToTokenId[token] == 0, "Token already used");
        require(!registrationNumberUsed[registrationNumber], "Registration number already used");
        
        uint256 tokenId = nextTokenId++;
        string memory serialNo = _toString(nextSerialNo++);
        
        _safeMint(student, tokenId);
        
        certificates[tokenId] = Certificate(
            serialNo,
            registrationNumber,
            name,
            schoolName,
            department,
            examinationYear,
            letterGrade,
            cgpa,
            issueDate,
            student,
            token,
            0 // Legacy certificates have universityId = 0
        );
        
        studentToTokenId[student] = tokenId;
        tokenToTokenId[token] = tokenId;
        registrationNumberUsed[registrationNumber] = true;
        certificateIssuer[tokenId] = msg.sender;
        
        emit CertificateIssued(0, student, tokenId, token);
    }

    // ============ CERTIFICATE MANAGEMENT ============
    
    function burnCertificate(string memory token) external {
        uint256 tokenId = tokenToTokenId[token];
        require(tokenId != 0, "No certificate for this token");
        
        Certificate memory cert = certificates[tokenId];
        uint256 universityId = cert.universityId;
        
        if (universityId != 0) {
            require(
                msg.sender == universities[universityId].admin || 
                msg.sender == owner() || 
                universityMinters[universityId][msg.sender],
                "Not authorized"
            );
        } else {
            require(msg.sender == owner() || minters[msg.sender], "Not authorized");
        }
        
        address student = cert.student;
        string memory registrationNumber = cert.registrationNumber;
        
        _burn(tokenId);
        delete certificates[tokenId];
        delete studentToTokenId[student];
        delete tokenToTokenId[token];
        registrationNumberUsed[registrationNumber] = false;
        delete certificateIssuer[tokenId];
        
        if (universityId != 0) {
            universities[universityId].certCount--;
        }
        
        emit CertificateBurned(universityId, student, tokenId, token);
    }

    // ============ QUERIES ============
    
    function getCertificateByToken(string memory token) external view returns (Certificate memory) {
        uint256 tokenId = tokenToTokenId[token];
        require(tokenId != 0, "No certificate for this token");
        return certificates[tokenId];
    }

    function getCertificate(address student) external view returns (Certificate memory) {
        uint256 tokenId = studentToTokenId[student];
        require(tokenId != 0, "No certificate for this student");
        return certificates[tokenId];
    }

    function isValidCertificate(string memory token) external view returns (bool) {
        uint256 tokenId = tokenToTokenId[token];
        if (tokenId == 0) return false;
        
        Certificate memory cert = certificates[tokenId];
        uint256 universityId = cert.universityId;
        address issuer = certificateIssuer[tokenId];
        
        if (universityId != 0) {
            return universities[universityId].isActive && 
                   (issuer == universities[universityId].admin || 
                    issuer == owner() || 
                    universityMinters[universityId][issuer]);
        } else {
            return issuer == owner() || minters[issuer];
        }
    }

    function getUniversity(uint256 universityId) external view returns (University memory) {
        return universities[universityId];
    }

    function getUniversityByName(string memory name) external view returns (University memory) {
        uint256 universityId = universityNameToId[name];
        return universities[universityId];
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
