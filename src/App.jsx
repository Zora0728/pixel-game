import React, { useState } from 'react';
import Layout from './components/Layout';
import HomeView from './components/HomeView';
import QuizView from './components/QuizView';
import ResultView from './components/ResultView';
import { fetchQuestions, submitScore } from './services/api';

function App() {
  const [step, setStep] = useState('home'); // home, loading, quiz, submitting, result, error
  const [studentId, setStudentId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [scoreData, setScoreData] = useState({ score: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState('');

  const handleStart = async (id) => {
    setStudentId(id);
    setStep('loading');
    setErrorMsg('');
    try {
      const count = import.meta.env.VITE_QUESTION_COUNT || 5;
      const data = await fetchQuestions(count);
      setQuestions(data);
      setStep('quiz');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load mission. Check connection.');
      setStep('error');
    }
  };

  const handleQuizComplete = async (answers) => {
    setStep('submitting');
    try {
      const result = await submitScore(studentId, answers);
      if (result.success) {
        setScoreData({
          score: result.score,
          total: result.total,
          playCount: result.playCount,
          totalScore: result.totalScore,
          maxScore: result.maxScore,
          attemptsToClear: result.attemptsToClear,
          reviewData: result.reviewData || [],
          leaderboard: result.leaderboard || [],
          rank: result.rank || '-',
          perfectClearCount: result.perfectClearCount || 0,
          isPerfect: result.isPerfect || false
        });
        setStep('result');
      } else {
        throw new Error(result.error || "Submission failed");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Mission Report Failed to Send.');
      setStep('error');
    }
  };

  const handleReplay = () => {
    // Replay with same ID
    handleStart(studentId);
  };

  const handleHome = () => {
    // Return to Home, clear ID
    setStudentId('');
    setStep('home');
    setQuestions([]);
  };

  return (
    <Layout>
      {step === 'home' && <HomeView onStart={handleStart} />}

      {step === 'loading' && (
        <div className="pixel-card" style={{ textAlign: 'center' }}>
          <h2>LOADING MISSION...</h2>
        </div>
      )}

      {step === 'quiz' && (
        <QuizView questions={questions} onComplete={handleQuizComplete} />
      )}

      {step === 'submitting' && (
        <div className="pixel-card" style={{ textAlign: 'center' }}>
          <h2>TRANSMITTING DATA...</h2>
        </div>
      )}

      {step === 'result' && (
        <ResultView
          score={scoreData.score}
          total={scoreData.total}
          playCount={scoreData.playCount}
          totalScore={scoreData.totalScore}
          maxScore={scoreData.maxScore}
          attemptsToClear={scoreData.attemptsToClear}
          reviewData={scoreData.reviewData}
          leaderboard={scoreData.leaderboard}
          rank={scoreData.rank}
          perfectClearCount={scoreData.perfectClearCount}
          isPerfect={scoreData.isPerfect}
          questions={questions}
          onReplay={handleReplay}
          onHome={handleHome}
        />
      )}

      {step === 'error' && (
        <div className="pixel-card" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-secondary)' }}>ERROR</h2>
          <p>{errorMsg}</p>
          <button onClick={() => setStep('home')} style={{ marginTop: '16px' }}>RETURN TO BASE</button>
        </div>
      )}
    </Layout>
  );
}

export default App;
