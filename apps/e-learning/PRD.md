# E-Learning - Product Requirements Document

> INS3 | Tasco Insurance | LLM-Native

---

## Key Solutions Demonstrated

This demo addresses training scalability challenges for Tasco Insurance's rapidly growing workforce:

- **Instant Product Knowledge Q&A**: RAG-powered bot answers insurance product questions 24/7 - solving the "thin pool of qualified trainers" problem for 1,000+ personnel across 33 branches
- **Scalable Training Content**: AI helps convert PowerPoint slides to interactive learning content - reducing weeks-long SCORM conversion to hours
- **Consistent Knowledge Delivery**: Standardized training across all 30+ branches - addressing inconsistent quality from classroom-based learning
- **Self-Paced Learning**: New agents can learn anytime, anywhere - removing dependency on continuous offline classes
- **Interactive Knowledge Assessment**: AI-generated quizzes validate understanding of motor insurance (90% of revenue), regulations, and procedures
- **Progress Tracking**: Managers see team readiness and knowledge gaps - enabling data-driven training decisions

**Challenges Addressed:**
1. INS3 - AI E-Learning Factory (direct match)
2. Service Center Quality Assurance (Carpla - technical training for multi-brand service)
3. Moto Liability Insurance Chatbot (mapped - product knowledge Q&A pattern)

---

## Overview

**App:** e-learning
**Proposal:** INS3 - AI E-Learning Factory
**Business Unit:** Tasco Insurance
**Type:** LLM-Native
**Port:** 3004

---

## Problem Statement

Tasco Insurance needs to train a growing salesforce on products, regulations, and procedures. Traditional training is time-consuming, inconsistent, and doesn't scale. New agents take months to become productive.

---

## Solution

An AI-powered learning platform that provides personalized training, instant answers to product questions, and interactive knowledge assessment.

---

## Core Features

### MVP Features

- [ ] Product knowledge Q&A bot
- [ ] Training content library
- [ ] Interactive quizzes
- [ ] Progress tracking

### Future Features

- [ ] Personalized learning paths
- [ ] Video content integration
- [ ] Certification management
- [ ] Performance analytics

---

## User Stories

1. **As a** new agent, **I want to** learn about insurance products **so that** I can serve customers effectively.

2. **As a** trainer, **I want to** track learner progress **so that** I can identify knowledge gaps.

3. **As a** manager, **I want to** see team readiness **so that** I can plan deployments.

---

## Technical Requirements

### Lyzr Components

- **Agent Type:** RAG Agent
- **Knowledge Base:** Training materials
- **Features:** Chat, quiz generation, progress tracking

### Data Sources

- Product manuals
- Training guides
- Regulatory documents
- FAQs

---

## UI/UX Requirements

### Pages

1. **Learning Hub** - Course catalog
2. **Q&A Bot** - Ask anything interface
3. **Quizzes** - Knowledge assessment
4. **Progress** - Learning dashboard

### Components

- Course cards
- Chat interface
- Quiz components
- Progress bars

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Training completion rate | > 80% |
| Quiz pass rate | > 70% |
| Time to proficiency | -30% |

---

## Mapped Challenges

This app addresses:
1. **AI E-Learning Factory** (direct match)
2. **Service Center Quality Assurance** (Carpla - technical training)
3. **Moto Liability Insurance Chatbot** (mapped - product Q&A)

---

## Sample Queries

- "What are the coverage options for motor insurance?"
- "How do I process a claim for vehicle damage?"
- "What documents are required for policy renewal?"
