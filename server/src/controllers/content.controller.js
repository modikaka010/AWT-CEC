const News = require('../models/News');
const Scheme = require('../models/Scheme');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ═════════════════════════════════════════════════════════════════════════════
// NEWS MANAGEMENT
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/content/news?status=published&category=Crop Science&page=1&limit=20
const getNews = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ title: regex }, { description: regex }, { summary: regex }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [news, total] = await Promise.all([
      News.find(filter)
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name')
        .select('-__v')
        .sort({ publishedDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      News.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'News fetched.', {
      news,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getNews error:', err);
    return sendError(res, 500, 'Failed to fetch news.');
  }
};

// GET /api/content/news/:id
const getNewsById = async (req, res) => {
  try {
    const item = await News.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .select('-__v')
      .lean();
    if (!item) return sendError(res, 404, 'News article not found.');
    return sendSuccess(res, 200, 'News fetched.', { news: item });
  } catch (err) {
    console.error('getNewsById error:', err);
    return sendError(res, 500, 'Failed to fetch news.');
  }
};

// POST /api/content/news
const createNews = async (req, res) => {
  try {
    const { title, category, description, summary, image, source, sourceUrl, publishedDate, status } = req.body;

    if (!title || !category || !description) {
      return sendError(res, 400, 'Title, category and description are required.');
    }

    const item = await News.create({
      title: title.trim(),
      category,
      description: description.trim(),
      summary: summary ? summary.trim() : '',
      image: image || null,
      source: source ? source.trim() : 'Avelia',
      sourceUrl: sourceUrl || null,
      publishedDate: publishedDate ? new Date(publishedDate) : new Date(),
      status: status || 'draft',
      createdBy: req.user.id,
    });

    return sendSuccess(res, 201, 'News article created.', { news: item });
  } catch (err) {
    console.error('createNews error:', err);
    return sendError(res, 500, 'Failed to create news.');
  }
};

// PATCH /api/content/news/:id
const updateNews = async (req, res) => {
  try {
    const { title, category, description, summary, image, source, sourceUrl, publishedDate, status } = req.body;

    const item = await News.findById(req.params.id);
    if (!item) return sendError(res, 404, 'News article not found.');

    if (title) item.title = title.trim();
    if (category) item.category = category;
    if (description) item.description = description.trim();
    if (summary !== undefined) item.summary = summary.trim();
    if (image !== undefined) item.image = image || null;
    if (source) item.source = source.trim();
    if (sourceUrl !== undefined) item.sourceUrl = sourceUrl || null;
    if (publishedDate) item.publishedDate = new Date(publishedDate);
    if (status) item.status = status;
    item.updatedBy = req.user.id;

    await item.save();

    return sendSuccess(res, 200, 'News article updated.', { news: item });
  } catch (err) {
    console.error('updateNews error:', err);
    return sendError(res, 500, 'Failed to update news.');
  }
};

// PATCH /api/content/news/:id/status
// Body: { status: 'draft' | 'published' | 'hidden' }
const updateNewsStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['draft', 'published', 'hidden'];
    if (!status || !allowed.includes(status)) {
      return sendError(res, 400, `Status must be one of: ${allowed.join(', ')}.`);
    }

    const item = await News.findByIdAndUpdate(
      req.params.id,
      { status, updatedBy: req.user.id },
      { new: true }
    );
    if (!item) return sendError(res, 404, 'News article not found.');

    return sendSuccess(res, 200, `News ${status}.`, { news: { _id: item._id, status: item.status } });
  } catch (err) {
    console.error('updateNewsStatus error:', err);
    return sendError(res, 500, 'Failed to update news status.');
  }
};

// DELETE /api/content/news/:id  (soft delete — just hide it)
const deleteNews = async (req, res) => {
  try {
    const item = await News.findByIdAndUpdate(
      req.params.id,
      { status: 'hidden', updatedBy: req.user.id },
      { new: true }
    );
    if (!item) return sendError(res, 404, 'News article not found.');
    return sendSuccess(res, 200, 'News article hidden.');
  } catch (err) {
    console.error('deleteNews error:', err);
    return sendError(res, 500, 'Failed to delete news.');
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// GOVERNMENT SCHEMES MANAGEMENT
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/content/schemes?status=published&category=Central&page=1&limit=20
const getSchemes = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { description: regex }, { eligibility: regex }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [schemes, total] = await Promise.all([
      Scheme.find(filter)
        .populate('createdBy', 'name')
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Scheme.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Schemes fetched.', {
      schemes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getSchemes error:', err);
    return sendError(res, 500, 'Failed to fetch schemes.');
  }
};

// GET /api/content/schemes/:id
const getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .select('-__v')
      .lean();
    if (!scheme) return sendError(res, 404, 'Scheme not found.');
    return sendSuccess(res, 200, 'Scheme fetched.', { scheme });
  } catch (err) {
    console.error('getSchemeById error:', err);
    return sendError(res, 500, 'Failed to fetch scheme.');
  }
};

// POST /api/content/schemes
const createScheme = async (req, res) => {
  try {
    const {
      name, description, eligibility, benefits, applicationInfo,
      officialLink, image, category, targetAudience, status,
    } = req.body;

    if (!name || !description) {
      return sendError(res, 400, 'Name and description are required.');
    }

    const scheme = await Scheme.create({
      name: name.trim(),
      description: description.trim(),
      eligibility: eligibility ? eligibility.trim() : '',
      benefits: benefits ? benefits.trim() : '',
      applicationInfo: applicationInfo ? applicationInfo.trim() : '',
      officialLink: officialLink || null,
      image: image || null,
      category: category || 'Central',
      targetAudience: targetAudience || ['farmer'],
      status: status || 'draft',
      createdBy: req.user.id,
    });

    return sendSuccess(res, 201, 'Scheme created.', { scheme });
  } catch (err) {
    console.error('createScheme error:', err);
    return sendError(res, 500, 'Failed to create scheme.');
  }
};

// PATCH /api/content/schemes/:id
const updateScheme = async (req, res) => {
  try {
    const {
      name, description, eligibility, benefits, applicationInfo,
      officialLink, image, category, targetAudience, status,
    } = req.body;

    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return sendError(res, 404, 'Scheme not found.');

    if (name) scheme.name = name.trim();
    if (description) scheme.description = description.trim();
    if (eligibility !== undefined) scheme.eligibility = eligibility.trim();
    if (benefits !== undefined) scheme.benefits = benefits.trim();
    if (applicationInfo !== undefined) scheme.applicationInfo = applicationInfo.trim();
    if (officialLink !== undefined) scheme.officialLink = officialLink || null;
    if (image !== undefined) scheme.image = image || null;
    if (category) scheme.category = category;
    if (targetAudience) scheme.targetAudience = targetAudience;
    if (status) scheme.status = status;
    scheme.updatedBy = req.user.id;

    await scheme.save();

    return sendSuccess(res, 200, 'Scheme updated.', { scheme });
  } catch (err) {
    console.error('updateScheme error:', err);
    return sendError(res, 500, 'Failed to update scheme.');
  }
};

// PATCH /api/content/schemes/:id/status
const updateSchemeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['draft', 'published', 'hidden'];
    if (!status || !allowed.includes(status)) {
      return sendError(res, 400, `Status must be one of: ${allowed.join(', ')}.`);
    }

    const scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      { status, updatedBy: req.user.id },
      { new: true }
    );
    if (!scheme) return sendError(res, 404, 'Scheme not found.');

    return sendSuccess(res, 200, `Scheme ${status}.`, { scheme: { _id: scheme._id, status: scheme.status } });
  } catch (err) {
    console.error('updateSchemeStatus error:', err);
    return sendError(res, 500, 'Failed to update scheme status.');
  }
};

// DELETE /api/content/schemes/:id (soft delete)
const deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      { status: 'hidden', updatedBy: req.user.id },
      { new: true }
    );
    if (!scheme) return sendError(res, 404, 'Scheme not found.');
    return sendSuccess(res, 200, 'Scheme hidden.');
  } catch (err) {
    console.error('deleteScheme error:', err);
    return sendError(res, 500, 'Failed to delete scheme.');
  }
};

module.exports = {
  getNews, getNewsById, createNews, updateNews, updateNewsStatus, deleteNews,
  getSchemes, getSchemeById, createScheme, updateScheme, updateSchemeStatus, deleteScheme,
};
