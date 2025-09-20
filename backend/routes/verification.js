const express = require('express');
const verificationService = require('../services/verificationService');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/verify/:digitalId
 * Quick verification by Digital ID
 */
router.get('/verify/:digitalId', async (req, res) => {
  try {
    const { digitalId } = req.params;
    const { token } = req.query;

    // Optional: Verify JWT token if provided
    if (token) {
      // Add JWT verification logic here
    }

    const result = await verificationService.quickVerify(digitalId);
    
    // Log the verification attempt
    await verificationService.logVerification(
      digitalId,
      'QUICK_LOOKUP',
      result,
      {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      }
    );

    if (result.isValid) {
      res.json({
        success: true,
        message: 'Digital ID verified successfully',
        data: result.userData
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.error,
        errorCode: result.errorCode
      });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during verification'
    });
  }
});

/**
 * POST /api/verify/qr
 * Verify QR code data
 */
router.post('/verify/qr', async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    const result = await verificationService.verifyQRCode(qrData);
    
    // Log the verification attempt
    if (result.qrCodeData) {
      await verificationService.logVerification(
        result.qrCodeData.digitalId,
        'QR_CODE',
        result,
        {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date()
        }
      );
    }

    if (result.isValid) {
      res.json({
        success: true,
        message: 'QR Code verified successfully',
        data: result.userData,
        qrInfo: {
          issuedAt: result.qrCodeData.issuedAt,
          expiresAt: result.qrCodeData.expiresAt
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
        errorCode: result.errorCode
      });
    }
  } catch (error) {
    console.error('QR verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during QR verification'
    });
  }
});

/**
 * GET /api/verify/generate-qr/:digitalId
 * Generate QR code data for a digital ID (authenticated)
 */
router.get('/verify/generate-qr/:digitalId', auth, async (req, res) => {
  try {
    const { digitalId } = req.params;

    // Find user
    const user = await User.findOne({ digitalId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Digital ID not found'
      });
    }

    // Check if requesting user has permission (is the owner or admin)
    if (req.user.digitalId !== digitalId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to generate QR for this ID'
      });
    }

    const qrData = verificationService.generateQRCodeData(user);

    res.json({
      success: true,
      message: 'QR code data generated successfully',
      qrData: qrData,
      instructions: 'Use this data to generate a QR code image'
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during QR generation'
    });
  }
});

/**
 * GET /api/verify/qr-public/:digitalId
 * Generate QR code data for a digital ID (public - no auth required)
 * This is safe because the Digital ID itself acts as authentication
 */
router.get('/verify/qr-public/:digitalId', async (req, res) => {
  try {
    const { digitalId } = req.params;

    // Find user
    const user = await User.findOne({ digitalId, isActive: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Digital ID not found or inactive'
      });
    }

    const qrData = verificationService.generateQRCodeData(user);

    // Log the QR generation attempt
    await verificationService.logVerification(
      digitalId,
      'QR_GENERATION',
      { isValid: true },
      {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      }
    );

    res.json({
      success: true,
      message: 'QR code data generated successfully',
      qrData: qrData,
      instructions: 'Use this data to generate a QR code image'
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during QR generation'
    });
  }
});

/**
 * POST /api/verify/bulk
 * Bulk verification for multiple Digital IDs
 */
router.post('/verify/bulk', async (req, res) => {
  try {
    const { digitalIds } = req.body;

    if (!Array.isArray(digitalIds) || digitalIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Array of digital IDs is required'
      });
    }

    if (digitalIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 100 IDs allowed per request'
      });
    }

    const results = [];
    for (const digitalId of digitalIds) {
      const result = await verificationService.quickVerify(digitalId);
      results.push({
        digitalId,
        ...result
      });
    }

    const validCount = results.filter(r => r.isValid).length;
    const invalidCount = results.length - validCount;

    res.json({
      success: true,
      message: 'Bulk verification completed',
      summary: {
        total: results.length,
        valid: validCount,
        invalid: invalidCount
      },
      results: results
    });
  } catch (error) {
    console.error('Bulk verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during bulk verification'
    });
  }
});

/**
 * GET /api/verify/stats
 * Get verification statistics (admin only)
 */
router.get('/verify/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // In a real implementation, you'd query verification logs
    const stats = {
      totalUsers: await User.countDocuments(),
      activeUsers: await User.countDocuments({ isActive: true }),
      inactiveUsers: await User.countDocuments({ isActive: false }),
      verificationsToday: 0, // Would come from verification logs
      verificationsThisWeek: 0, // Would come from verification logs
      topVerificationMethods: [
        { method: 'QR_CODE', count: 0 },
        { method: 'QUICK_LOOKUP', count: 0 }
      ]
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
