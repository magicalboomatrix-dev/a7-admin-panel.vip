const Chart = require("../models/Chart");
const Game = require("../models/Game");

function createEmptyNumbers() {
  return Array.from({ length: 31 }, () => ({ value: "", declaredAt: null }));
}

function getMonthName(num) {
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return months[num - 1];
}

// 🇮🇳 IST time
function getISTNow() {
  const now = new Date();
  const istOffsetMinutes = 5.5 * 60;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const istMinutes = utcMinutes + istOffsetMinutes;

  const istDate = new Date(now);
  istDate.setUTCHours(0, istMinutes, 0, 0);
  return istDate;
}

function hasResultTimePassed(resultTime) {
  if (!resultTime) return true;

  const [hh, mm] = resultTime.split(":").map(Number);
  const nowIST = getISTNow();

  const resultDateTime = new Date(
    nowIST.getFullYear(),
    nowIST.getMonth(),
    nowIST.getDate(),
    hh,
    mm,
    0
  );

  return nowIST >= resultDateTime;
}

// ---------------------------------------
// Yearly chart up to today (IST AWARE)
// ---------------------------------------
exports.getYearlyChartUpToToday = async (req, res) => {
  try {
    const { gameName } = req.params;
    const { year } = req.query;

    const numericYear = parseInt(year);
    if (!year || isNaN(numericYear)) {
      return res.status(400).json({ error: "Valid year is required" });
    }

    const game = await Game.findOne({
      name: { $regex: `^${gameName}$`, $options: "i" },
    });
    if (!game) return res.status(404).json({ error: "Game not found" });

    const charts = await Chart.find({
      game: game._id,
      year: numericYear,
    });

    const today = getISTNow();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const isTodayResultAllowed = hasResultTimePassed(game.resultTime);

    const response = {};

    for (let m = 1; m <= 12; m++) {
      const chart = charts.find((c) => c.month === m);
      const daysInMonth = new Date(numericYear, m, 0).getDate();
      const numbers = chart?.numbers || createEmptyNumbers();

      const monthValues = [];

      for (let d = 1; d <= daysInMonth; d++) {
        if (
          numericYear > currentYear ||
          (numericYear === currentYear && m > currentMonth) ||
          (numericYear === currentYear && m === currentMonth && d > currentDay)
        ) {
          monthValues.push("");
          continue;
        }

        if (
          numericYear === currentYear &&
          m === currentMonth &&
          d === currentDay &&
          !isTodayResultAllowed
        ) {
          monthValues.push("");
          continue;
        }

        monthValues.push(numbers[d - 1]?.value ?? "");
      }

      response[getMonthName(m)] = monthValues;
    }

    res.json({
      gameName: game.name,
      year: numericYear,
      resultTime: game.resultTime,
      timezone: "Asia/Kolkata",
      data: response,
    });
  } catch (err) {
    console.error("Yearly chart error:", err);
    res.status(500).json({
      error: "Failed to fetch yearly chart",
      detail: err.message,
    });
  }
};
