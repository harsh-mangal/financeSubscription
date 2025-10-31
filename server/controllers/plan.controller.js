import Plan from "../models/Plan.js";

export async function listPlans(req, res) {
  const onlyActive = req.query.active === "true";
  const q = onlyActive ? { isActive: true } : {};
  const plans = await Plan.find(q).sort({ price: 1 });
  res.json({ items: plans });
}
export async function createPlan(req, res) {
  const plan = await Plan.create(req.body);
  res.json({ plan });
}
export async function updatePlan(req, res) {
  const { id } = req.params;
  const plan = await Plan.findByIdAndUpdate(id, req.body, { new: true });
  res.json({ plan });
}
export async function deletePlan(req, res) {
  const { id } = req.params;
  await Plan.findByIdAndDelete(id);
  res.json({ ok: true });
}
