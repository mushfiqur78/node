/**
 * Enquiry Controller
 * Public: submit enquiry (no auth required)
 * Admin: list, mark read, delete
 */

const Enquiry  = require('../models/Enquiry');
const Property = require('../models/Property');

// POST /api/enquiries — public
exports.submitEnquiry = async (req, res) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const enquiry = await Enquiry.create({ property: propertyId, name, email, phone, message });

    // In-app notification
    try {
      const { notifyNewEnquiry } = require('../services/notificationService');
      await notifyNewEnquiry({ enquiry, property });
    } catch {}

    // Send email notification to admin
    try {
      const GeneralSetting = require('../models/GeneralSetting');
      const settings = await GeneralSetting.findOne();
      if (settings?.email) {
        const { sendEnquiryNotification } = require('../services/emailService');
        await sendEnquiryNotification({ adminEmail: settings.email, enquiry, property });
      }
    } catch (emailErr) {
      console.error('[Email] Enquiry notification failed:', emailErr.message);
    }

    res.status(201).json({ success: true, message: 'Enquiry submitted successfully', data: { enquiry } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// POST /api/enquiries/general — contact page (no propertyId required)
exports.submitGeneralEnquiry = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required' });
    }

    const enquiry = await Enquiry.create({ name, email, phone, message });

    try {
      const GeneralSetting = require('../models/GeneralSetting');
      const settings = await GeneralSetting.findOne();
      if (settings?.email) {
        const { sendEnquiryNotification } = require('../services/emailService');
        await sendEnquiryNotification({ adminEmail: settings.email, enquiry, property: null });
      }
    } catch {}

    res.status(201).json({ success: true, message: 'Message sent successfully', data: { enquiry } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/admin/enquiries — admin only
exports.getEnquiries = async (req, res) => {
  try {
    const { isRead, page = 1, limit = 10, startDate, endDate } = req.query;

    const filter = {};
    if (isRead !== undefined && isRead !== '') filter.isRead = isRead === 'true';

    // Date range filtering
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add 23:59:59 to include the entire end date
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Enquiry.countDocuments(filter);

    const enquiries = await Enquiry.find(filter)
      .populate('property', 'title featuredImage propertyId')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Enquiries fetched',
      data: { enquiries, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/enquiries/:id/read — mark as read
exports.markRead = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });

    res.json({ success: true, message: 'Marked as read', data: { enquiry } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// DELETE /api/admin/enquiries/:id
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });

    res.json({ success: true, message: 'Enquiry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/admin/stats — dashboard stats
exports.getStats = async (req, res) => {
  try {
    const User     = require('../models/User');
    const Property = require('../models/Property');

    const [
      totalUsers,
      totalOwners,
      pendingAgents,
      totalProperties,
      pendingProperties,
      approvedProperties,
      rejectedProperties,
      marketplaceProperties,
      adminProperties,
      unreadEnquiries,
      totalEnquiries,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'super_admin' } }),
      User.countDocuments({ role: 'owner' }),
      User.countDocuments({ isApproved: false }),  // any role pending approval (future-proof)
      Property.countDocuments(),
      Property.countDocuments({ status: 'pending' }),
      Property.countDocuments({ status: 'approved' }),
      Property.countDocuments({ status: 'rejected' }),
      Property.countDocuments({ source: 'marketplace' }),
      Property.countDocuments({ source: 'admin' }),
      Enquiry.countDocuments({ isRead: false }),
      Enquiry.countDocuments(),
    ]);

    // Top viewed properties
    const topViewed = await Property.find({ status: 'approved' })
      .select('title propertyId viewCount featuredImage')
      .sort({ viewCount: -1 })
      .limit(5);

    res.json({
      success: true,
      message: 'Stats fetched',
      data: {
        users:      { total: totalUsers, owners: totalOwners, pendingAgents },
        properties: { total: totalProperties, pending: pendingProperties, approved: approvedProperties, rejected: rejectedProperties, marketplace: marketplaceProperties, admin: adminProperties },
        enquiries:  { total: totalEnquiries, unread: unreadEnquiries },
        topViewed,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/admin/enquiries/export — export enquiries to CSV
exports.exportEnquiries = async (req, res) => {
  try {
    const { isRead, startDate, endDate } = req.query;

    const filter = {};
    if (isRead !== undefined && isRead !== '') filter.isRead = isRead === 'true';

    // Date range filtering
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }

    const enquiries = await Enquiry.find(filter)
      .populate('property', 'title propertyId')
      .sort({ createdAt: -1 });

    // Generate CSV content
    const csvHeaders = ['ID', 'Date', 'Property ID', 'Property Title', 'Name', 'Email', 'Phone', 'Message', 'Status'];
    const csvRows = enquiries.map(enq => {
      const date = new Date(enq.createdAt).toLocaleString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const propertyId = enq.property?.propertyId || 'N/A';
      const propertyTitle = enq.property?.title || 'General Enquiry';
      const status = enq.isRead ? 'Read' : 'Unread';
      
      // Escape CSV values (handle commas and quotes)
      const escape = (val) => {
        if (!val) return '';
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
      };

      return [
        escape(enq._id),
        escape(date),
        escape(propertyId),
        escape(propertyTitle),
        escape(enq.name),
        escape(enq.email),
        escape(enq.phone || ''),
        escape(enq.message),
        escape(status)
      ].join(',');
    });

    const csv = [csvHeaders.join(','), ...csvRows].join('\n');

    // Set headers for file download
    const filename = `enquiries_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Export failed', error: error.message });
  }
};
