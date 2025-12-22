import React, { useState } from 'react';

export default function ResultView({
    score,
    total,
    playCount,
    totalScore,
    maxScore,
    attemptsToClear,
    perfectClearCount,
    reviewData,
    leaderboard,
    rank,
    isPerfect,
    questions,
    onReplay,
    onHome
}) {
    const threshold = Math.ceil(total * 0.6); // 60% threshold
    const passed = score >= threshold;
    const [showReview, setShowReview] = useState(false);

    let statusText = "GAME OVER";
    let statusColor = 'var(--color-secondary)';

    if (isPerfect) {
        statusText = "PERFECT CLEAR!!";
        statusColor = 'var(--color-accent)';
    } else if (passed) {
        statusText = "MISSION CLEARED";
        statusColor = 'var(--color-accent)';
    }

    return (
        <div className="pixel-card" style={{ textAlign: 'center' }}>
            <h1 style={{
                color: statusColor,
                textShadow: '4px 4px 0 #000',
                fontSize: '2rem'
            }}>
                {statusText}
            </h1>

            <div style={{
                fontSize: '48px',
                margin: '16px 0',
                color: '#fff',
                textShadow: `4px 4px 0 ${statusColor}`
            }}>
                {score} / {total}
            </div>

            {/* Rank Display */}
            {rank && (
                <div style={{ marginBottom: '16px', color: '#ffd700', fontSize: '1.2rem' }}>
                    您的排名: {rank > 0 ? `No. ${rank}` : '-'}
                </div>
            )}

            {/* Stats Summary */}
            <div style={{
                textAlign: 'left',
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: '16px',
                marginBottom: '24px',
                fontSize: '0.9rem',
                borderRadius: '4px'
            }}>
                <p>闖關次數: {playCount}</p>
                <p>總分: {totalScore}</p>
                <p>最高分: {maxScore}</p>
                {attemptsToClear && <p>花了幾次通關: {attemptsToClear}</p>}
                <p style={{ color: '#ffd700' }}>完美通關次數: {perfectClearCount || 0}</p>
            </div>

            {/* Leaderboard */}
            {leaderboard && leaderboard.length > 0 && (
                <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                    <h3 style={{ borderBottom: '2px solid #555', paddingBottom: '8px' }}>排行榜 TOP 3</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '8px', marginTop: '8px', fontSize: '0.9rem', color: '#ccc' }}>
                        <div>排名</div><div>ID</div><div>最高分</div>
                        {leaderboard.map((player, index) => (
                            <React.Fragment key={index}>
                                <div style={{ color: index === 0 ? '#ffd700' : '#fff' }}>#{index + 1}</div>
                                <div>{player.id}</div>
                                <div style={{ textAlign: 'right' }}>{player.maxScore}</div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <button onClick={onHome} style={{ flex: 1, backgroundColor: 'var(--color-secondary)' }}>
                    回首頁
                </button>
                <button onClick={onReplay} style={{ flex: 1 }}>
                    再玩一次
                </button>
            </div>

            {/* Review Button & Section */}
            {reviewData && reviewData.length > 0 && (
                <div>
                    <button
                        onClick={() => setShowReview(!showReview)}
                        style={{ width: '100%', backgroundColor: '#444', marginBottom: '16px' }}
                    >
                        {showReview ? "收起複習" : "查看錯題複習"}
                    </button>

                    {showReview && (
                        <div style={{ textAlign: 'left', fontSize: '0.9rem' }}>
                            {reviewData.filter(item => !item.isCorrect).map((item) => {
                                // Find question object
                                const questionObj = questions && questions.find(q => String(q.id) === String(item.id));
                                const questionText = questionObj?.question || "題目";

                                // Helper to get full option text e.g. "A. 玉山山脈"
                                const getOptionText = (key) => {
                                    if (!questionObj || !questionObj.options) return key;
                                    return `${key}. ${questionObj.options[key] || ''}`;
                                };

                                return (
                                    <div key={item.id} style={{
                                        marginBottom: '16px',
                                        padding: '12px',
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        borderLeft: '4px solid var(--color-secondary)'
                                    }}>
                                        <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>{questionText}</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                                            <span style={{ color: 'var(--color-secondary)' }}>
                                                您的答案: {getOptionText(item.userAnswer)}
                                            </span>
                                            <span style={{ color: 'var(--color-accent)' }}>
                                                正確答案: {getOptionText(item.correctAnswer)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {reviewData.filter(item => !item.isCorrect).length === 0 && (
                                <p style={{ padding: '16px', color: 'var(--color-accent)' }}>
                                    太棒了！您全部答對，沒有需要複習的題目。
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
