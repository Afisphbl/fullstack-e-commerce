"use strict";

const catchAsync = require("../utils/catchAsync");
const dashboardService = require("../services/dashboardService");

exports.getDashboardData = catchAsync(async (req, res) => {
  const data = await dashboardService.getDashboardStats();

  res.status(200).json({
    status: "success",
    data: { data },
  });
});
