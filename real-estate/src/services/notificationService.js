/**
 * Notification Service
 * Creates in-app notifications for admin dashboard
 * Called from controllers when events occur
 */

const Notification = require('../models/Notification');

const create = async ({ type, title, message, link, property, user, enquiry }) => {
  try {
    await Notification.create({ type, title, message, link, property, user, enquiry });
  } catch (err) {
    console.error('[Notification] Failed to create:', err.message);
  }
};

// ── Notification creators ─────────────────────────────────────────

exports.notifyNewEnquiry = async ({ enquiry, property }) => {
  await create({
    type:    'new_enquiry',
    title:   'New Enquiry',
    message: `${enquiry.name} sent an enquiry on "${property.title}"`,
    link:    '/dashboard/enquiries',
    enquiry: enquiry._id,
    property: property._id,
  });
};

exports.notifyPropertySubmitted = async ({ property, owner }) => {
  await create({
    type:    'property_submitted',
    title:   'New Property Submitted',
    message: `${owner.name} submitted "${property.title}" for review`,
    link:    `/dashboard/properties`,
    property: property._id,
    user:    owner._id,
  });
};

exports.notifyPropertyApproved = async ({ property }) => {
  await create({
    type:    'property_approved',
    title:   'Property Approved',
    message: `"${property.title}" has been approved`,
    link:    `/dashboard/properties`,
    property: property._id,
  });
};

exports.notifyPropertyRejected = async ({ property }) => {
  await create({
    type:    'property_rejected',
    title:   'Property Rejected',
    message: `"${property.title}" has been rejected`,
    link:    `/dashboard/properties`,
    property: property._id,
  });
};

exports.notifyNewUser = async ({ user }) => {
  await create({
    type:    'new_user',
    title:   'New User Registered',
    message: `${user.name} (${user.role}) just registered`,
    link:    '/dashboard/users',
    user:    user._id,
  });
};
