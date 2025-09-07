
const allowCors = (handler) => async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  return handler(req, res);
};

function getBase() {
  return process.env.WA_BASE || "https://pixelup-wa-server.pixelupmrkt.repl.co";
}

async function fwd(path, req) {
  const url = getBase() + path;
  const init = { method: req.method };
  if (req.method === "POST") {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(req.body || {});
  }
  const r = await fetch(url, init);
  const isJson = (r.headers.get("content-type") || "").includes("application/json");
  const data = isJson ? await r.json() : await r.text();
  return { status: r.status, data };
}

module.exports = { allowCors, fwd };
