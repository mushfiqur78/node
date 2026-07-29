/**
 * Admin Routes - User Management + Property Management + Config (super_admin only)
 * All routes are protected at app.js level
 */

const express = require('express');
const router  = express.Router();

const { getUsers, approveUser, changeRole, toggleActive, deleteUser } = require('../controllers/adminController');
const { adminGetProperties, approveProperty, rejectProperty, adminDeleteProperty, updateFlags, adminGetProperty } = require('../controllers/adminPropertyController');
const { getAll, create, update, remove, toggleActive: toggleConfigActive } = require('../controllers/configController');
const { getEnquiries, markRead: markEnquiryRead, deleteEnquiry, getStats, exportEnquiries } = require('../controllers/enquiryController');
const { getMedia, uploadMedia, updateMedia, deleteMedia } = require('../controllers/mediaController');
const {
  getNotifications, getUnreadCount, markRead, markAllRead, deleteNotification, clearAll,
} = require('../controllers/notificationController');
const {
  getOverview, getViewsOverTime, getPopularLocations, getPopularTypes, getTopProperties, getPurposeBreakdown,
} = require('../controllers/analyticsController');
const {
  adminGetBlogs, adminGetBlog,
  createBlog, updateBlog, deleteBlog, toggleStatus,
} = require('../controllers/blogController');
const {
  adminGetMenus, adminGetTree,
  createMenu, updateMenu, deleteMenu, reorderMenus,
} = require('../controllers/menuController');
const { getAllSeo, upsertSeo, deleteSeo } = require('../controllers/seoController');
const { getSiteConfig, updateSiteConfig } = require('../controllers/siteConfigController');
const { getSettings, updateSettings, testEmail } = require('../controllers/generalSettingController');
const {
  adminGetTestimonials, createTestimonial, updateTestimonial,
  toggleTestimonial, reorderTestimonials, deleteTestimonial,
} = require('../controllers/testimonialController');
const {
  adminGetBanners, createBanner, updateBanner,
  toggleBanner, reorderBanners, setMode, deleteBanner,
} = require('../controllers/bannerController');
const {
  getExpiredProperties, getNearExpiryProperties,
  getExpirySummary, renewExpiry, removeExpiry, updateExpirySettings,
} = require('../controllers/expiryController');
const {
  getSettings: getAutoExpirySettings,
  updateSettings: updateAutoExpirySettings,
  previewExpiry, getAutoExpiryStats,
} = require('../controllers/autoExpiryController');
const {
  downloadTemplate, exportProperties, importProperties, getLogs, downloadErrorReport,
} = require('../controllers/importExportController');
const upload = require('../config/multer');

// ─── Referral System ──────────────────────────────────────────────
const {
  getDashboardStats: getReferralStats,
  getClicks: getReferralClicks,
} = require('../controllers/referralStatsController');
const { createReward, listRewards, approveReward, markPaid } = require('../controllers/rewardController');
const { createCoupon, updateCoupon, deleteCoupon, listCoupons } = require('../controllers/couponController');
const { listLeads } = require('../controllers/referralLeadController');

// ─── Import / Export ──────────────────────────────────────────────
router.get('/import-export/template/:format',       downloadTemplate);
router.post('/import-export/export',                exportProperties);
router.post('/import-export/import',                upload.single('file'), importProperties);
router.get('/import-export/logs',                   getLogs);
router.get('/import-export/logs/:id/errors',        downloadErrorReport);

// ─── Auto Expiry Settings ─────────────────────────────────────────
router.get('/auto-expiry/settings',  getAutoExpirySettings);
router.put('/auto-expiry/settings',  updateAutoExpirySettings);
router.get('/auto-expiry/preview',   previewExpiry);
router.get('/auto-expiry/stats',     getAutoExpiryStats);

// ─── Property Expiry Management ───────────────────────────────────
router.get('/expiry/summary',          getExpirySummary);
router.get('/expiry/expired',          getExpiredProperties);
router.get('/expiry/near-expiry',      getNearExpiryProperties);
router.put('/expiry/settings',         updateExpirySettings);
router.put('/expiry/:id/renew',        renewExpiry);
router.delete('/expiry/:id',           removeExpiry);

// ─── Stats ────────────────────────────────────────────────────────
router.get('/stats', getStats);

// ─── Media Library ────────────────────────────────────────────────
router.get('/media',          getMedia);
router.post('/media/upload',  upload.single('image'), uploadMedia);
router.put('/media/:id',      updateMedia);
router.delete('/media/:id',   deleteMedia);

// ─── User Management ──────────────────────────────────────────────
router.get('/users',                   getUsers);
router.put('/users/:id/approve',       approveUser);
router.put('/users/:id/role',          changeRole);
router.put('/users/:id/toggle-active', toggleActive);
router.delete('/users/:id',            deleteUser);

// ─── Property Management ──────────────────────────────────────────
router.get('/properties',                    adminGetProperties);
router.get('/properties/:id',                adminGetProperty);
router.put('/properties/:id/approve',        approveProperty);
router.put('/properties/:id/reject',         rejectProperty);
router.put('/properties/:id/flags',          updateFlags);
router.delete('/properties/:id',             adminDeleteProperty);

// ─── Enquiries ────────────────────────────────────────────────────
router.get('/enquiries',              getEnquiries);
router.get('/enquiries/export',       exportEnquiries);
router.put('/enquiries/:id/read',     markEnquiryRead);
router.delete('/enquiries/:id',       deleteEnquiry);

// ─── Notifications ────────────────────────────────────────────────
router.get('/notifications',                  getNotifications);
router.get('/notifications/unread-count',     getUnreadCount);
router.put('/notifications/mark-all-read',    markAllRead);
router.put('/notifications/:id/read',         markRead);
router.delete('/notifications/clear-all',     clearAll);
router.delete('/notifications/:id',           deleteNotification);

// ─── Analytics ────────────────────────────────────────────────────
router.get('/analytics/overview',             getOverview);
router.get('/analytics/views-over-time',      getViewsOverTime);
router.get('/analytics/popular-locations',    getPopularLocations);
router.get('/analytics/popular-types',        getPopularTypes);
router.get('/analytics/top-properties',       getTopProperties);
router.get('/analytics/purpose-breakdown',    getPurposeBreakdown);

// ─── Testimonials ─────────────────────────────────────────────────
router.get('/testimonials',                    adminGetTestimonials);
router.post('/testimonials',                   upload.single('avatar'), createTestimonial);
router.put('/testimonials/reorder',            reorderTestimonials);
router.put('/testimonials/:id',                upload.single('avatar'), updateTestimonial);
router.patch('/testimonials/:id/toggle',       toggleTestimonial);
router.delete('/testimonials/:id',             deleteTestimonial);

// ─── Banners / Sliders ────────────────────────────────────────────
router.get('/banners',                         adminGetBanners);
router.post('/banners',                        upload.single('image'), createBanner);
router.put('/banners/reorder',                 reorderBanners);
router.put('/banners/mode',                    setMode);
router.put('/banners/:id',                     upload.single('image'), updateBanner);
router.patch('/banners/:id/toggle',            toggleBanner);
router.delete('/banners/:id',                  deleteBanner);

// ─── General Settings ─────────────────────────────────────────────
router.get('/settings',       getSettings);
router.put('/settings',       upload.fields([{ name: 'siteLogo', maxCount: 1 }, { name: 'favicon', maxCount: 1 }]), updateSettings);
router.post('/settings/test-email', testEmail);

// ─── SEO Settings ─────────────────────────────────────────────────
router.get('/seo',            getAllSeo);
router.post('/seo',           upsertSeo);
router.delete('/seo/:id',     deleteSeo);

// ─── Site Config ──────────────────────────────────────────────────
router.get('/site-config',    getSiteConfig);
router.put('/site-config',    updateSiteConfig);

// ─── Menu Management ──────────────────────────────────────────────
router.get('/menus',          adminGetMenus);
router.get('/menus/tree',     adminGetTree);
router.post('/menus',         createMenu);
router.put('/menus/reorder',  reorderMenus);
router.put('/menus/:id',      updateMenu);
router.delete('/menus/:id',   deleteMenu);

// ─── Blog Management ──────────────────────────────────────────────
router.get('/blogs',                    adminGetBlogs);
router.get('/blogs/:id',                adminGetBlog);
router.post('/blogs',                   upload.single('featuredImage'), createBlog);
router.put('/blogs/:id',                upload.single('featuredImage'), updateBlog);
router.put('/blogs/:id/toggle-status',  toggleStatus);
router.delete('/blogs/:id',             deleteBlog);

// ─── About Page ───────────────────────────────────────────────────
const aboutCtrl = require('../controllers/aboutPageController');
router.get('/about',                    aboutCtrl.adminGetAboutPage);
router.put('/about',                    aboutCtrl.updateAboutPage);
router.post('/about/upload-image',      upload.single('image'), aboutCtrl.uploadImage);

// ─── Contact Page ─────────────────────────────────────────────────
const contactCtrl = require('../controllers/contactPageController');
router.get('/contact-page',  contactCtrl.adminGet);
router.put('/contact-page',  contactCtrl.adminUpdate);

// ─── Subscribers ──────────────────────────────────────────────────
const subCtrl = require('../controllers/subscriberController');
router.get('/subscribers',              subCtrl.getSubscribers);
router.get('/subscribers/export',       subCtrl.exportSubscribers);
router.delete('/subscribers/:id',       subCtrl.deleteSubscriber);
router.patch('/subscribers/:id/toggle', subCtrl.toggleSubscriber);

// ─── Config ───────────────────────────────────────────────────────
router.get('/config/:resource',              getAll);
router.post('/config/:resource',             create);
router.put('/config/:resource/:id',          update);
router.delete('/config/:resource/:id',       remove);
router.patch('/config/:resource/:id/toggle', toggleConfigActive);

// ─── Referral Stats & Clicks ──────────────────────────────────────
router.get('/referral-stats',     getReferralStats);
router.get('/referral-clicks',    getReferralClicks);
router.get('/referral-analytics', require('../controllers/referralStatsController').getAnalytics);

// ─── Rewards ──────────────────────────────────────────────────────
router.get('/rewards',                listRewards);
router.post('/rewards',               createReward);
router.patch('/rewards/:id/approve',  approveReward);
router.patch('/rewards/:id/paid',     markPaid);
router.patch('/rewards/:id/cancel',   require('../controllers/rewardController').cancelReward);

// ─── Coupons ──────────────────────────────────────────────────────
router.get('/coupons',      listCoupons);
router.post('/coupons',     createCoupon);
router.put('/coupons/:id',  updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// ─── Referral Leads ───────────────────────────────────────────────
router.get('/referral-leads',         listLeads);
router.patch('/referral-leads/:id',   require('../controllers/referralLeadController').updateLeadStatus);
router.delete('/referral-leads/:id',  require('../controllers/referralLeadController').deleteLead);

module.exports = router;
