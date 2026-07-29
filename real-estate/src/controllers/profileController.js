/**
 * Public Profile Controller
 * Agent/Owner public profile with their listed properties
 */

const User     = require('../models/User');
const Property = require('../models/Property');

// ─── GET /api/profiles/:id ────────────────────────────────────────
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email phone avatar role agentInfo createdAt');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Only owner profiles are public (super_admin excluded)
    if (user.role === 'super_admin') {
      return res.status(403).json({ success: false, message: 'Profile not available' });
    }

    // Get their approved properties
    const { page = 1, limit = 10 } = req.query;
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments({ owner: user._id, status: 'approved', source: 'marketplace' });

    const properties = await Property.find({ owner: user._id, status: 'approved', source: 'marketplace' })
      .populate('type',     'name')
      .populate('location', 'name city')
      .populate('purpose',  'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      message: 'Profile fetched',
      data: {
        user,
        properties,
        total,
        page:  Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/profiles — list all owners ─────────────────────────
exports.getAgents = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments({ role: 'owner', isActive: true });

    const owners = await User.find({ role: 'owner', isActive: true })
      .select('name email phone avatar extraInfo createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Add property count for each owner
    const ownersWithCount = await Promise.all(
      owners.map(async (owner) => {
        const propertyCount = await Property.countDocuments({
          owner: owner._id, status: 'approved', source: 'marketplace',
        });
        return { ...owner.toObject(), propertyCount };
      })
    );

    res.json({
      success: true,
      message: 'Owners fetched',
      data: { owners: ownersWithCount, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
