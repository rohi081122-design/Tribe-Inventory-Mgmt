const Contact = require('../models/Contact');
const { cleanString, isValidObjectId } = require('../utils/validators');

const PENDING = { status: { $ne: 'resolved' } };
const RESOLVED = { status: 'resolved' };
const MAX_QUERIES = 300;

// How many queries are pending / resolved (for the tab numbers)
async function countQueries() {
  const [pending, resolved] = await Promise.all([Contact.countDocuments(PENDING), Contact.countDocuments(RESOLVED)]);
  return { pending, resolved, all: pending + resolved };
}

// Only the fields the team page needs, with old statuses shown as "pending"
function toQuery(contact) {
  return {
    _id: contact._id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone || '',
    subject: contact.subject,
    message: contact.message,
    status: contact.status === 'resolved' ? 'resolved' : 'pending',
    createdAt: contact.createdAt,
    resolvedAt: contact.resolvedAt,
  };
}

// @route  GET /api/admin/queries?status=pending|resolved|all&limit=   (newest first)
// limit is optional (e.g. 1 when the page only needs the numbers for the tab badge)
async function listQueries(req, res) {
  const status = ['pending', 'resolved', 'all'].includes(cleanString(req.query.status)) ? cleanString(req.query.status) : 'pending';
  const filter = status === 'resolved' ? RESOLVED : status === 'all' ? {} : PENDING;
  const limit = Math.min(MAX_QUERIES, Math.max(1, parseInt(cleanString(req.query.limit), 10) || MAX_QUERIES));

  const [contacts, counts] = await Promise.all([
    Contact.find(filter).sort({ createdAt: -1 }).limit(limit),
    countQueries(),
  ]);

  res.json({ success: true, status, queries: contacts.map(toQuery), counts });
}

// Changes the status of one query (resolve or open it again)
async function setQueryStatus(req, res, resolved) {
  if (!isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Query not found.' });
  }

  // Change it only if the status is different, so resolving twice (for example two team members
  // at the same moment) keeps the first "resolved" time
  const contact =
    (await Contact.findOneAndUpdate(
      { _id: req.params.id, ...(resolved ? PENDING : RESOLVED) },
      resolved ? { status: 'resolved', resolvedAt: new Date() } : { status: 'pending', resolvedAt: null },
      { returnDocument: 'after' }
    )) || (await Contact.findById(req.params.id));
  if (!contact) {
    return res.status(404).json({ success: false, message: 'Query not found.' });
  }

  res.json({
    success: true,
    message: resolved
      ? `The query from ${contact.name} was marked as resolved.`
      : `The query from ${contact.name} is pending again.`,
    query: toQuery(contact),
    counts: await countQueries(),
  });
}

// @route  PATCH /api/admin/queries/:id/resolve
function resolveQuery(req, res) {
  return setQueryStatus(req, res, true);
}

// @route  PATCH /api/admin/queries/:id/reopen   (in case a query was resolved by mistake)
function reopenQuery(req, res) {
  return setQueryStatus(req, res, false);
}

module.exports = { listQueries, resolveQuery, reopenQuery };
