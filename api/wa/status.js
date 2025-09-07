
const { allowCors, fwd } = require("./_common");

module.exports = allowCors(async function handler(req, res) {
  const r = await fwd("/api/wa/status", req);
  res.status(r.status).send(r.data);
});
