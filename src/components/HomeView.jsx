import React, { useState } from 'react';

export default function HomeView({ onStart }) {
    const [id, setId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (id.trim()) {
            onStart(id.trim());
        }
    };

    return (
        <div className="pixel-card" style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'var(--color-primary)', textShadow: '4px 4px 0 #000' }}>Pixel Quiz</h1>
            <p style={{ marginBottom: '32px' }}>請輸入您的 ID</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="ID"
                    autoFocus
                    style={{ marginBottom: '24px', textAlign: 'center' }}
                />
                <button type="submit" style={{ width: '100%' }}>開始遊戲</button>
            </form>
        </div>
    );
}
