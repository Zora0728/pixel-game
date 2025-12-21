const API_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;

const MOCK_DB = [
    { id: "m1", question: "What is 2 + 2?", options: { A: "3", B: "4", C: "5", D: "22" }, answer: "B" },
    { id: "m2", question: "Which is a color?", options: { A: "Dog", B: "Cat", C: "Blue", D: "Air" }, answer: "C" },
    { id: "m3", question: "Capital of Taiwan?", options: { A: "Tokyo", B: "Seoul", C: "Taipei", D: "Beijing" }, answer: "C" },
    { id: "m4", question: "Pixel Art uses?", options: { A: "Pixels", B: "Vectors", C: "Voxels", D: "Polygons" }, answer: "A" },
    { id: "m5", question: "Best AI?", options: { A: "A", B: "B", C: "C", D: "Gemini" }, answer: "D" },
];

export async function fetchQuestions(count) {
    if (!API_URL || API_URL.includes("CHANGE_ME")) {
        console.warn("API URL not configured, using mock data");
        // Return first N questions without the answer key
        return MOCK_DB.slice(0, count).map(q => ({
            id: q.id,
            question: q.question,
            options: q.options
        }));
    }

    const response = await fetch(`${API_URL}?count=${count}`);
    const data = await response.json();
    if (data.success) {
        return data.data;
    }
    throw new Error(data.error || "Failed to fetch");
}

export async function submitScore(id, answers) {
    if (!API_URL || API_URL.includes("CHANGE_ME")) {
        console.warn("API URL not configured, mocking submission");

        // Calculate REAL score based on MOCK_DB
        let correctCount = 0;
        let total = 0;

        for (const [qId, userAns] of Object.entries(answers)) {
            total++;
            const question = MOCK_DB.find(q => q.id === qId);
            if (question && question.answer === userAns) {
                correctCount++;
            }
        }

        return {
            success: true,
            score: correctCount,
            correctCount: correctCount,
            total: total
        };
    }

    // Use text/plain to avoid CORS Preflight (OPTIONS)
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({ id, answers }),
    });

    const data = await response.json();
    return data;
}
