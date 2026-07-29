/**
 * Notification Controller
 * Admin only: list, mark read, mark all read, delete, unread count
 */

const Notification = require('../models/Notification');

// GET /api/v1/admin/notifications
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    const filter = {};
    if (isRead !== undefined && isRead !== '') filter.isRead = isRead === 'true';

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Notification.countDocuments(filter);
    const unread = await Notification.countDocuments({ isRead: false });

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('property', 'title propertyId')
      .populate('user',     'name email')
      .populate('enquiry',  'name email');

    res.json({
      success: true,
      message: 'Notifications fetched',
      data: { notifications, total, unread, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/v1/admin/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ isRead: false });
    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PUT /api/v1/admin/notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PUT /api/v1/admin/notifications/mark-all-read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// DELETE /api/v1/admin/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// DELETE /api/v1/admin/notifications/clear-all
exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ isRead: true });
    res.json({ success: true, message: 'Read notifications cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
