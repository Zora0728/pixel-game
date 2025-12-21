function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("題目");
  const data = sheet.getDataRange().getValues();
  // Headers: 題號, 題目, A, B, C, D, 解答
  // Indexes: 0,    1,    2, 3, 4, 5, 6

  const headers = data[0];
  const rows = data.slice(1);

  // Filter empty rows
  const validRows = rows.filter(r => r[1] && r[6]); // Must have question and answer

  // Get N random questions
  const n = e.parameter.count ? parseInt(e.parameter.count) : 5;
  const shuffled = validRows.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, n);

  // Map to exclude answer
  const questions = selected.map(r => ({
    id: r[0],
    question: r[1],
    options: {
      A: r[2],
      B: r[3],
      C: r[4],
      D: r[5]
    }
    // Answer is NOT sent to frontend
  }));

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: questions
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    // 1. Parse Input
    const params = JSON.parse(e.postData.contents);
    const userId = params.id;
    const userAnswers = params.answers; // { questionId: "A", ... }

    if (!userId || !userAnswers) {
      throw new Error("Missing ID or Answers");
    }

    // 2. Calculate Score
    const qSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("題目");
    const qData = qSheet.getDataRange().getValues();
    const qRows = qData.slice(1);

    // Create a map for quick answer lookup: inputId -> Answer(Idx 6)
    const answerKey = {};
    qRows.forEach(r => {
      answerKey[r[0]] = r[6]; // ID -> Answer (e.g., 'A')
    });

    // Check answers & Build Review Data
    let correctCount = 0;
    let totalQuestions = 0;
    const reviewData = [];

    for (const [qId, ans] of Object.entries(userAnswers)) {
      totalQuestions++;
      const correctAns = answerKey[qId] ? String(answerKey[qId]).trim().toUpperCase() : "";
      const userAns = String(ans).trim().toUpperCase();
      const isCorrect = correctAns === userAns;

      if (isCorrect) {
        correctCount++;
      }

      reviewData.push({
        id: qId,
        isCorrect: isCorrect,
        userAnswer: userAns,
        correctAnswer: correctAns
      });
    }

    const score = correctCount; // Or calculate percentage
    const passThreshold = Math.ceil(totalQuestions * 0.6); // 60%
    const isPerfect = (score === totalQuestions); // 100%

    // 3. Update "回答" Sheet
    const aSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("回答");
    const aData = aSheet.getDataRange().getValues();
    const headers = aData[0];

    // Header Mapping Logic
    // Default indices if headers are missing or standard
    const colMap = {
      id: 0,
      playCount: 1,
      totalScore: 2,
      maxScore: 3,
      firstClear: 4,
      attempts: 5,
      lastTime: 6,
      perfect: 7
    };

    // Try to find dynamic indices
    headers.forEach((h, i) => {
      const header = String(h).trim();
      if (header === "ID") colMap.id = i;
      else if (header === "闖關次數") colMap.playCount = i;
      else if (header === "總分") colMap.totalScore = i;
      else if (header === "最高分") colMap.maxScore = i;
      else if (header === "第一次通關分數") colMap.firstClear = i;
      else if (header === "花了幾次通關") colMap.attempts = i;
      else if (header === "最近遊玩時間") colMap.lastTime = i;
      else if (header === "完美通關次數") colMap.perfect = i;
    });

    const maxColIndex = Math.max(...Object.values(colMap));

    let rowIndex = -1;
    let userRow = null;

    // Find User
    for (let i = 1; i < aData.length; i++) {
      if (String(aData[i][colMap.id]) === String(userId)) {
        rowIndex = i;
        userRow = aData[i];
        break;
      }
    }

    let playCount, totalScore, maxScore, attemptsToClear, firstClearScore, perfectClearCount;
    const now = new Date();

    if (rowIndex === -1) {
      // New User
      playCount = 1;
      totalScore = score;
      maxScore = score;
      const isPassed = score >= passThreshold;
      firstClearScore = isPassed ? score : "";
      attemptsToClear = isPassed ? 1 : "";
      perfectClearCount = isPerfect ? 1 : 0;

      // Construct new row based on map
      const newRow = new Array(maxColIndex + 1).fill("");
      newRow[colMap.id] = userId;
      newRow[colMap.playCount] = playCount;
      newRow[colMap.totalScore] = totalScore;
      newRow[colMap.maxScore] = maxScore;
      newRow[colMap.firstClear] = firstClearScore;
      newRow[colMap.attempts] = attemptsToClear;
      newRow[colMap.lastTime] = now;
      newRow[colMap.perfect] = perfectClearCount;

      aSheet.appendRow(newRow);
      // Re-fetch local data not strictly needed for logic but good for consistency if we reused array
      aData.push(newRow);
    } else {
      // Existing User
      playCount = parseInt(userRow[colMap.playCount]) || 0;
      playCount++;

      totalScore = (parseInt(userRow[colMap.totalScore]) || 0) + score;

      maxScore = parseInt(userRow[colMap.maxScore]) || 0;
      if (score > maxScore) maxScore = score;

      firstClearScore = userRow[colMap.firstClear];
      attemptsToClear = userRow[colMap.attempts];

      if (!firstClearScore && score >= passThreshold) {
        firstClearScore = score;
        attemptsToClear = playCount;
      }

      perfectClearCount = parseInt(userRow[colMap.perfect]) || 0;
      if (isPerfect) {
        perfectClearCount++;
      }

      // Update local row first
      userRow[colMap.playCount] = playCount;
      userRow[colMap.totalScore] = totalScore;
      userRow[colMap.maxScore] = maxScore;
      userRow[colMap.firstClear] = firstClearScore;
      userRow[colMap.attempts] = attemptsToClear;
      userRow[colMap.lastTime] = now;
      userRow[colMap.perfect] = perfectClearCount;

      // Update Sheet
      const range = aSheet.getRange(rowIndex + 1, 1, 1, userRow.length);
      range.setValues([userRow]);
    }

    // 4. Calculate Leaderboard & Rank
    const players = aData.slice(1);

    // Sort by MaxScore Descending
    players.sort((a, b) => {
      const scoreA = parseInt(a[colMap.maxScore]) || 0;
      const scoreB = parseInt(b[colMap.maxScore]) || 0;
      return scoreB - scoreA;
    });

    // Top 3
    const leaderboard = players.slice(0, 3).map(p => ({
      id: p[colMap.id],
      maxScore: p[colMap.maxScore],
      lastPlayed: p[colMap.lastTime]
    }));

    // Find Rank
    let rank = -1;
    for (let i = 0; i < players.length; i++) {
      if (String(players[i][colMap.id]) === String(userId)) {
        rank = i + 1;
        break;
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      score: score,
      correctCount: correctCount,
      total: totalQuestions,
      playCount: playCount,
      totalScore: totalScore,
      maxScore: maxScore,
      attemptsToClear: attemptsToClear,
      perfectClearCount: perfectClearCount,
      reviewData: reviewData,
      leaderboard: leaderboard,
      rank: rank,
      isPerfect: isPerfect
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function testDoGet() {
  const e = { parameter: { count: 3 } };
  const result = doGet(e);
  console.log(result.getContent());
}
