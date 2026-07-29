/**
 * Menu Controller
 * Public : GET tree (active only)
 * Admin  : full CRUD + reorder
 */

const Menu = require('../models/Menu');

// ── Helper: build nested tree from flat list ──────────────────────
const buildTree = (items, parentId = null) => {
  return items
    .filter(item => String(item.parentId || null) === String(parentId))
    .sort((a, b) => a.order - b.order)
    .map(item => ({
      ...item.toObject(),
      children: buildTree(items, item._id),
    }));
};

// ─── GET /api/menus — public (active only, nested tree) ───────────
exports.getMenus = async (req, res) => {
  try {
    const items = await Menu.find({ isActive: true }).sort({ order: 1 });
    const tree  = buildTree(items);

    res.json({ success: true, message: 'Menus fetched', data: { menus: tree } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/admin/menus — admin (all, flat list) ────────────────
exports.adminGetMenus = async (req, res) => {
  try {
    const items = await Menu.find()
      .populate('parentId', 'name')
      .sort({ order: 1 });

    res.json({ success: true, message: 'Menus fetched', data: { menus: items } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/admin/menus/tree — admin nested tree ────────────────
exports.adminGetTree = async (req, res) => {
  try {
    const items = await Menu.find().sort({ order: 1 });
    const tree  = buildTree(items);

    res.json({ success: true, message: 'Menu tree fetched', data: { menus: tree } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── POST /api/admin/menus ────────────────────────────────────────
exports.createMenu = async (req, res) => {
  try {
    const { name, url, target, parentId, order, icon, isActive } = req.body;

    // Prevent circular reference
    if (parentId) {
      const parent = await Menu.findById(parentId);
      if (!parent) return res.status(400).json({ success: false, message: 'Parent menu not found' });
    }

    const menu = await Menu.create({ name, url, target, parentId: parentId || null, order, icon, isActive });
    res.status(201).json({ success: true, message: 'Menu created', data: { menu } });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Slug already exists' });
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/admin/menus/:id ─────────────────────────────────────
exports.updateMenu = async (req, res) => {
  try {
    const { name, url, target, parentId, order, icon, isActive, slug } = req.body;

    // Prevent self-reference
    if (parentId && String(parentId) === String(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Menu cannot be its own parent' });
    }

    const menu = await Menu.findByIdAndUpdate(
      req.params.id,
      { name, url, target, parentId: parentId || null, order, icon, isActive, slug },
      { new: true }
    );
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });

    res.json({ success: true, message: 'Menu updated', data: { menu } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/admin/menus/reorder — bulk reorder ──────────────────
exports.reorderMenus = async (req, res) => {
  try {
    // Expects: [{ id, order }, ...]
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'items array required' });
    }

    await Promise.all(
      items.map(({ id, order }) => Menu.findByIdAndUpdate(id, { order }))
    );

    res.json({ success: true, message: 'Menus reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/admin/menus/:id ──────────────────────────────────
exports.deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });

    // Reassign children to grandparent (or null)
    await Menu.updateMany(
      { parentId: req.params.id },
      { parentId: menu.parentId || null }
    );

    await menu.deleteOne();
    res.json({ success: true, message: 'Menu deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
