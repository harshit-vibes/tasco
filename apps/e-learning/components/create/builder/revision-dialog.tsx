"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tasco/ui";
import { Button, Textarea } from "@tasco/ui";

interface RevisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (feedback: string) => void;
  title?: string;
  description?: string;
  suggestions?: string[];
}

export function RevisionDialog({
  open,
  onOpenChange,
  onSubmit,
  title = "What would you like to change?",
  description = "Describe the changes you'd like to make to the content.",
  suggestions = [
    "Add more practical examples",
    "Make it more beginner-friendly",
    "Include real-world scenarios",
    "Add assessment questions",
  ],
}: RevisionDialogProps) {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    if (feedback.trim()) {
      onSubmit(feedback.trim());
      setFeedback("");
      onOpenChange(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFeedback((prev) => {
      if (prev.trim()) {
        return `${prev}. ${suggestion}`;
      }
      return suggestion;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Describe your requested changes..."
            className="min-h-[120px] resize-none"
          />

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="rounded-full border border-border bg-muted/50 px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!feedback.trim()}>
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
