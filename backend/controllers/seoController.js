const SEO = require("../models/SEO");

// Get SEO data for a page and site
exports.getSEO = async (req, res) => {
  try {
    const { page, site } = req.query;
    if (!page || !site) return res.status(400).json({ message: "Page and site are required" });
    const seo = await SEO.findOne({ page, site });
    res.json(seo || {});
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Set or update SEO data for a page and site
exports.setSEO = async (req, res) => {
  try {
    console.log("[SEO DEBUG] Incoming /seo/set body:", JSON.stringify(req.body, null, 2));
    const {
      site,
      page,
      metaTitle = "",
      metaDescription = "",
      canonical = "",
      focusKeywords = [],
      robots = "",
      author = "",
      publisher = ""
    } = req.body;
    if (!page || !site) return res.status(400).json({ message: "Page and site are required" });
    const seo = await SEO.findOneAndUpdate(
      { page, site },
      {
        metaTitle,
        metaDescription,
        canonical,
        focusKeywords,
        robots,
        author,
        publisher,
        updatedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(seo);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
