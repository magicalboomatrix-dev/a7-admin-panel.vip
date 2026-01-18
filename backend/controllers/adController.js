const Ad = require("../models/Ad");

// =========================
// GET ADS
// =========================
const getAds = async (req, res) => {
  try {
    const { position } = req.query;
    const query = position ? { position } : {};

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
    const ads = req.body; // [{ _id?, content, position, order }]

    const bulkOps = ads.map(ad => {
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
          },
        },
      };
    });

    if (bulkOps.length) {
      await Ad.bulkWrite(bulkOps);
    }

    // Return fresh data
    const positions = [...new Set(ads.map(a => a.position))];
    const updatedAds = await Ad.find({ position: { $in: positions } })
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
    const updated = await Ad.findByIdAndUpdate(
      req.params.id,
      {
        content: req.body.content,
        position: req.body.position,
        order: req.body.order,
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
