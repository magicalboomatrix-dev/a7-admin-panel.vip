const Ad = require("../models/Ad");

// =========================
// GET ADS
// =========================
const getAds = async (req, res) => {
  try {
    const { position, site } = req.query;
    const query = {};
    if (position) query.position = position;

    if (site) {
      // Prefer exact site; include legacy ads with no site to avoid breaking old data
      query.site = { $in: [site.toLowerCase(), null, ""] };
    }

    const ads = await Ad.find(query).sort({ position: 1, order: 1 });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// =========================
// SAVE / UPDATE ADS (UPSERT STYLE)
// =========================
const saveAds = async (req, res) => {
  try {
    // Accept either raw array body or { ads: [...] }
    const body = Array.isArray(req.body) ? req.body : req.body.ads || [];
    const siteFromReq = (req.query.site || req.body.site || "").toLowerCase();
    const ads = body; // [{ _id?, content, position, order, site? }]

    const bulkOps = ads.map(ad => {
      const site = (ad.site || siteFromReq || "a7satta.vip").toLowerCase();

      if (ad._id) {
        // UPDATE existing ad
        return {
          updateOne: {
            filter: { _id: ad._id },
            update: {
              $set: {
                content: ad.content,
                position: ad.position,
                order: ad.order || 0,
                site,
              },
            },
          },
        };
      }

      // INSERT new ad
      return {
        insertOne: {
          document: {
            content: ad.content,
            position: ad.position,
            order: ad.order || 0,
            site,
          },
        },
      };
    });

    if (bulkOps.length) {
      await Ad.bulkWrite(bulkOps);
    }

    // Return fresh data scoped to positions and site
    const positions = [...new Set(ads.map(a => a.position))];
    const siteFilter = siteFromReq
      ? { site: { $in: [siteFromReq, null, ""] } }
      : {};

    const updatedAds = await Ad.find({ position: { $in: positions }, ...siteFilter })
      .sort({ position: 1, order: 1 });

    res.json({
      success: true,
      ads: updatedAds,
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// =========================
// UPDATE SINGLE AD
// =========================
const updateAd = async (req, res) => {
  try {
    const site = (req.body.site || "a7satta.vip").toLowerCase();
    const updated = await Ad.findByIdAndUpdate(
      req.params.id,
      {
        content: req.body.content,
        position: req.body.position,
        order: req.body.order,
        site,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Ad not found",
      });
    }

    res.json({ success: true, ad: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// =========================
// DELETE ONE AD
// =========================
const deleteAd = async (req, res) => {
  try {
    const deleted = await Ad.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Ad not found",
      });
    }

    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getAds,
  saveAds,
  updateAd,
  deleteAd,
};
