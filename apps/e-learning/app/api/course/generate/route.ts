import { NextRequest, NextResponse } from "next/server";
import { createLyzrClient } from "@tasco/lyzr";
import type {
  CourseSelections,
  CourseOutline,
  GeneratedModule,
} from "../../../../lib/types/creator";
import {
  levelOptions,
  topicOptions,
  audienceOptions,
  focusOptions,
} from "../../../../lib/types/creator";

// Initialize Lyzr client
const lyzrClient = createLyzrClient({
  apiKey: process.env.LYZR_API_KEY || "",
  baseUrl: process.env.LYZR_BASE_URL || "https://agent.api.lyzr.app",
});

// Agent IDs from environment
const OUTLINE_AGENT_ID = process.env.LYZR_COURSE_OUTLINE_AGENT_ID || "";
const MODULE_AGENT_ID = process.env.LYZR_MODULE_CONTENT_AGENT_ID || "";
const LESSON_AGENT_ID = process.env.LYZR_LESSON_GENERATOR_AGENT_ID || "";
const QUIZ_AGENT_ID = process.env.LYZR_QUIZ_GENERATOR_AGENT_ID || "";

// Helper to get label from value
function getLabel(
  options: Array<{ value: string; label: string }>,
  value: string | null
): string {
  return options.find((o) => o.value === value)?.label || value || "";
}

// Parse JSON from agent response (handle markdown wrapping and control characters)
function parseAgentResponse<T>(response: string): T {
  let jsonStr = response;

  // Remove markdown code blocks if present
  if (response.includes("```json")) {
    jsonStr = response.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  } else if (response.includes("```")) {
    jsonStr = response.replace(/```\n?/g, "");
  }

  jsonStr = jsonStr.trim();

  // First try direct parse
  try {
    return JSON.parse(jsonStr);
  } catch (firstError) {
    // If direct parse fails, try to fix common issues
    console.log("[parseAgentResponse] Direct parse failed, attempting to fix JSON...");

    try {
      // Fix control characters inside string values
      // This regex finds string values and escapes problematic characters
      const fixedJson = fixJsonControlCharacters(jsonStr);
      return JSON.parse(fixedJson);
    } catch (secondError) {
      // Last resort: try to extract and rebuild JSON
      console.log("[parseAgentResponse] Fix attempt failed, trying extraction...");
      try {
        const extracted = extractAndRebuildJson(jsonStr);
        return JSON.parse(extracted);
      } catch (thirdError) {
        console.error("[parseAgentResponse] All parse attempts failed");
        throw firstError; // Throw original error
      }
    }
  }
}

// Fix control characters inside JSON string values
function fixJsonControlCharacters(jsonStr: string): string {
  // State machine to track if we're inside a string
  let result = "";
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];
    const charCode = char.charCodeAt(0);

    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      result += char;
      escapeNext = true;
      continue;
    }

    if (char === '"' && !escapeNext) {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString) {
      // Escape control characters inside strings
      if (charCode < 32) {
        if (char === "\n") {
          result += "\\n";
        } else if (char === "\r") {
          result += "\\r";
        } else if (char === "\t") {
          result += "\\t";
        } else {
          // Other control characters - use unicode escape
          result += "\\u" + charCode.toString(16).padStart(4, "0");
        }
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }

  return result;
}

// Try to extract JSON object from response and rebuild it
function extractAndRebuildJson(response: string): string {
  // Find the first { and last }
  const start = response.indexOf("{");
  const end = response.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No valid JSON object found in response");
  }

  let jsonCandidate = response.substring(start, end + 1);

  // Apply control character fix
  return fixJsonControlCharacters(jsonCandidate);
}

// Check outline quality (bp-sdk pattern)
function checkOutlineQuality(outline: CourseOutline): boolean {
  // Check required fields
  if (!outline.title || outline.title.length < 5) return false;
  if (!outline.description || outline.description.length < 20) return false;
  if (!outline.modules || outline.modules.length < 2) return false;
  if (!outline.audience) return false;

  // Check each module
  for (const module of outline.modules) {
    if (!module.title || module.title.length < 3) return false;
    if (!module.lessons || module.lessons.length < 2) return false;
    if (!module.quizQuestions || module.quizQuestions < 1) return false;
  }

  return true;
}

// Generate outline using Lyzr agent (with retries like bp-sdk)
async function generateOutlineWithAgent(
  selections: CourseSelections,
  retryCount = 0
): Promise<CourseOutline> {
  const level = getLabel(levelOptions, selections.level);
  const topic = getLabel(topicOptions, selections.topic);
  const audience = getLabel(audienceOptions, selections.audience);
  const focus = getLabel(focusOptions, selections.focus);

  const prompt = `Create a comprehensive ${level.toLowerCase()} training course outline on "${topic}" for ${audience.toLowerCase()} focusing on ${focus.toLowerCase()} skills.

The course is for Tasco Insurance employees in Vietnam.

CRITICAL: Return ONLY a valid JSON object. No markdown code blocks, no explanation text, no \`\`\`json wrapper. Start directly with { and end with }.

Required JSON structure:
{
  "title": "Course Title",
  "description": "2-3 sentence course description",
  "level": "${selections.level}",
  "audience": "${audience}",
  "estimatedMinutes": 45,
  "modules": [
    {
      "title": "Module 1 Title",
      "lessons": ["Lesson 1 topic", "Lesson 2 topic", "Lesson 3 topic"],
      "quizQuestions": 5
    }
  ]
}

Guidelines:
- Create 3-5 modules that progressively build knowledge
- Each module should have 3-4 lesson topics
- Module titles should be action-oriented
- Lesson topics should be specific and practical
- Content should be relevant to Vietnamese insurance market`;

  // Check if agent ID is configured
  if (!OUTLINE_AGENT_ID) {
    console.log("[Course Generate] No outline agent configured, using fallback");
    return generateOutlineFallback(selections);
  }

  try {
    const response = await lyzrClient.chat(
      OUTLINE_AGENT_ID,
      [{ role: "user", content: prompt }],
      `course-outline-${Date.now()}-${retryCount}`  // Unique session per retry (bp-sdk pattern)
    );

    const outline = parseAgentResponse<CourseOutline>(response.message);

    // Quality gate: Auto-retry if quality check fails (bp-sdk pattern)
    if (!checkOutlineQuality(outline) && retryCount < MAX_RETRIES) {
      console.log(`[Course Generate] Outline quality check failed (attempt ${retryCount + 1}/${MAX_RETRIES}), retrying...`);
      return generateOutlineWithAgent(selections, retryCount + 1);
    }

    return outline;
  } catch (error) {
    // Retry on error (bp-sdk pattern)
    if (retryCount < MAX_RETRIES) {
      console.log(`[Course Generate] Outline agent error (attempt ${retryCount + 1}/${MAX_RETRIES}), retrying...`);
      return generateOutlineWithAgent(selections, retryCount + 1);
    }
    console.error("[Course Generate] Outline agent error after retries, using fallback:", error);
    return generateOutlineFallback(selections);
  }
}

// Fallback outline generation (when agents not configured)
function generateOutlineFallback(selections: CourseSelections): CourseOutline {
  const level = getLabel(levelOptions, selections.level);
  const topic = getLabel(topicOptions, selections.topic);
  const audience = getLabel(audienceOptions, selections.audience);
  const focus = getLabel(focusOptions, selections.focus);

  return {
    title: `${topic} Fundamentals`,
    description: `A comprehensive ${level.toLowerCase()} course designed for ${audience.toLowerCase()} covering essential ${focus.toLowerCase()} skills.`,
    level: selections.level || "beginner",
    audience: audience,
    estimatedMinutes: selections.level === "advanced" ? 90 : selections.level === "intermediate" ? 60 : 45,
    modules: [
      {
        title: `Introduction to ${topic}`,
        lessons: [
          `What is ${topic.toLowerCase()} and why it matters`,
          `Key terminology every ${audience.toLowerCase().replace("s", "")} should know`,
          `Industry overview and market context`,
        ],
        quizQuestions: 5,
      },
      {
        title: `Core Concepts`,
        lessons: [
          `Fundamental principles of ${topic.toLowerCase()}`,
          `Types and categories explained`,
          `Real-world applications and examples`,
        ],
        quizQuestions: 5,
      },
      {
        title: `${focus} Deep Dive`,
        lessons: [
          `${focus} best practices`,
          `Common challenges and solutions`,
          `Tools and resources for ${focus.toLowerCase()}`,
        ],
        quizQuestions: 5,
      },
      {
        title: `Practical Application`,
        lessons: [
          `Case studies and real scenarios`,
          `Step-by-step workflows`,
          `Tips for success`,
        ],
        quizQuestions: 5,
      },
    ],
  };
}

// Max retries for agent calls (like bp-sdk pattern)
const MAX_RETRIES = 3;

// Check lesson quality (like bp-sdk checkAgentQuality)
function checkLessonQuality(lesson: { title: string; content: string }): boolean {
  // Check for minimum content length
  if (!lesson.content || lesson.content.length < 200) return false;
  // Check for placeholder text
  if (lesson.content.includes("[PLACEHOLDER]") || lesson.content.includes("{{")) return false;
  // Check title exists
  if (!lesson.title || lesson.title.length < 3) return false;
  return true;
}

// Check quiz quality
function checkQuizQuality(quiz: { questions: Array<{ question: string; options: string[]; correctAnswer: number; explanation: string }> }): boolean {
  if (!quiz.questions || quiz.questions.length === 0) return false;
  for (const q of quiz.questions) {
    if (!q.question || q.question.length < 10) return false;
    if (!q.options || q.options.length < 2) return false;
    if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) return false;
  }
  return true;
}

// Check full module quality (bp-sdk pattern)
function checkModuleQuality(module: GeneratedModule): boolean {
  // Check module structure
  if (module.moduleIndex === undefined || module.moduleIndex < 0) return false;
  if (!module.lessons || module.lessons.length === 0) return false;
  if (!module.quiz || !module.quiz.questions) return false;

  // Check each lesson quality
  for (const lesson of module.lessons) {
    if (!checkLessonQuality(lesson)) return false;
  }

  // Check quiz quality
  if (!checkQuizQuality(module.quiz)) return false;

  return true;
}

// Generate a single lesson using the lesson agent (with retries like bp-sdk)
async function generateLessonWithAgent(
  courseTitle: string,
  moduleTitle: string,
  lessonTitle: string,
  audience: string,
  level: string,
  retryCount = 0
): Promise<{ title: string; content: string }> {
  const prompt = `Generate detailed lesson content for the following:

Course: ${courseTitle}
Module: ${moduleTitle}
Lesson: ${lessonTitle}
Target Audience: ${audience}
Difficulty Level: ${level}
Context: This is for Tasco Insurance employees in Vietnam.

CRITICAL: Return ONLY a valid JSON object. No markdown code blocks, no \`\`\`json wrapper. Start directly with { and end with }.

IMPORTANT: In the JSON, escape all newlines as \\n (two characters: backslash + n). Do NOT use literal line breaks inside string values.

Required JSON structure:
{
  "title": "${lessonTitle}",
  "content": "Detailed markdown content (600-900 words) with ## headers, **bold** for key terms, bullet points, practical examples, and > blockquotes for tips. Use \\n for line breaks."
}`;

  if (!LESSON_AGENT_ID) {
    console.log("[Course Generate] No lesson agent configured, using fallback");
    return {
      title: lessonTitle,
      content: generateLessonContentFallback(lessonTitle, courseTitle, 0),
    };
  }

  try {
    const response = await lyzrClient.chat(
      LESSON_AGENT_ID,
      [{ role: "user", content: prompt }],
      `lesson-${Date.now()}-${retryCount}`  // Unique session per retry (bp-sdk pattern)
    );
    const lesson = parseAgentResponse<{ title: string; content: string }>(response.message);

    // Quality gate: Auto-retry if quality check fails (bp-sdk pattern)
    if (!checkLessonQuality(lesson) && retryCount < MAX_RETRIES) {
      console.log(`[Course Generate] Lesson quality check failed (attempt ${retryCount + 1}/${MAX_RETRIES}), retrying...`);
      return generateLessonWithAgent(courseTitle, moduleTitle, lessonTitle, audience, level, retryCount + 1);
    }

    return lesson;
  } catch (error) {
    // Retry on error (bp-sdk pattern)
    if (retryCount < MAX_RETRIES) {
      console.log(`[Course Generate] Lesson agent error (attempt ${retryCount + 1}/${MAX_RETRIES}), retrying...`);
      return generateLessonWithAgent(courseTitle, moduleTitle, lessonTitle, audience, level, retryCount + 1);
    }
    console.error("[Course Generate] Lesson agent error after retries:", error);
    return {
      title: lessonTitle,
      content: generateLessonContentFallback(lessonTitle, courseTitle, 0),
    };
  }
}

// Generate quiz questions using the quiz agent (with retries like bp-sdk)
async function generateQuizWithAgent(
  courseTitle: string,
  moduleTitle: string,
  lessonTopics: string[],
  questionCount: number,
  level: string,
  retryCount = 0
): Promise<{ questions: Array<{ question: string; options: string[]; correctAnswer: number; explanation: string }> }> {
  const prompt = `Generate ${questionCount} quiz questions for the following module:

Course: ${courseTitle}
Module: ${moduleTitle}
Lesson Topics: ${lessonTopics.join(", ")}
Difficulty Level: ${level}
Context: This is for Tasco Insurance employees in Vietnam.

CRITICAL: Return ONLY a valid JSON object. No markdown code blocks, no \`\`\`json wrapper. Start directly with { and end with }.

IMPORTANT: In the JSON, escape all newlines as \\n. Do NOT use literal line breaks inside string values.

Required JSON structure:
{
  "questions": [
    {
      "question": "Clear question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}

Generate exactly ${questionCount} questions that test understanding and application.`;

  if (!QUIZ_AGENT_ID) {
    console.log("[Course Generate] No quiz agent configured, using fallback");
    return {
      questions: Array.from({ length: questionCount }, (_, i) =>
        generateQuizQuestionFallback(moduleTitle, i)
      ),
    };
  }

  try {
    const response = await lyzrClient.chat(
      QUIZ_AGENT_ID,
      [{ role: "user", content: prompt }],
      `quiz-${Date.now()}-${retryCount}`  // Unique session per retry (bp-sdk pattern)
    );
    const quiz = parseAgentResponse<{ questions: Array<{ question: string; options: string[]; correctAnswer: number; explanation: string }> }>(response.message);

    // Quality gate: Auto-retry if quality check fails (bp-sdk pattern)
    if (!checkQuizQuality(quiz) && retryCount < MAX_RETRIES) {
      console.log(`[Course Generate] Quiz quality check failed (attempt ${retryCount + 1}/${MAX_RETRIES}), retrying...`);
      return generateQuizWithAgent(courseTitle, moduleTitle, lessonTopics, questionCount, level, retryCount + 1);
    }

    return quiz;
  } catch (error) {
    // Retry on error (bp-sdk pattern)
    if (retryCount < MAX_RETRIES) {
      console.log(`[Course Generate] Quiz agent error (attempt ${retryCount + 1}/${MAX_RETRIES}), retrying...`);
      return generateQuizWithAgent(courseTitle, moduleTitle, lessonTopics, questionCount, level, retryCount + 1);
    }
    console.error("[Course Generate] Quiz agent error after retries:", error);
    return {
      questions: Array.from({ length: questionCount }, (_, i) =>
        generateQuizQuestionFallback(moduleTitle, i)
      ),
    };
  }
}

// Generate module content using Lyzr agents (lesson + quiz separately)
async function generateModuleWithAgent(
  outline: CourseOutline,
  moduleIndex: number,
  retryCount = 0
): Promise<GeneratedModule> {
  const outlineModule = outline.modules[moduleIndex];

  console.log(`[Course Generate] Generating module ${moduleIndex + 1}: ${outlineModule.title}${retryCount > 0 ? ` (retry ${retryCount})` : ""}`);

  // Check if we should use separate agents or combined module agent
  const useSeparateAgents = LESSON_AGENT_ID && QUIZ_AGENT_ID;

  if (useSeparateAgents) {
    console.log("[Course Generate] Using separate lesson and quiz agents");

    // Generate lessons in parallel
    const lessonPromises = outlineModule.lessons.map((lessonTitle) =>
      generateLessonWithAgent(
        outline.title,
        outlineModule.title,
        lessonTitle,
        outline.audience,
        outline.level
      )
    );

    const lessons = await Promise.all(lessonPromises);

    // Generate quiz
    const quiz = await generateQuizWithAgent(
      outline.title,
      outlineModule.title,
      outlineModule.lessons,
      outlineModule.quizQuestions,
      outline.level
    );

    const module: GeneratedModule = {
      moduleIndex,
      lessons,
      quiz,
    };

    // Quality gate for separate agent path
    if (!checkModuleQuality(module) && retryCount < MAX_RETRIES) {
      console.log(`[Course Generate] Module quality check failed (attempt ${retryCount + 1}/${MAX_RETRIES}), retrying...`);
      return generateModuleWithAgent(outline, moduleIndex, retryCount + 1);
    }

    return module;
  }

  // Fallback to combined module agent
  const prompt = `Generate detailed training content for Module ${moduleIndex + 1} of the course "${outline.title}".

Module Title: ${outlineModule.title}
Lesson Topics: ${outlineModule.lessons.join(", ")}
Target Audience: ${outline.audience}
Difficulty Level: ${outline.level}
Context: This is for Tasco Insurance employees in Vietnam.

CRITICAL: Return ONLY a valid JSON object. No markdown code blocks, no explanation text, no \`\`\`json wrapper. Start directly with { and end with }.

Required JSON structure:
{
  "moduleIndex": ${moduleIndex},
  "lessons": [
    {
      "title": "Lesson Title",
      "content": "Detailed markdown content (500-800 words). Use \\n for line breaks. Include ## headers, bullet points, **bold** for key terms, and > blockquotes for tips."
    }
  ],
  "quiz": {
    "questions": [
      {
        "question": "Question text?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Why this answer is correct"
      }
    ]
  }
}

Generate ${outlineModule.lessons.length} lessons and ${outlineModule.quizQuestions} quiz questions.`;

  if (!MODULE_AGENT_ID) {
    console.log("[Course Generate] No module agent configured, using fallback");
    return generateModuleFallback(outline, moduleIndex);
  }

  try {
    const response = await lyzrClient.chat(
      MODULE_AGENT_ID,
      [{ role: "user", content: prompt }],
      `module-content-${Date.now()}-${retryCount}`  // Unique session per retry (bp-sdk pattern)
    );

    const module = parseAgentResponse<GeneratedModule>(response.message);

    // Quality gate: Auto-retry if quality check fails (bp-sdk pattern)
    if (!checkModuleQuality(module) && retryCount < MAX_RETRIES) {
      console.log(`[Course Generate] Module quality check failed (attempt ${retryCount + 1}/${MAX_RETRIES}), retrying...`);
      return generateModuleWithAgent(outline, moduleIndex, retryCount + 1);
    }

    return module;
  } catch (error) {
    // Retry on error (bp-sdk pattern)
    if (retryCount < MAX_RETRIES) {
      console.log(`[Course Generate] Module agent error (attempt ${retryCount + 1}/${MAX_RETRIES}), retrying...`);
      return generateModuleWithAgent(outline, moduleIndex, retryCount + 1);
    }
    console.error("[Course Generate] Module agent error after retries, using fallback:", error);
    return generateModuleFallback(outline, moduleIndex);
  }
}

// Fallback module generation (when agents not configured)
function generateModuleFallback(
  outline: CourseOutline,
  moduleIndex: number
): GeneratedModule {
  const outlineModule = outline.modules[moduleIndex];

  const lessons = outlineModule.lessons.map((lessonTitle, index) => ({
    title: lessonTitle,
    content: generateLessonContentFallback(lessonTitle, outline.title, index),
  }));

  const quiz = {
    questions: Array.from({ length: outlineModule.quizQuestions }, (_, i) =>
      generateQuizQuestionFallback(outlineModule.title, i)
    ),
  };

  return {
    moduleIndex,
    lessons,
    quiz,
  };
}

// Fallback lesson content generation
function generateLessonContentFallback(
  title: string,
  courseTitle: string,
  index: number
): string {
  const intros = [
    "Understanding this concept is crucial for success in the industry.",
    "This topic forms the foundation of professional practice.",
    "Mastering this skill will set you apart from your peers.",
  ];

  const tips = [
    "Always double-check your work before finalizing.",
    "Communication is key when working with clients.",
    "Stay updated with the latest industry regulations.",
  ];

  return `${intros[index % intros.length]}

${title} is an essential component of ${courseTitle.toLowerCase()}. In this lesson, we'll explore the key aspects that every professional needs to understand.

**Key Points:**
- Understanding the fundamentals builds a strong foundation
- Practical application reinforces theoretical knowledge
- Continuous learning is essential for career growth

The importance of ${title.toLowerCase()} cannot be overstated. Industry experts consistently emphasize this as a critical skill area.

**Best Practices:**
1. Start with the basics and build up gradually
2. Practice regularly with real-world scenarios
3. Seek feedback from experienced colleagues
4. Document your learnings for future reference

> **Pro Tip:** ${tips[index % tips.length]}

By completing this lesson, you'll have a solid understanding of ${title.toLowerCase()} and be ready to apply these concepts in your daily work.`;
}

// Fallback quiz question generation
function generateQuizQuestionFallback(
  moduleTitle: string,
  index: number
): {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
} {
  const questions = [
    {
      question: `What is the primary purpose of ${moduleTitle.toLowerCase()}?`,
      options: [
        "To improve customer satisfaction",
        "To ensure regulatory compliance",
        "To streamline internal processes",
        "All of the above",
      ],
      correctAnswer: 3,
      explanation: "All these factors are important considerations in this context.",
    },
    {
      question: `Which of the following is a key best practice for ${moduleTitle.toLowerCase()}?`,
      options: [
        "Skip documentation to save time",
        "Always verify information before proceeding",
        "Work in isolation without team input",
        "Avoid following established procedures",
      ],
      correctAnswer: 1,
      explanation: "Verification is essential for accuracy and compliance.",
    },
    {
      question: `When should you apply ${moduleTitle.toLowerCase()} principles?`,
      options: [
        "Only when supervisors are watching",
        "Only during audits",
        "Consistently in all relevant situations",
        "Only for high-value cases",
      ],
      correctAnswer: 2,
      explanation: "Consistent application ensures quality and compliance at all times.",
    },
    {
      question: `What is a common challenge in ${moduleTitle.toLowerCase()}?`,
      options: [
        "Keeping up with changing regulations",
        "Managing time effectively",
        "Communicating with stakeholders",
        "All of these are common challenges",
      ],
      correctAnswer: 3,
      explanation: "Professionals face multiple challenges that require ongoing attention.",
    },
    {
      question: `How can you improve your skills in ${moduleTitle.toLowerCase()}?`,
      options: [
        "Avoid training opportunities",
        "Ignore feedback from colleagues",
        "Seek continuous learning and practice",
        "Only rely on initial training",
      ],
      correctAnswer: 2,
      explanation: "Continuous improvement is key to professional development.",
    },
  ];

  return questions[index % questions.length];
}

// Revise outline using agent
async function reviseOutlineWithAgent(
  outline: CourseOutline,
  feedback: string
): Promise<CourseOutline> {
  const prompt = `Revise the following course outline based on user feedback.

Current Outline:
${JSON.stringify(outline, null, 2)}

User Feedback: "${feedback}"

Return ONLY a valid JSON object (no markdown, no explanation) with the revised outline using the same structure as the input. Make changes based on the feedback while keeping the overall structure intact.`;

  if (!OUTLINE_AGENT_ID) {
    console.log("[Course Generate] No outline agent configured, using fallback revision");
    return reviseOutlineFallback(outline, feedback);
  }

  try {
    const response = await lyzrClient.chat(
      OUTLINE_AGENT_ID,
      [{ role: "user", content: prompt }],
      `outline-revision-${Date.now()}`
    );

    const revisedOutline = parseAgentResponse<CourseOutline>(response.message);
    return revisedOutline;
  } catch (error) {
    console.error("[Course Generate] Revision agent error, using fallback:", error);
    return reviseOutlineFallback(outline, feedback);
  }
}

// Fallback outline revision
function reviseOutlineFallback(
  outline: CourseOutline,
  feedback: string
): CourseOutline {
  const revisedOutline = { ...outline };

  if (feedback.toLowerCase().includes("example") || feedback.toLowerCase().includes("practical")) {
    revisedOutline.modules = revisedOutline.modules.map((m) => ({
      ...m,
      lessons: [...m.lessons, "Practical examples and exercises"],
    }));
  }

  if (feedback.toLowerCase().includes("beginner") || feedback.toLowerCase().includes("simpl")) {
    revisedOutline.description += " This course uses simple language and clear explanations suitable for beginners.";
  }

  if (feedback.toLowerCase().includes("module") || feedback.toLowerCase().includes("add")) {
    revisedOutline.modules.push({
      title: "Additional Topics",
      lessons: [
        "Advanced considerations",
        "Future trends and developments",
        "Additional resources for continued learning",
      ],
      quizQuestions: 5,
    });
    revisedOutline.estimatedMinutes += 15;
  }

  return revisedOutline;
}

// Revise module using agent
async function reviseModuleWithAgent(
  outline: CourseOutline,
  module: GeneratedModule,
  feedback: string
): Promise<GeneratedModule> {
  const prompt = `Revise the following module content based on user feedback.

Course: ${outline.title}
Module: ${JSON.stringify(module, null, 2)}

User Feedback: "${feedback}"

Return ONLY a valid JSON object (no markdown, no explanation) with the revised module using the same structure as the input. Make changes based on the feedback while keeping the structure intact.`;

  if (!MODULE_AGENT_ID) {
    console.log("[Course Generate] No module agent configured, using fallback revision");
    return reviseModuleFallback(module, feedback);
  }

  try {
    const response = await lyzrClient.chat(
      MODULE_AGENT_ID,
      [{ role: "user", content: prompt }],
      `module-revision-${Date.now()}`
    );

    const revisedModule = parseAgentResponse<GeneratedModule>(response.message);
    return revisedModule;
  } catch (error) {
    console.error("[Course Generate] Module revision agent error, using fallback:", error);
    return reviseModuleFallback(module, feedback);
  }
}

// Fallback module revision
function reviseModuleFallback(
  module: GeneratedModule,
  feedback: string
): GeneratedModule {
  const revisedModule = { ...module };

  if (feedback.toLowerCase().includes("example")) {
    revisedModule.lessons = revisedModule.lessons.map((lesson) => ({
      ...lesson,
      content: lesson.content + "\n\n**Additional Example:**\nConsider a scenario where a client approaches you with a complex case. Here's how you would apply these principles step by step...",
    }));
  }

  if (feedback.toLowerCase().includes("quiz") || feedback.toLowerCase().includes("question")) {
    revisedModule.quiz.questions.push({
      question: "What is the most important takeaway from this module?",
      options: [
        "Technical skills alone are sufficient",
        "Both knowledge and practical application matter",
        "Speed is more important than accuracy",
        "Documentation is unnecessary",
      ],
      correctAnswer: 1,
      explanation: "Combining knowledge with practical application leads to the best outcomes.",
    });
  }

  return revisedModule;
}

// Polish requirement using Lyzr agent
async function polishRequirementWithAgent(requirement: string): Promise<string> {
  const prompt = `You are an instructional design expert for Tasco Insurance. Polish and enhance the following course requirement to make it more detailed and actionable.

Original requirement: "${requirement}"

Improve this requirement by:
1. Clarifying the target audience
2. Specifying the difficulty level
3. Adding specific learning objectives
4. Suggesting key topics to cover

Return ONLY the polished requirement as a plain text paragraph (2-4 sentences). Do not include any JSON, markdown formatting, or explanations.`;

  if (!OUTLINE_AGENT_ID) {
    console.log("[Course Generate] No outline agent configured, using fallback polish");
    return polishRequirementFallback(requirement);
  }

  try {
    const response = await lyzrClient.chat(
      OUTLINE_AGENT_ID,
      [{ role: "user", content: prompt }],
      `polish-requirement-${Date.now()}`
    );

    // Return the plain text response (remove any markdown if present)
    let polished = response.message.trim();
    polished = polished.replace(/```[a-z]*\n?/g, "").replace(/```\n?/g, "").trim();
    return polished;
  } catch (error) {
    console.error("[Course Generate] Polish agent error:", error);
    return polishRequirementFallback(requirement);
  }
}

// Fallback requirement polishing
function polishRequirementFallback(requirement: string): string {
  const lowerReq = requirement.toLowerCase();

  let level = "beginner";
  if (lowerReq.includes("advanced") || lowerReq.includes("senior")) {
    level = "advanced";
  } else if (lowerReq.includes("intermediate") || lowerReq.includes("experienced")) {
    level = "intermediate";
  }

  let audience = "employees";
  if (lowerReq.includes("agent") || lowerReq.includes("sales")) {
    audience = "sales agents";
  } else if (lowerReq.includes("underwriter")) {
    audience = "underwriters";
  } else if (lowerReq.includes("claim") || lowerReq.includes("adjuster")) {
    audience = "claims adjusters";
  }

  return `Create a ${level}-level training course for Tasco Insurance ${audience}. ${requirement}. The course should include practical examples, real-world case studies relevant to the Vietnamese insurance market, and interactive quiz questions to reinforce learning.`;
}

// Generate outline from polished requirement (free-form, with retries like bp-sdk)
async function generateOutlineFromRequirement(
  requirement: string,
  documentContent?: string | null,
  documentName?: string | null,
  retryCount = 0
): Promise<CourseOutline> {
  // Build prompt with optional document context
  let documentContext = "";
  if (documentContent) {
    documentContext = `

REFERENCE DOCUMENT${documentName ? ` (${documentName})` : ""}:
The following document has been provided as reference material for this course. Use its content, terminology, and concepts to create a more accurate and relevant course outline:

---
${documentContent.substring(0, 30000)}${documentContent.length > 30000 ? "\n\n[Document truncated for context...]" : ""}
---

Important: Base the course structure and topics on the content from this document. Extract key concepts, procedures, and information to organize into a logical learning progression.`;
  }

  const prompt = `Create a comprehensive training course outline based on this requirement:

"${requirement}"

This course is for Tasco Insurance employees in Vietnam.${documentContext}

CRITICAL: Return ONLY a valid JSON object. No markdown code blocks, no explanation text, no \`\`\`json wrapper. Start directly with { and end with }.

Required JSON structure:
{
  "title": "Course Title",
  "description": "2-3 sentence course description",
  "level": "beginner",
  "audience": "Target audience description",
  "estimatedMinutes": 45,
  "modules": [
    {
      "title": "Module 1 Title",
      "lessons": ["Lesson 1 topic", "Lesson 2 topic", "Lesson 3 topic"],
      "quizQuestions": 5
    }
  ]
}

Guidelines:
- Create 3-5 modules that progressively build knowledge
- Each module should have 3-4 lesson topics
- Module titles should be action-oriented
- Lesson topics should be specific and practical
- Content should be relevant to Vietnamese insurance market${documentContent ? "\n- Incorporate key information and structure from the reference document" : ""}`;

  if (!OUTLINE_AGENT_ID) {
    console.log("[Course Generate] No outline agent configured, using fallback");
    return generateOutlineFromRequirementFallback(requirement);
  }

  try {
    const response = await lyzrClient.chat(
      OUTLINE_AGENT_ID,
      [{ role: "user", content: prompt }],
      `course-outline-req-${Date.now()}-${retryCount}`  // Unique session per retry (bp-sdk pattern)
    );

    const outline = parseAgentResponse<CourseOutline>(response.message);

    // Quality gate: Auto-retry if quality check fails (bp-sdk pattern)
    if (!checkOutlineQuality(outline) && retryCount < MAX_RETRIES) {
      console.log(`[Course Generate] Requirement outline quality check failed (attempt ${retryCount + 1}/${MAX_RETRIES}), retrying...`);
      return generateOutlineFromRequirement(requirement, documentContent, documentName, retryCount + 1);
    }

    return outline;
  } catch (error) {
    // Retry on error (bp-sdk pattern)
    if (retryCount < MAX_RETRIES) {
      console.log(`[Course Generate] Requirement outline agent error (attempt ${retryCount + 1}/${MAX_RETRIES}), retrying...`);
      return generateOutlineFromRequirement(requirement, documentContent, documentName, retryCount + 1);
    }
    console.error("[Course Generate] Agent error after retries, using fallback:", error);
    return generateOutlineFromRequirementFallback(requirement);
  }
}

// Fallback outline generation from requirement
function generateOutlineFromRequirementFallback(requirement: string): CourseOutline {
  const lowerReq = requirement.toLowerCase();

  let level = "beginner";
  if (lowerReq.includes("advanced") || lowerReq.includes("senior")) {
    level = "advanced";
  } else if (lowerReq.includes("intermediate")) {
    level = "intermediate";
  }

  // Extract a topic from the requirement
  let topic = "Insurance Training";
  if (lowerReq.includes("motor")) topic = "Motor Insurance";
  else if (lowerReq.includes("health")) topic = "Health Insurance";
  else if (lowerReq.includes("claim")) topic = "Claims Processing";
  else if (lowerReq.includes("underwriting")) topic = "Underwriting";
  else if (lowerReq.includes("compliance")) topic = "Compliance";
  else if (lowerReq.includes("customer") || lowerReq.includes("service")) topic = "Customer Service";
  else if (lowerReq.includes("risk")) topic = "Risk Assessment";

  return {
    title: `${topic} Fundamentals`,
    description: requirement.substring(0, 200) + (requirement.length > 200 ? "..." : ""),
    level: level,
    audience: "Tasco Insurance employees",
    estimatedMinutes: level === "advanced" ? 90 : level === "intermediate" ? 60 : 45,
    modules: [
      {
        title: `Introduction to ${topic}`,
        lessons: [
          "Overview and importance",
          "Key terminology and concepts",
          "Industry context and trends",
        ],
        quizQuestions: 5,
      },
      {
        title: "Core Principles",
        lessons: [
          "Fundamental concepts",
          "Best practices",
          "Common scenarios",
        ],
        quizQuestions: 5,
      },
      {
        title: "Practical Application",
        lessons: [
          "Real-world examples",
          "Step-by-step procedures",
          "Tips for success",
        ],
        quizQuestions: 5,
      },
      {
        title: "Advanced Topics",
        lessons: [
          "Complex scenarios",
          "Problem-solving strategies",
          "Continuous improvement",
        ],
        quizQuestions: 5,
      },
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    console.log(`[Course Generate API] Action: ${action}`);

    switch (action) {
      case "polish": {
        const polished = await polishRequirementWithAgent(data.requirement);
        return NextResponse.json({ polished });
      }

      case "outline": {
        // Support both old (selections) and new (requirement) formats
        let outline: CourseOutline;
        if (data.requirement) {
          // Extract optional document content for context-aware generation
          const documentContent = data.documentContent || null;
          const documentName = data.documentName || null;
          if (documentContent) {
            console.log(`[Course Generate API] Using document context: ${documentName || "unnamed"} (${documentContent.length} chars)`);
          }
          outline = await generateOutlineFromRequirement(data.requirement, documentContent, documentName);
        } else if (data.selections) {
          outline = await generateOutlineWithAgent(data.selections);
        } else {
          return NextResponse.json({ error: "Missing requirement or selections" }, { status: 400 });
        }
        return NextResponse.json({ outline });
      }

      case "revise-outline": {
        const outline = await reviseOutlineWithAgent(data.outline, data.feedback);
        return NextResponse.json({ outline });
      }

      case "module": {
        const module = await generateModuleWithAgent(data.outline, data.moduleIndex);
        return NextResponse.json({ module });
      }

      case "revise-module": {
        const module = await reviseModuleWithAgent(
          data.outline,
          data.module,
          data.feedback
        );
        return NextResponse.json({ module });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[Course Generate API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
