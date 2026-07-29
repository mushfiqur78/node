/**
 * Blog Controller
 * Public: list published, single post
 * Admin: full CRUD, draft/publish toggle
 */

const Blog = require('../models/Blog');
const { processAndSave, deleteImage } = require('../services/imageService');

// ─── GET /api/blogs — public (published only) ─────────────────────
exports.getBlogs = async (req, res) => {
  try {
    const { category, tag, search, page = 1, limit = 10 } = req.query;

    const filter = { status: 'published' };
    if (category) filter.category = category;
    if (tag)      filter.tags = tag;
    if (search)   filter.$or = [
      { title:   { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
    ];

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .select('-content')
      .populate('author', 'name avatar')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, message: 'Blogs fetched', data: { blogs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/blogs/:slug — public single post ────────────────────
exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'name avatar');
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    res.json({ success: true, message: 'Blog fetched', data: { blog } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/admin/blogs — admin list (all statuses) ────────────
exports.adminGetBlogs = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status)   filter.status = status;
    if (category) filter.category = category;
    if (search)   filter.$or = [
      { title:   { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
    ];

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .select('-content')
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, message: 'Blogs fetched', data: { blogs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/admin/blogs/:id — admin single ─────────────────────
exports.adminGetBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name');
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, message: 'Blog fetched', data: { blog } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── POST /api/admin/blogs ────────────────────────────────────────
exports.createBlog = async (req, res) => {
  try {
    const body = req.body;
    const data = { ...body, author: req.user._id };

    // Parse SEO & tags if JSON string
    if (data.seo  && typeof data.seo  === 'string') data.seo  = JSON.parse(data.seo);
    if (data.tags && typeof data.tags === 'string') data.tags = JSON.parse(data.tags);

    // Featured image upload
    if (req.file) {
      const meta  = body.featuredImageMeta ? JSON.parse(body.featuredImageMeta) : {};
      const media = await processAndSave(req.file, meta, req.user._id);
      data.featuredImage = { url: media.url, alt: media.alt, title: media.title };
    } else if (body.featuredImageUrl) {
      data.featuredImage = JSON.parse(body.featuredImageUrl);
    }

    const blog = await Blog.create(data);
    res.status(201).json({ success: true, message: 'Blog created', data: { blog } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/admin/blogs/:id ─────────────────────────────────────
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    const body    = req.body;
    const updates = { ...body };

    if (updates.seo  && typeof updates.seo  === 'string') updates.seo  = JSON.parse(updates.seo);
    if (updates.tags && typeof updates.tags === 'string') updates.tags = JSON.parse(updates.tags);

    // New featured image
    if (req.file) {
      deleteImage(blog.featuredImage?.url);
      const meta  = body.featuredImageMeta ? JSON.parse(body.featuredImageMeta) : {};
      const media = await processAndSave(req.file, meta, req.user._id);
      updates.featuredImage = { url: media.url, alt: media.alt, title: media.title };
    } else if (body.featuredImageUrl) {
      updates.featuredImage = JSON.parse(body.featuredImageUrl);
    }
    delete updates.featuredImageMeta;
    delete updates.featuredImageUrl;

    // Allow slug edit — ensure uniqueness
    if (updates.slug && updates.slug !== blog.slug) {
      const slugify = require('slugify');
      updates.slug  = slugify(updates.slug, { lower: true, strict: true });
      const exists  = await Blog.findOne({ slug: updates.slug, _id: { $ne: req.params.id } });
      if (exists) return res.status(400).json({ success: false, message: 'Slug already in use' });
    }

    const updated = await Blog.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, message: 'Blog updated', data: { blog: updated } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/admin/blogs/:id/toggle-status ───────────────────────
exports.toggleStatus = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    blog.status = blog.status === 'published' ? 'draft' : 'published';
    await blog.save();

    res.json({ success: true, message: `Blog ${blog.status}`, data: { blog } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/admin/blogs/:id ──────────────────────────────────
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    deleteImage(blog.featuredImage?.url);
    await blog.deleteOne();

    res.json({ success: true, message: 'Blog deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
