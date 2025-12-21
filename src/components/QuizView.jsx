import React, { useState } from 'react';

export default function QuizView({ questions, onComplete }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});

    const currentQuestion = questions[currentIndex];
    // Use question ID as seed for consistent avatar
    const avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${currentQuestion.id}`;

    const handleAnswer = (optionKey) => {
        const newAnswers = { ...answers, [currentQuestion.id]: optionKey };
        setAnswers(newAnswers);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onComplete(newAnswers);
        }
    };

    return (
        <div className="pixel-card">
            {/* Progress Bar */}
            <div style={{
                width: '100%',
                height: '10px',
                backgroundColor: '#333',
                marginBottom: '16px',
                border: '2px solid #000'
            }}>
                <div style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                    height: '100%',
                    backgroundColor: 'var(--color-accent)',
                    transition: 'width 0.3s ease'
                }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#888' }}>
                <span>BOSS {currentIndex + 1}</span>
                <span>{currentIndex + 1}/{questions.length}</span>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <img
                    src={avatarUrl}
                    alt="Boss"
                    style={{
                        width: '120px',
                        height: '120px',
                        border: '4px solid var(--color-border)',
                        backgroundColor: '#444',
                        imageRendering: 'pixelated'
                    }}
                />
            </div>

            <div style={{ marginBottom: '32px', minHeight: '80px', borderBottom: '2px dashed #444', paddingBottom: '16px' }}>
                <p>{currentQuestion.question}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {Object.entries(currentQuestion.options).filter(([_, val]) => val).map(([key, text]) => ( // filter empty options logic
                    <button key={key} onClick={() => handleAnswer(key)} style={{ textAlign: 'left' }}>
                        <span style={{ color: 'var(--color-primary)' }}>{key}.</span> {text}
                    </button>
                ))}
            </div>
        </div>
    );
}
