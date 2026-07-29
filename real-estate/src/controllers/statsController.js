/**
 * Stats Controller
 * Provides site statistics for frontend display
 */

const Property = require('../models/Property');
const User = require('../models/User');

// ─── GET /api/stats/site ──────────────────────────────────────────
exports.getSiteStats = async (req, res) => {
  try {
    // Count approved properties
    const totalProperties = await Property.countDocuments({ 
      status: 'approved' 
    });

    // Count properties by purpose
    const Purpose = require('../models/Purpose');
    const purposes = await Purpose.find();
    
    const propertiesByPurpose = {};
    for (const purpose of purposes) {
      const count = await Property.countDocuments({ 
        status: 'approved',
        purpose: purpose._id 
      });
      propertiesByPurpose[purpose.name.toLowerCase()] = count;
    }

    // Count verified properties
    const verifiedProperties = await Property.countDocuments({ 
      status: 'approved',
      'adminFlags.isVerified': true 
    });

    // Count active users (owners)
    const activeUsers = await User.countDocuments({ 
      role: 'owner',
      isActive: true 
    });

    // Trust indicators (can be made configurable via admin panel)
    const trustIndicators = [
      {
        id: 1,
        icon: 'check-circle',
        text: `Verified ${totalProperties}+ Listings`,
        color: 'green',
        active: true
      },
      {
        id: 2,
        icon: 'shield',
        text: 'Professional Brokerage Support',
        color: 'blue',
        active: true
      }
    ];

    // Live indicators (shown below search box)
    const liveIndicators = [
      {
        id: 1,
        text: 'Live Property Updates',
        color: 'green',
        active: true
      },
      {
        id: 2,
        text: 'Instant Notifications',
        color: 'blue',
        active: true
      },
      {
        id: 3,
        text: 'Expert Guidance',
        color: 'yellow',
        active: true
      }
    ];

    res.json({
      success: true,
      message: 'Site stats fetched',
      data: {
        stats: {
          totalProperties,
          verifiedProperties,
          activeUsers,
          propertiesByPurpose
        },
        trustIndicators,
        liveIndicators
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};
