const { Report } = require('../models');

exports.createReport = async (req, res) => {
  try {
    const { reporterId, reportedUserId, messageId, reason, description } = req.body;
    const report = await Report.create({
      reporterId,
      reportedUserId,
      messageId,
      reason,
      description
    });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const { status, reviewedBy } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, reviewedBy, reviewedAt: new Date() },
      { new: true }
    );
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
