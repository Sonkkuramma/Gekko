'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TestSession = ({
  testId,
  userId,
  questions,
  modules,
  type,
  sessionData,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState({});
  const [networkStatus, setNetworkStatus] = useState('online');

  // Initialize from session data if it exists
  useEffect(() => {
    if (sessionData) {
      try {
        const savedResponses = JSON.parse(sessionData.responses || '{}');
        setResponses(savedResponses);

        // Set current question based on last attempted
        const lastAttempted = sessionData.last_question_number || 1;
        loadQuestion(lastAttempted);
      } catch (err) {
        console.error('Error loading session data:', err);
        loadQuestion(1);
      }
    } else {
      loadQuestion(1);
    }
  }, [sessionData]);

  const loadQuestion = (questionNumber) => {
    setLoading(true);
    try {
      if (type === 'section') {
        // Find question in modules
        for (const module of modules) {
          const question = module.questions.find(
            (q) => q.number === questionNumber
          );
          if (question) {
            setCurrentQuestion(question);
            break;
          }
        }
      } else {
        // Direct question access
        const question = questions.find((q) => q.number === questionNumber);
        setCurrentQuestion(question);
      }
    } catch (err) {
      setError('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const saveResponse = async (response) => {
    if (!currentQuestion) return;

    // Update local state
    const newResponses = {
      ...responses,
      [currentQuestion.id]: response,
    };
    setResponses(newResponses);

    // Save to server
    if (networkStatus === 'online') {
      try {
        const res = await fetch('/api/tests/response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testId,
            userId,
            questionId: currentQuestion.id,
            response,
            questionNumber: currentQuestion.number,
          }),
        });

        if (!res.ok) throw new Error('Failed to save response');
      } catch (err) {
        // Handle offline saving
        console.error('Failed to save response:', err);
      }
    }
  };

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {currentQuestion && (
        <>
          {/* Question content */}
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold mb-4">
              Question {currentQuestion.number}
            </h3>
            <p>{currentQuestion.content}</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => saveResponse(option.id)}
                className={`w-full p-4 text-left rounded-lg border ${
                  responses[currentQuestion.id] === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium">{option.label}.</span>{' '}
                {option.content}
              </button>
            ))}
          </div>

          {/* Save status */}
          <div className="flex items-center justify-end space-x-2 text-sm text-gray-600">
            <Save
              className={`h-4 w-4 ${
                networkStatus === 'online' ? 'text-green-500' : 'text-gray-400'
              }`}
            />
            <span>{networkStatus === 'online' ? 'Saved' : 'Offline'}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default TestSession;
