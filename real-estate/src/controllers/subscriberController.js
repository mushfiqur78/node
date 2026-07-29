const Subscriber = require('../models/Subscriber');

// POST /api/v1/subscribers — public subscribe
exports.subscribe = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.name = name || existing.name;
        await existing.save();
        return res.json({ success: true, message: 'You have been re-subscribed!' });
      }
      return res.json({ success: true, message: 'You are already subscribed!' });
    }

    await Subscriber.create({ name, email });
    res.status(201).json({ success: true, message: 'Subscribed successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/v1/admin/subscribers — admin list
exports.getSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isActive, startDate, endDate } = req.query;
    const filter = {};
    if (isActive !== undefined && isActive !== '') filter.isActive = isActive === 'true';
    if (search) filter.email = { $regex: search, $options: 'i' };

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

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Subscriber.countDocuments(filter);
    const subscribers = await Subscriber.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, data: { subscribers, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// DELETE /api/v1/admin/subscribers/:id
exports.deleteSubscriber = async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PATCH /api/v1/admin/subscribers/:id/toggle
exports.toggleSubscriber = async (req, res) => {
  try {
    const sub = await Subscriber.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Not found' });
    sub.isActive = !sub.isActive;
    await sub.save();
    res.json({ success: true, data: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/v1/admin/subscribers/export — export subscribers to CSV
exports.exportSubscribers = async (req, res) => {
  try {
    const { search, isActive, startDate, endDate } = req.query;
    const filter = {};
    if (isActive !== undefined && isActive !== '') filter.isActive = isActive === 'true';
    if (search) filter.email = { $regex: search, $options: 'i' };

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

    const subscribers = await Subscriber.find(filter).sort({ createdAt: -1 });

    // Generate CSV content
    const csvHeaders = ['ID', 'Name', 'Email', 'Status', 'Source', 'Subscribed Date'];
    const csvRows = subscribers.map(sub => {
      const date = new Date(sub.createdAt).toLocaleString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const status = sub.isActive ? 'Active' : 'Inactive';
      
      // Escape CSV values (handle commas and quotes)
      const escape = (val) => {
        if (!val) return '';
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
      };

      return [
        escape(sub._id),
        escape(sub.name || ''),
        escape(sub.email),
        escape(status),
        escape(sub.source || 'newsletter'),
        escape(date)
      ].join(',');
    });

    const csv = [csvHeaders.join(','), ...csvRows].join('\n');

    // Set headers for file download
    const filename = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Export failed', error: error.message });
  }
};
