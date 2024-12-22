'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { WelcomeScreen } from './WelcomeScreen';
import { ResultsScreen } from './ResultsScreen';
import { TestHeader } from './TestHeader';
import { QuestionCard } from './QuestionCard';
import { ProgressIndicator } from './ProgressIndicator';
import { ActionButtons } from './ActionButtons';

export default function TestInterface({ testData }) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [timerPaused, setTimerPaused] = useState(false);
  const [testState, setTestState] = useState({
    sessionId: null,
    currentQuestion: 0,
    answers: [],
    selectedOption: null,
    timeLeft: testData?.timePerQuestion || 30,
    showSkip: true,
    showNext: false,
    showSubmit: false,
    results: null,
  });

  const isLastQuestion =
    testState.currentQuestion === testData?.questionCount - 1;

  // Initialize answers array
  useEffect(() => {
    if (testData?.questionCount) {
      setTestState((prev) => ({
        ...prev,
        answers: Array(testData.questionCount).fill({
          status: 'unanswered',
          selectedAnswer: null,
          timeSpent: 0,
        }),
      }));
    }
  }, [testData?.questionCount]);

  // Error cleanup effect
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const [initialWaitPeriod, setInitialWaitPeriod] = useState(true);

  // Add effect to handle initial wait period when question changes
  useEffect(() => {
    if (currentScreen === 'test') {
      setInitialWaitPeriod(true);
      const timer = setTimeout(() => {
        setInitialWaitPeriod(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentScreen, testState.currentQuestion]);

  // Timer effect with pause functionality
  useEffect(() => {
    let timer;
    if (currentScreen === 'test' && testState.timeLeft > 0 && !timerPaused) {
      timer = setInterval(() => {
        setTestState((prev) => {
          const newTimeLeft = prev.timeLeft - 1;
          if (newTimeLeft <= 0) {
            clearInterval(timer);
            setTimeout(() => handleTimeUp(), 0);
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: newTimeLeft };
        });
      }, 1000);

      return () => {
        if (timer) clearInterval(timer);
      };
    }
  }, [currentScreen, testState.timeLeft, timerPaused]);

  const updateProgress = async (questionIndex) => {
    try {
      await fetch(`/api/tests/${testData.slug}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: testState.sessionId,
          currentQuestionIndex: questionIndex,
          status: 'in_progress',
        }),
      });
    } catch (err) {
      console.error('Progress update error:', err);
      throw err; // Propagate error for handling
    }
  };

  const handleTimeUp = useCallback(async () => {
    try {
      if (!testState.sessionId) return;

      const currentQuestion = testData.questions[testState.currentQuestion];

      if (testState.selectedOption !== null) {
        if (isLastQuestion) {
          await handleSubmit();
        } else {
          await handleNext();
        }
      } else {
        const response = await fetch(`/api/tests/${testData.slug}/response`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: testState.sessionId,
            questionId: currentQuestion.id,
            selectedAnswer: null,
            isCorrect: false,
            timeSpent: testData.timePerQuestion,
            isSkipped: true,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to record response');
        }

        setTestState((prev) => ({
          ...prev,
          answers: prev.answers.map((ans, i) =>
            i === prev.currentQuestion
              ? {
                  status: 'skipped',
                  selectedAnswer: null,
                  timeSpent: testData.timePerQuestion,
                }
              : ans
          ),
        }));

        if (isLastQuestion) {
          await handleSubmit();
        } else {
          const nextQuestion = testState.currentQuestion + 1;
          await updateProgress(nextQuestion);

          setTestState((prev) => ({
            ...prev,
            currentQuestion: nextQuestion,
            selectedOption: null,
            timeLeft: testData.timePerQuestion,
            showNext: false,
            showSkip: true,
            showSubmit: false,
          }));
        }
      }
    } catch (err) {
      console.error('Time up handler error:', err);
      setError('Failed to process time-up action. Please try again.');
    }
  }, [
    testState.sessionId,
    testState.selectedOption,
    testState.currentQuestion,
    isLastQuestion,
    testData?.timePerQuestion,
    testData?.slug,
  ]);

  const handleSubmit = async () => {
    if (!testState.sessionId) return;

    setTimerPaused(true);

    try {
      const response = await fetch(`/api/tests/${testData.slug}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: testState.sessionId,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit test');

      const data = await response.json();

      setTimeout(() => {
        setTestState((prev) => ({
          ...prev,
          results: data.stats,
        }));
        setCurrentScreen('results');
      }, 3000);
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to submit test. Please try again.');
      setTimerPaused(false);
    }
  };

  const handleNext = async () => {
    setTimerPaused(true);
    const nextQuestion = testState.currentQuestion + 1;

    try {
      await updateProgress(nextQuestion);

      setTimeout(() => {
        setTimerPaused(false);
        setTestState((prev) => ({
          ...prev,
          currentQuestion: nextQuestion,
          selectedOption: null,
          timeLeft: testData.timePerQuestion,
          showNext: false,
          showSkip: true,
          showSubmit: false,
        }));
      }, 3000);
    } catch (err) {
      console.error('Next question error:', err);
      setError('Failed to move to next question. Please try again.');
      setTimerPaused(false);
    }
  };

  const handleSkip = async () => {
    if (!testState.sessionId) return;

    setTimerPaused(true);
    const timeSpent = testData.timePerQuestion - testState.timeLeft;

    try {
      const currentQuestion = testData.questions[testState.currentQuestion];

      const response = await fetch(`/api/tests/${testData.slug}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: testState.sessionId,
          questionId: currentQuestion.id,
          selectedAnswer: null,
          isCorrect: false,
          timeSpent: timeSpent,
          isSkipped: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record skipped response');
      }

      setTestState((prev) => ({
        ...prev,
        answers: prev.answers.map((ans, i) =>
          i === prev.currentQuestion
            ? {
                status: 'skipped',
                selectedAnswer: null,
                timeSpent: timeSpent,
              }
            : ans
        ),
      }));

      if (isLastQuestion) {
        await handleSubmit();
        return;
      }

      const nextQuestion = testState.currentQuestion + 1;
      await updateProgress(nextQuestion);

      setTimeout(() => {
        setTimerPaused(false);
        setTestState((prev) => ({
          ...prev,
          currentQuestion: nextQuestion,
          selectedOption: null,
          timeLeft: testData.timePerQuestion,
          showNext: false,
          showSkip: true,
          showSubmit: false,
        }));
      }, 3000);
    } catch (err) {
      console.error('Skip error:', err);
      setError('Failed to skip question. Please try again.');
      setTimerPaused(false);
    }
  };

  const handleOptionSelect = async (option, index) => {
    if (!testState.sessionId) return;

    try {
      const currentQuestion = testData.questions[testState.currentQuestion];
      const timeSpent = testData.timePerQuestion - testState.timeLeft;

      const selectedAnswerLetter = String.fromCharCode(65 + index);
      const isCorrect = selectedAnswerLetter === currentQuestion.correctAnswer;

      const response = await fetch(`/api/tests/${testData.slug}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: testState.sessionId,
          questionId: currentQuestion.id,
          selectedAnswer: selectedAnswerLetter,
          isCorrect: isCorrect,
          timeSpent,
          isSkipped: false,
        }),
      });

      if (!response.ok) throw new Error('Failed to save answer');

      setTestState((prev) => ({
        ...prev,
        selectedOption: option,
        showNext: !isLastQuestion,
        showSkip: false,
        showSubmit: isLastQuestion,
        answers: prev.answers.map((ans, i) =>
          i === prev.currentQuestion
            ? {
                status: isCorrect ? 'correct' : 'wrong',
                selectedAnswer: selectedAnswerLetter,
                timeSpent,
              }
            : ans
        ),
      }));
    } catch (err) {
      console.error('Option select error:', err);
      setError('Failed to save answer. Please try again.');
    }
  };

  const initSession = async () => {
    setIsLoading(true);
    try {
      const checkSession = await fetch(
        `/api/tests/${testData.slug}/check-session`
      );
      const sessionData = await checkSession.json();

      if (sessionData.existingSession) {
        setTestState((prev) => ({
          ...prev,
          sessionId: sessionData.sessionId,
          currentQuestion: sessionData.currentQuestion,
          answers: sessionData.answers,
        }));
      } else {
        const res = await fetch(`/api/tests/${testData.slug}/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testId: testData.testId, // Pass the actual testId
            testType: testData.testType || 'topic',
          }),
        });

        if (!res.ok) throw new Error('Failed to initialize session');

        const data = await res.json();
        setTestState((prev) => ({
          ...prev,
          sessionId: data.sessionId,
          currentQuestion: 0,
        }));
      }

      setCurrentScreen('test');
    } catch (err) {
      console.error('Session initialization error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentScreen = () => {
    if (isLoading) {
      return (
        <Card className="p-8 my-3 ms-2 rounded-sm">
          <CardContent className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading...</span>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen testData={testData} onStart={initSession} />;

      case 'test':
        const currentQuestion = testData.questions[testState.currentQuestion];
        return currentQuestion ? (
          <Card className="my-3 ms-2 rounded-sm">
            <CardContent className="p-8">
              <TestHeader
                topicName={testData.topicName}
                testName={testData.testName}
                currentQuestion={testState.currentQuestion + 1}
                totalQuestions={testData.questionCount}
                timeLeft={testState.timeLeft}
              />
              <QuestionCard
                question={currentQuestion}
                selectedOption={testState.selectedOption}
                onOptionSelect={handleOptionSelect}
                disabled={isLoading}
              />
              <ProgressIndicator
                answers={testState.answers}
                total={testData.questionCount}
                current={testState.currentQuestion}
              />
              <ActionButtons
                showSkip={testState.showSkip && !isLoading}
                showNext={testState.showNext && !isLoading}
                showSubmit={testState.showSubmit && !isLoading}
                onSkip={handleSkip}
                onNext={handleNext}
                onSubmit={handleSubmit}
                disabled={isLoading || initialWaitPeriod}
                isLastQuestion={isLastQuestion}
              />
            </CardContent>
          </Card>
        ) : null;

      case 'results':
        return (
          <ResultsScreen
            results={testState.results}
            currentUrl={
              typeof window !== 'undefined' ? window.location.href : ''
            }
          />
        );

      default:
        return null;
    }
  };

  return <div className="min-h-screen bg-gray-50">{renderCurrentScreen()}</div>;
}
