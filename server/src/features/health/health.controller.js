export function getHealth(_req, res) {
  res.json({ data: { ok: true, ts: Date.now() } });
}
