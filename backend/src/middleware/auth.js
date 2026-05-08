/**
 * Simple ownership middleware for hackathon use.
 * Checks for owner_id in body or x-owner-id header.
 */
const requireOwner = (req, res, next) => {
  const owner_id = req.body.owner_id || req.headers['x-owner-id'];
  if (!owner_id) {
    return res.status(401).json({ error: 'owner_id required', success: false });
  }
  req.owner_id = owner_id;
  next();
};

module.exports = { requireOwner };
