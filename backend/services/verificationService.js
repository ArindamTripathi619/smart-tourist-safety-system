const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class VerificationService {
  /**
   * Generate QR code data for digital ID verification
   */
  generateQRCodeData(user) {
    const timestamp = Date.now();
    const qrData = {
      digitalId: user.digitalId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      issuedAt: timestamp,
      expiresAt: timestamp + (24 * 60 * 60 * 1000), // Valid for 24 hours
      
      // Security features
      checksum: this.generateChecksum(user.digitalId, timestamp),
      signature: this.generateSignature(user.digitalId, timestamp),
      
      // Verification URL
      verifyUrl: `${process.env.API_BASE_URL}/api/verify/${user.digitalId}?token=${this.generateVerificationToken(user)}`
    };

    return JSON.stringify(qrData);
  }

  /**
   * Generate cryptographic checksum for tamper detection
   */
  generateChecksum(digitalId, timestamp) {
    const data = `${digitalId}-${timestamp}-${process.env.JWT_SECRET}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  /**
   * Generate digital signature for authenticity
   */
  generateSignature(digitalId, timestamp) {
    const data = `${digitalId}-${timestamp}`;
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    return crypto.createHmac('sha256', secret).update(data).digest('hex').substring(0, 32);
  }

  /**
   * Generate JWT token for secure verification
   */
  generateVerificationToken(user) {
    return jwt.sign(
      {
        digitalId: user.digitalId,
        userId: user._id,
        type: 'verification'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  /**
   * Verify QR code data authenticity
   */
  async verifyQRCode(qrCodeString) {
    try {
      const qrData = JSON.parse(qrCodeString);
      
      // Check expiration
      if (Date.now() > qrData.expiresAt) {
        return {
          isValid: false,
          error: 'QR Code has expired',
          errorCode: 'EXPIRED'
        };
      }

      // Verify checksum
      const expectedChecksum = this.generateChecksum(qrData.digitalId, qrData.issuedAt);
      if (qrData.checksum !== expectedChecksum) {
        return {
          isValid: false,
          error: 'QR Code has been tampered with',
          errorCode: 'TAMPERED'
        };
      }

      // Verify signature
      const expectedSignature = this.generateSignature(qrData.digitalId, qrData.issuedAt);
      if (qrData.signature !== expectedSignature) {
        return {
          isValid: false,
          error: 'Invalid digital signature',
          errorCode: 'INVALID_SIGNATURE'
        };
      }

      // Get latest user data from database
      const user = await User.findOne({ digitalId: qrData.digitalId });
      if (!user || !user.isActive) {
        return {
          isValid: false,
          error: 'Digital ID not found or inactive',
          errorCode: 'NOT_FOUND'
        };
      }

      // Return verification result
      return {
        isValid: true,
        userData: {
          digitalId: user.digitalId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          emergencyContacts: user.emergencyContacts,
          lastVerified: new Date(),
          verificationMethod: 'QR_CODE'
        },
        qrCodeData: qrData
      };

    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid QR Code format',
        errorCode: 'INVALID_FORMAT'
      };
    }
  }

  /**
   * Quick verification by Digital ID only
   */
  async quickVerify(digitalId) {
    try {
      const user = await User.findOne({ 
        digitalId: digitalId,
        isActive: true 
      });

      if (!user) {
        return {
          isValid: false,
          error: 'Digital ID not found',
          errorCode: 'NOT_FOUND'
        };
      }

      return {
        isValid: true,
        userData: {
          digitalId: user.digitalId,
          name: user.name,
          phone: user.phone,
          emergencyContact: user.emergencyContact,
          lastVerified: new Date(),
          verificationMethod: 'QUICK_LOOKUP'
        }
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Verification failed',
        errorCode: 'SYSTEM_ERROR'
      };
    }
  }

  /**
   * Advanced verification with biometric data (future enhancement)
   */
  async biometricVerify(digitalId, biometricHash) {
    // Placeholder for future biometric verification
    // Could integrate with Aadhaar API or other biometric systems
    return {
      isValid: false,
      error: 'Biometric verification not implemented',
      errorCode: 'NOT_IMPLEMENTED'
    };
  }

  /**
   * Cross-verify with government databases (future enhancement)
   */
  async governmentVerify(digitalId, aadhaarNumber, passportNumber) {
    // Placeholder for government database integration
    // Could verify against Aadhaar, Passport databases
    return {
      isValid: false,
      error: 'Government verification not implemented',
      errorCode: 'NOT_IMPLEMENTED'
    };
  }

  /**
   * Log verification attempt for audit trail
   */
  async logVerification(digitalId, verificationMethod, result, verifierInfo) {
    console.log('Verification Log:', {
      digitalId,
      method: verificationMethod,
      success: result.isValid,
      timestamp: new Date(),
      verifier: verifierInfo
    });
    
    // In production, save to audit log database
    // await VerificationLog.create({ ... });
  }
}

module.exports = new VerificationService();
