"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@tasco/ui";
import { CheckCircle, XCircle, Trophy, RotateCcw, ArrowRight } from "@tasco/ui/icons";
import type { Quiz, QuizQuestion } from "../../lib/course-context";

// Quiz with questions required for the quiz container
type QuizWithQuestions = Quiz & { questions: QuizQuestion[] };

interface QuizContainerProps {
  quiz: QuizWithQuestions;
  onComplete: (score: number, passed: boolean) => void;
  onRetry: () => void;
}

export function QuizContainer({ quiz, onComplete, onRetry }: QuizContainerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(quiz.questions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const question = quiz.questions[currentQuestion];
  const selectedAnswer = selectedAnswers[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const allAnswered = selectedAnswers.every((a) => a !== null);

  const handleSelectAnswer = (answerIndex: number) => {
    if (showResults) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
    setShowExplanation(false);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (isLastQuestion) {
      // Calculate score and show results
      const correctCount = selectedAnswers.reduce<number>((count, answer, index) => {
        return answer === quiz.questions[index].correctAnswer ? count + 1 : count;
      }, 0);
      const score = Math.round((correctCount / quiz.questions.length) * 100);
      const passed = score >= quiz.passingScore;
      setShowResults(true);
      onComplete(score, passed);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    setShowExplanation(false);
    setCurrentQuestion(Math.max(0, currentQuestion - 1));
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(quiz.questions.length).fill(null));
    setShowResults(false);
    setShowExplanation(false);
    onRetry();
  };

  // Calculate results
  const correctCount = selectedAnswers.reduce<number>((count, answer, index) => {
    return answer === quiz.questions[index].correctAnswer ? count + 1 : count;
  }, 0);
  const score = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = score >= quiz.passingScore;

  if (showResults) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center pb-4">
          <div
            className={`mx-auto p-4 rounded-full ${
              passed
                ? "bg-green-100 dark:bg-green-950"
                : "bg-amber-100 dark:bg-amber-950"
            }`}
          >
            <Trophy
              className={`h-10 w-10 ${
                passed ? "text-green-500" : "text-amber-500"
              }`}
            />
          </div>
          <CardTitle className="text-2xl mt-4">
            {passed ? "Congratulations!" : "Keep Learning!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">{score}%</div>
            <p className="text-muted-foreground">
              {correctCount} of {quiz.questions.length} questions correct
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Passing score: {quiz.passingScore}%
            </p>
          </div>

          {/* Question Review */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold">Question Review</h3>
            {quiz.questions.map((q, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`p-3 rounded-lg border ${
                    isCorrect
                      ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/50"
                      : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Q{index + 1}: {q.question}
                      </p>
                      {!isCorrect && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Correct answer: {q.options[q.correctAnswer]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleRetry} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{quiz.title}</CardTitle>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="progress-bar mt-4">
          <div
            className="progress-bar-fill"
            style={{
              width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question */}
        <div>
          <h3 className="text-xl font-semibold mb-6">{question.question}</h3>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  className={`quiz-option w-full text-left ${
                    isSelected ? "quiz-option-selected" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {isSelected && (
                        <div className="h-2.5 w-2.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Show explanation toggle */}
        {selectedAnswer !== null && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-muted-foreground"
          >
            {showExplanation ? "Hide" : "Show"} explanation
          </Button>
        )}

        {/* Explanation */}
        {showExplanation && selectedAnswer !== null && (
          <div
            className={`p-4 rounded-lg ${
              selectedAnswer === question.correctAnswer
                ? "bg-green-50 border border-green-200 dark:bg-green-950/50 dark:border-green-900"
                : "bg-amber-50 border border-amber-200 dark:bg-amber-950/50 dark:border-amber-900"
            }`}
          >
            <div className="flex items-start gap-2">
              {selectedAnswer === question.correctAnswer ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              )}
              <div>
                <p className="font-medium text-sm">
                  {selectedAnswer === question.correctAnswer
                    ? "Correct!"
                    : `Incorrect. The correct answer is: ${question.options[question.correctAnswer]}`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {question.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedAnswer === null}
          >
            {isLastQuestion ? "Submit Quiz" : "Next"}
            {!isLastQuestion && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
