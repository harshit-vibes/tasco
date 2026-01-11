"use client";

import React from "react";
import { Card } from "@tasco/ui";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

// Simple markdown renderer for course content
// Handles: headers, bold, lists, blockquotes, code blocks
export function MarkdownPreview({ content, className = "" }: MarkdownPreviewProps) {
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactElement[] = [];
    let currentList: string[] = [];
    let inCodeBlock = false;
    let codeContent: string[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc pl-6 mb-4 space-y-1">
            {currentList.map((item, i) => (
              <li key={i} className="text-muted-foreground">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const flushCode = () => {
      if (codeContent.length > 0) {
        elements.push(
          <pre
            key={`code-${elements.length}`}
            className="bg-muted rounded-lg p-4 mb-4 overflow-x-auto text-sm"
          >
            <code>{codeContent.join("\n")}</code>
          </pre>
        );
        codeContent = [];
      }
    };

    const renderInline = (text: string) => {
      // Bold: **text**
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
    };

    lines.forEach((line, index) => {
      // Code block toggle
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          flushCode();
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      // Headers
      if (line.startsWith("## ")) {
        flushList();
        elements.push(
          <h2
            key={`h2-${index}`}
            className="text-xl font-bold text-primary uppercase tracking-wide mb-3 mt-6 first:mt-0"
          >
            {line.slice(3)}
          </h2>
        );
        return;
      }

      if (line.startsWith("### ")) {
        flushList();
        elements.push(
          <h3 key={`h3-${index}`} className="text-lg font-semibold mb-2 mt-4">
            {line.slice(4)}
          </h3>
        );
        return;
      }

      // Blockquote
      if (line.startsWith("> ")) {
        flushList();
        elements.push(
          <blockquote
            key={`quote-${index}`}
            className="border-l-4 border-primary pl-4 py-2 mb-4 bg-primary/5 rounded-r"
          >
            <p className="text-muted-foreground italic">
              {renderInline(line.slice(2))}
            </p>
          </blockquote>
        );
        return;
      }

      // List items
      if (line.startsWith("- ") || line.startsWith("* ") || line.match(/^\d+\. /)) {
        const content = line.replace(/^[-*]\s|^\d+\.\s/, "");
        currentList.push(content);
        return;
      }

      // Empty line
      if (line.trim() === "") {
        flushList();
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={`p-${index}`} className="text-muted-foreground mb-3">
          {renderInline(line)}
        </p>
      );
    });

    flushList();
    flushCode();

    return elements;
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {renderMarkdown(content)}
      </div>
    </Card>
  );
}
