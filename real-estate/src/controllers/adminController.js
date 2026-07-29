/**
 * Admin Controller - User Management
 * All routes require super_admin role
 * List, approve, change role, ban/unban, delete users
 */

const User = require('../models/User');

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { role, isApproved, isActive, page = 1, limit = 10, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isApproved !== undefined && isApproved !== '') filter.isApproved = isApproved === 'true';
    if (isActive !== undefined && isActive !== '')     filter.isActive = isActive === 'true';
    // Search by name or email
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).select('-password').skip(skip).limit(Number(limit));

    res.json({
      success: true,
      message: 'Users fetched',
      data: { users, total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/users/:id/approve
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'super_admin') {
      return res.status(400).json({ success: false, message: 'Cannot approve a super_admin account' });
    }

    user.isApproved = true;
    await user.save();

    // Send approval email
    try {
      const { sendAgentApprovalEmail } = require('../services/emailService');
      await sendAgentApprovalEmail({ agentEmail: user.email, agentName: user.name });
    } catch (emailErr) {
      console.error('[Email] Approval email failed:', emailErr.message);
    }

    res.json({ success: true, message: 'User approved successfully', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/users/:id/role
exports.changeRole = async (req, res) => {
  try {
    const { role } = req.body;
    const User = require('../models/User');

    // Only allow roles from the User model enum (excluding super_admin)
    const allowedRoles = User.schema.path('role').enumValues.filter(r => r !== 'super_admin');

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role. Allowed: ${allowedRoles.join(', ')}` });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'Role updated', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/users/:id/toggle-active
exports.toggleActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'super_admin') {
      return res.status(400).json({ success: false, message: 'Cannot ban a super_admin account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `Account ${user.isActive ? 'unbanned' : 'banned'} successfully`,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'super_admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete a super_admin account' });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
