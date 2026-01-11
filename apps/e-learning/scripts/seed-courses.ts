/**
 * Seed script for E-Learning courses
 * Creates 3 courses with 3 modules each, 4 lessons per module, and quizzes
 *
 * Run with: bun run scripts/seed-courses.ts
 */

import {
  createCourse,
  updateCourse,
  incrementModuleCount,
  createModule,
  incrementLessonCount,
  createLesson,
  createQuiz,
  createQuizQuestion,
  incrementQuestionCount,
} from "@tasco/db";

const APP_ID = "e-learning";
const ENTITY_ID = "e-learning";
const CREATED_BY = "seed-script";

// ============================================
// Course Data Definitions
// ============================================

interface CourseDefinition {
  title: string;
  description: string;
  category:
    | "motor-insurance"
    | "health-insurance"
    | "claims-processing"
    | "underwriting"
    | "compliance"
    | "customer-service"
    | "sales"
    | "general";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  modules: ModuleDefinition[];
}

interface ModuleDefinition {
  title: string;
  description: string;
  estimatedMinutes: number;
  lessons: LessonDefinition[];
  quiz: QuizDefinition;
}

interface LessonDefinition {
  title: string;
  content: string;
  estimatedMinutes: number;
}

interface QuizDefinition {
  title: string;
  description: string;
  passingScore: number;
  questions: QuestionDefinition[];
}

interface QuestionDefinition {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// ============================================
// Course 1: Health Insurance Basics
// ============================================

const healthInsuranceCourse: CourseDefinition = {
  title: "Health Insurance Fundamentals",
  description:
    "A comprehensive introduction to health insurance products, coverage types, and customer service best practices for new agents.",
  category: "health-insurance",
  difficulty: "beginner",
  estimatedMinutes: 60,
  modules: [
    {
      title: "Introduction to Health Insurance",
      description:
        "Understanding the basics of health insurance and its importance in financial planning.",
      estimatedMinutes: 20,
      lessons: [
        {
          title: "What is Health Insurance?",
          content: `# What is Health Insurance?

Health insurance is a type of insurance coverage that pays for medical and surgical expenses incurred by the insured. It can either reimburse the insured for expenses or pay the care provider directly.

## Key Concepts

**Premium**: The amount you pay monthly or annually to maintain coverage.

**Deductible**: The amount you must pay out-of-pocket before insurance kicks in.

**Copayment**: A fixed amount you pay for covered services.

**Coinsurance**: Your share of the costs after meeting your deductible.

## Why Health Insurance Matters

1. **Financial Protection**: Medical costs can be devastating without coverage
2. **Access to Care**: Insurance often provides access to negotiated rates
3. **Preventive Care**: Most plans cover preventive services at no cost
4. **Peace of Mind**: Knowing you're protected in case of illness or injury

> **Pro Tip**: Always explain the difference between in-network and out-of-network providers to customers.`,
          estimatedMinutes: 5,
        },
        {
          title: "Types of Health Insurance Plans",
          content: `# Types of Health Insurance Plans

Understanding different plan types helps you recommend the right coverage for each customer.

## HMO (Health Maintenance Organization)

- Requires primary care physician (PCP) referrals
- Lower premiums, limited network
- Best for: Cost-conscious customers who don't mind referrals

## PPO (Preferred Provider Organization)

- No referral required for specialists
- Higher premiums, broader network
- Best for: Customers wanting flexibility

## EPO (Exclusive Provider Organization)

- No out-of-network coverage except emergencies
- Moderate premiums
- Best for: Customers who stay in-network

## HDHP (High Deductible Health Plan)

- Lower premiums, higher deductibles
- HSA-compatible
- Best for: Young, healthy customers or those maximizing tax benefits

## Key Comparison Points

| Feature | HMO | PPO | EPO | HDHP |
|---------|-----|-----|-----|------|
| Premium | Low | High | Medium | Lowest |
| Flexibility | Low | High | Medium | High |
| Referral Needed | Yes | No | No | No |`,
          estimatedMinutes: 5,
        },
        {
          title: "Understanding Coverage Terms",
          content: `# Understanding Coverage Terms

Mastering insurance terminology helps you communicate clearly with customers.

## Essential Terms

### Maximum Out-of-Pocket (MOOP)
The most you'll pay during a policy period. After reaching this amount, the plan pays 100% of covered services.

### Network
The facilities, providers, and suppliers your plan has contracted with to provide healthcare services.

### Prior Authorization
Approval required from the insurance company before certain services are covered.

### Formulary
A list of prescription drugs covered by the plan, organized by tiers.

## Coverage Categories

1. **Essential Health Benefits (EHBs)**
   - Ambulatory services
   - Emergency services
   - Hospitalization
   - Maternity and newborn care
   - Mental health services
   - Prescription drugs
   - Rehabilitative services
   - Laboratory services
   - Preventive and wellness services
   - Pediatric services

2. **Non-Essential Benefits**
   - Cosmetic procedures
   - Fertility treatments
   - Weight loss programs
   - Alternative medicine`,
          estimatedMinutes: 5,
        },
        {
          title: "The Role of an Insurance Agent",
          content: `# The Role of an Insurance Agent

As a health insurance agent, you serve as a trusted advisor helping customers navigate complex decisions.

## Core Responsibilities

### 1. Needs Assessment
- Understand customer's health status
- Assess family coverage needs
- Evaluate budget constraints
- Consider future life changes

### 2. Product Education
- Explain plan options clearly
- Compare costs and benefits
- Highlight exclusions and limitations
- Address common misconceptions

### 3. Application Assistance
- Guide through enrollment process
- Ensure accurate information
- Meet enrollment deadlines
- Follow up on pending applications

### 4. Ongoing Support
- Answer coverage questions
- Assist with claims issues
- Review coverage annually
- Update policies as needed

## Best Practices

✅ **Do:**
- Listen more than you talk
- Use simple, clear language
- Document all conversations
- Follow up promptly

❌ **Don't:**
- Pressure customers
- Make guarantees about claims
- Skip important disclosures
- Neglect compliance requirements`,
          estimatedMinutes: 5,
        },
      ],
      quiz: {
        title: "Introduction to Health Insurance Quiz",
        description: "Test your knowledge of health insurance basics.",
        passingScore: 70,
        questions: [
          {
            question: "Which type of plan requires a referral from a primary care physician to see a specialist?",
            options: ["PPO", "HMO", "EPO", "HDHP"],
            correctAnswer: 1,
            explanation:
              "HMO (Health Maintenance Organization) plans typically require referrals from your PCP to see specialists.",
          },
          {
            question: "What is the term for the amount you pay before insurance coverage begins?",
            options: ["Premium", "Copayment", "Deductible", "Coinsurance"],
            correctAnswer: 2,
            explanation:
              "A deductible is the amount you must pay out-of-pocket before your insurance starts covering costs.",
          },
          {
            question: "Which plan type typically has the LOWEST monthly premium?",
            options: ["HMO", "PPO", "EPO", "HDHP"],
            correctAnswer: 3,
            explanation:
              "High Deductible Health Plans (HDHP) typically have the lowest premiums in exchange for higher deductibles.",
          },
          {
            question: "What does MOOP stand for?",
            options: [
              "Medical Out-of-Pocket",
              "Maximum Out-of-Pocket",
              "Minimum Out-of-Pocket",
              "Monthly Out-of-Pocket",
            ],
            correctAnswer: 1,
            explanation:
              "MOOP stands for Maximum Out-of-Pocket, the most you'll pay during a policy period.",
          },
        ],
      },
    },
    {
      title: "Policy Features and Benefits",
      description: "Deep dive into health insurance policy features, benefits, and how to explain them to customers.",
      estimatedMinutes: 20,
      lessons: [
        {
          title: "Preventive Care Benefits",
          content: `# Preventive Care Benefits

Preventive care is one of the most valuable aspects of health insurance. Help customers understand what's covered at no additional cost.

## Covered Preventive Services

### For All Adults
- Annual wellness visit
- Blood pressure screening
- Cholesterol screening
- Depression screening
- Type 2 diabetes screening
- Immunizations (flu, hepatitis, tetanus, etc.)
- HIV screening
- Obesity screening and counseling

### For Women
- Breast cancer mammography (every 1-2 years for women 40+)
- Cervical cancer screening
- Contraception coverage
- Prenatal care
- Osteoporosis screening (60+)

### For Children
- Well-child visits
- Vision screening
- Hearing screening
- Developmental assessments
- Immunization schedule

## Important Distinctions

⚠️ **Preventive vs. Diagnostic**

| Preventive (Free) | Diagnostic (May Cost) |
|-------------------|----------------------|
| Annual mammogram for screening | Mammogram after finding a lump |
| Routine colonoscopy at 50 | Colonoscopy for symptoms |
| Annual physical | Visit for illness |

> **Selling Point**: Emphasize that preventive care can detect problems early, potentially saving thousands in treatment costs.`,
          estimatedMinutes: 5,
        },
        {
          title: "Prescription Drug Coverage",
          content: `# Prescription Drug Coverage

Understanding pharmacy benefits helps customers manage ongoing medication costs.

## Drug Tier System

Most plans organize medications into tiers:

### Tier 1: Generic Drugs
- Lowest cost
- Same active ingredients as brand-name
- Example: Generic metformin for diabetes

### Tier 2: Preferred Brand
- Moderate cost
- Brand-name drugs on preferred list
- Better negotiated rates

### Tier 3: Non-Preferred Brand
- Higher cost
- Brand-name drugs not on preferred list
- May have preferred alternatives

### Tier 4: Specialty Drugs
- Highest cost
- Complex medications
- Often require prior authorization
- May have quantity limits

## Key Concepts

**Step Therapy**: Requirement to try lower-cost drugs before more expensive options.

**Prior Authorization**: Pre-approval needed for certain medications.

**Quantity Limits**: Restrictions on how much medication you can get at once.

**Mail-Order Pharmacy**: Often 90-day supplies at reduced cost.

## Customer Questions to Ask

1. What medications are you currently taking?
2. Do you prefer brand-name or generic?
3. Would 90-day supplies work for you?
4. Are any of your medications injectable?`,
          estimatedMinutes: 5,
        },
        {
          title: "Mental Health and Wellness",
          content: `# Mental Health and Wellness Coverage

Mental health parity laws require equal coverage for mental health and physical health conditions.

## Covered Mental Health Services

### Outpatient Services
- Individual therapy
- Group therapy
- Psychiatric evaluations
- Medication management
- Intensive outpatient programs

### Inpatient Services
- Psychiatric hospitalization
- Residential treatment
- Detoxification programs
- Crisis stabilization

### Telehealth Options
- Virtual therapy sessions
- Remote psychiatric care
- App-based mental health tools
- 24/7 crisis hotlines

## Substance Use Disorder Coverage

- Assessment and evaluation
- Detoxification
- Inpatient rehabilitation
- Outpatient treatment
- Medication-assisted treatment (MAT)
- Support groups

## Wellness Programs

Many plans include additional wellness benefits:

✨ **Common Wellness Perks**
- Gym membership discounts
- Weight management programs
- Smoking cessation support
- Stress management resources
- Employee assistance programs (EAP)

## Talking Points for Customers

> "Mental health coverage is just as comprehensive as physical health coverage. You don't need to hesitate to use these benefits when you need them."`,
          estimatedMinutes: 5,
        },
        {
          title: "Emergency and Urgent Care",
          content: `# Emergency and Urgent Care

Help customers understand when to use different levels of care to manage costs and receive appropriate treatment.

## Emergency Room (ER)

**When to Use:**
- Life-threatening conditions
- Severe chest pain
- Difficulty breathing
- Heavy bleeding
- Severe burns
- Stroke symptoms
- Major trauma

**Cost Considerations:**
- Highest cost option
- Usually covered at any facility
- May have separate ER copay
- Could include facility + physician fees

## Urgent Care Centers

**When to Use:**
- Minor injuries (sprains, cuts)
- Mild illness (cold, flu, infection)
- After-hours care needed
- Primary care unavailable

**Cost Considerations:**
- Lower than ER
- Check if in-network
- May have flat copay
- Usually shorter wait times

## Telehealth/Virtual Care

**When to Use:**
- Minor symptoms
- Follow-up questions
- Prescription refills
- Mental health check-ins
- Skin conditions

**Cost Considerations:**
- Lowest cost option
- Often $0-$50 copay
- Available 24/7
- No travel required

## Decision Guide for Customers

| Symptoms | Recommended Care |
|----------|-----------------|
| Chest pain, stroke signs | ER (Call 911) |
| Broken bone, severe pain | ER |
| High fever, vomiting | Urgent Care |
| Ear infection, rash | Urgent Care |
| Cold symptoms, questions | Telehealth |
| Prescription refill | Telehealth |`,
          estimatedMinutes: 5,
        },
      ],
      quiz: {
        title: "Policy Features Quiz",
        description: "Test your understanding of health insurance policy features.",
        passingScore: 70,
        questions: [
          {
            question: "Which tier of prescription drugs typically has the LOWEST cost?",
            options: ["Tier 1 (Generic)", "Tier 2 (Preferred Brand)", "Tier 3 (Non-Preferred)", "Tier 4 (Specialty)"],
            correctAnswer: 0,
            explanation:
              "Tier 1 generic drugs have the lowest cost because they are not brand-name and are widely available.",
          },
          {
            question: "A routine annual mammogram for a woman over 40 is considered what type of service?",
            options: ["Diagnostic", "Preventive", "Emergency", "Elective"],
            correctAnswer: 1,
            explanation:
              "Routine screening mammograms are preventive care and are covered at no additional cost under most plans.",
          },
          {
            question: "Which care option typically has the LOWEST cost for minor symptoms?",
            options: ["Emergency Room", "Urgent Care", "Telehealth", "Specialist Visit"],
            correctAnswer: 2,
            explanation:
              "Telehealth visits typically have the lowest cost, often $0-$50, and can handle many minor health concerns.",
          },
          {
            question: "What requires you to try lower-cost drugs before your insurance covers more expensive options?",
            options: ["Prior Authorization", "Step Therapy", "Quantity Limits", "Tier System"],
            correctAnswer: 1,
            explanation:
              "Step therapy requires patients to try and fail on less expensive medications before the plan covers more costly alternatives.",
          },
        ],
      },
    },
    {
      title: "Customer Service Excellence",
      description: "Best practices for providing exceptional customer service in health insurance.",
      estimatedMinutes: 20,
      lessons: [
        {
          title: "Building Trust with Customers",
          content: `# Building Trust with Customers

Trust is the foundation of successful customer relationships in insurance sales.

## The Trust Equation

**Trust = (Credibility + Reliability + Intimacy) / Self-Interest**

### Credibility
- Know your products thoroughly
- Stay current on regulations
- Provide accurate information
- Admit when you don't know something

### Reliability
- Follow through on commitments
- Return calls promptly
- Meet deadlines consistently
- Be available when needed

### Intimacy
- Listen actively
- Remember personal details
- Show genuine concern
- Maintain confidentiality

### Low Self-Interest
- Put customer needs first
- Recommend appropriate products (not highest commission)
- Be transparent about limitations
- Disclose conflicts of interest

## First Impressions Matter

**In the first 30 seconds:**
- Smile (even on phone calls)
- Use the customer's name
- Express appreciation for their time
- State how you can help

## Building Long-Term Relationships

1. **Stay in Touch**
   - Birthday and holiday greetings
   - Policy renewal reminders
   - Important coverage updates

2. **Add Value**
   - Share relevant health tips
   - Notify about plan changes
   - Offer annual coverage reviews

3. **Be Accessible**
   - Provide multiple contact methods
   - Set clear response time expectations
   - Have backup coverage for absences`,
          estimatedMinutes: 5,
        },
        {
          title: "Handling Difficult Conversations",
          content: `# Handling Difficult Conversations

Some conversations are challenging. Here's how to navigate them professionally.

## Common Difficult Scenarios

### 1. Claim Denials
**Customer says:** "My claim was denied! This is ridiculous!"

**How to respond:**
- Acknowledge their frustration
- Gather specific claim details
- Review the denial reason
- Explain next steps (appeal process)
- Follow up until resolved

### 2. Premium Increases
**Customer says:** "Why did my rates go up so much?"

**How to respond:**
- Explain factors affecting rates
- Review their current coverage
- Explore cost-saving options
- Compare alternative plans
- Document the conversation

### 3. Coverage Gaps
**Customer says:** "I thought this was covered!"

**How to respond:**
- Express empathy
- Review policy documents together
- Explain the specific exclusion
- Discuss future coverage options
- Prevent future misunderstandings

## The HEARD Framework

**H** - Hear them out completely
**E** - Empathize with their situation
**A** - Apologize (when appropriate)
**R** - Resolve the issue
**D** - Diagnose and prevent recurrence

## De-escalation Techniques

✅ **Do:**
- Lower your voice
- Use "we" language
- Focus on solutions
- Take notes
- Offer choices

❌ **Don't:**
- Get defensive
- Interrupt
- Make excuses
- Use jargon
- Blame others`,
          estimatedMinutes: 5,
        },
        {
          title: "Explaining Complex Information",
          content: `# Explaining Complex Information

Insurance can be confusing. Great agents make it simple.

## The Explain-Check-Confirm Method

### 1. Explain Simply
- Use everyday language
- Avoid jargon
- Give real-life examples
- Break into small chunks

### 2. Check Understanding
- Ask "Does that make sense?"
- Watch for confused expressions
- Invite questions
- Pause for processing

### 3. Confirm Comprehension
- Ask them to summarize
- Provide written materials
- Offer follow-up call
- Send confirmation email

## Translating Insurance Terms

| Jargon | Plain English |
|--------|--------------|
| Premium | Your monthly payment |
| Deductible | What you pay before insurance kicks in |
| Coinsurance | Your share after the deductible |
| Out-of-pocket max | The most you'll ever pay in a year |
| Network | Doctors and hospitals in the plan |
| Formulary | The list of covered medications |

## Using Analogies

**Deductible Example:**
"Think of your deductible like the first $500 of car repairs. You pay that amount, then insurance covers the rest."

**Premium vs. Coverage:**
"It's like choosing between a cheap umbrella and an expensive one. The cheap one costs less but might not protect you as well in a storm."

## Visual Aids

- Use plan comparison charts
- Draw cost breakdowns
- Show network maps
- Create payment scenarios`,
          estimatedMinutes: 5,
        },
        {
          title: "Documentation and Compliance",
          content: `# Documentation and Compliance

Proper documentation protects you, your company, and your customers.

## What to Document

### Every Customer Interaction
- Date and time
- Communication method
- Topics discussed
- Recommendations made
- Customer decisions
- Follow-up items

### Key Information to Capture
- Customer's stated needs
- Health status disclosures
- Coverage questions asked
- Alternatives presented
- Reasons for choices made

## Compliance Requirements

### Pre-Sale Disclosures
- Agent licensing information
- Commission disclosure (if required)
- Plan limitations and exclusions
- Enrollment deadlines

### During Enrollment
- Verify customer information
- Confirm coverage selections
- Explain effective dates
- Provide Summary of Benefits

### Post-Sale Requirements
- Confirmation of enrollment
- ID card delivery
- Welcome materials
- First bill explanation

## Red Flags to Avoid

⚠️ **Never:**
- Guarantee claim approvals
- Promise specific benefits
- Make medical recommendations
- Share customer information
- Backdate applications
- Skip required disclosures

## Record Retention

| Document Type | Retention Period |
|--------------|------------------|
| Applications | 7+ years |
| Correspondence | 5+ years |
| Complaints | 7+ years |
| Training records | Duration of employment |

> **Remember**: "If it isn't documented, it didn't happen." Thorough notes protect everyone.`,
          estimatedMinutes: 5,
        },
      ],
      quiz: {
        title: "Customer Service Quiz",
        description: "Test your customer service knowledge.",
        passingScore: 70,
        questions: [
          {
            question: "According to the Trust Equation, what should be minimized to build trust?",
            options: ["Credibility", "Reliability", "Intimacy", "Self-Interest"],
            correctAnswer: 3,
            explanation:
              "The Trust Equation shows that trust increases when self-interest is minimized relative to credibility, reliability, and intimacy.",
          },
          {
            question: "What does the 'H' stand for in the HEARD framework for handling difficult conversations?",
            options: ["Help", "Hear", "Hope", "Handle"],
            correctAnswer: 1,
            explanation:
              "The H in HEARD stands for 'Hear them out completely' - letting the customer fully express their concern before responding.",
          },
          {
            question: "When explaining a deductible to a customer, which approach is BEST?",
            options: [
              "Use the exact policy language",
              "Refer them to the summary of benefits",
              "Use an everyday analogy they can relate to",
              "Skip the explanation and focus on premiums",
            ],
            correctAnswer: 2,
            explanation:
              "Using everyday analogies helps customers understand complex insurance concepts in familiar terms.",
          },
          {
            question: "How long should customer correspondence typically be retained?",
            options: ["1 year", "3 years", "5+ years", "Forever"],
            correctAnswer: 2,
            explanation:
              "Customer correspondence should typically be retained for at least 5 years for compliance and reference purposes.",
          },
        ],
      },
    },
  ],
};

// ============================================
// Course 2: Claims Processing Essentials
// ============================================

const claimsProcessingCourse: CourseDefinition = {
  title: "Claims Processing Essentials",
  description:
    "Master the fundamentals of insurance claims processing, from submission to settlement, with focus on efficiency and customer satisfaction.",
  category: "claims-processing",
  difficulty: "intermediate",
  estimatedMinutes: 75,
  modules: [
    {
      title: "Claims Fundamentals",
      description: "Understanding the claims lifecycle and key concepts.",
      estimatedMinutes: 25,
      lessons: [
        {
          title: "The Claims Process Overview",
          content: `# The Claims Process Overview

Understanding the end-to-end claims process is essential for efficient processing and customer satisfaction.

## The Claims Lifecycle

### 1. First Notice of Loss (FNOL)
- Customer reports the incident
- Initial information gathered
- Claim number assigned
- Acknowledgment sent

### 2. Claim Assignment
- Assigned to appropriate adjuster
- Complexity assessed
- Reserve amount set
- Investigation plan created

### 3. Investigation
- Documentation collected
- Statements taken
- Damage assessed
- Coverage verified

### 4. Evaluation
- Liability determined
- Damages calculated
- Settlement range established
- Negotiation (if needed)

### 5. Settlement
- Payment approved
- Check issued or repair authorized
- Customer notified
- Claim closed

## Key Performance Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Cycle Time | Industry varies | Customer satisfaction |
| Accuracy Rate | 98%+ | Prevents rework |
| Customer Satisfaction | 90%+ | Retention |
| Expense Ratio | Minimize | Profitability |

## Common Claim Types

**Auto Insurance:**
- Collision
- Comprehensive
- Liability
- Uninsured motorist

**Property Insurance:**
- Fire damage
- Water damage
- Theft
- Natural disasters

**Health Insurance:**
- Medical services
- Prescription drugs
- Hospital stays
- Preventive care`,
          estimatedMinutes: 6,
        },
        {
          title: "Documentation Requirements",
          content: `# Documentation Requirements

Proper documentation is critical for accurate claims processing.

## Essential Documents by Claim Type

### Auto Claims
- Police report (if applicable)
- Photos of damage
- Repair estimates
- Medical records (injury claims)
- Witness statements
- Driver's license
- Insurance card

### Property Claims
- Proof of loss form
- Photos/videos of damage
- Inventory list
- Receipts for damaged items
- Contractor estimates
- Building permits (if applicable)

### Health Claims
- Claim form
- Itemized bill
- Medical records
- Referral authorization
- Explanation of Benefits (EOB)
- Prescription receipts

## Documentation Best Practices

### For Customers
✅ Take photos immediately
✅ Keep all receipts
✅ Get multiple estimates
✅ Document conversations
✅ Report promptly

### For Processors
✅ Verify completeness
✅ Check for consistency
✅ Note discrepancies
✅ Request missing items promptly
✅ Maintain chronological order

## Red Flags in Documentation

⚠️ **Watch for:**
- Inconsistent dates
- Missing signatures
- Altered documents
- Excessive damage claims
- Pre-existing damage
- Unusual timing patterns

## Documentation Checklist Template

\`\`\`
□ Claim form completed
□ Coverage verified
□ Loss description detailed
□ Date of loss confirmed
□ Photos/evidence attached
□ Police report (if required)
□ Estimates obtained
□ Contact information verified
□ Prior claims checked
\`\`\``,
          estimatedMinutes: 6,
        },
        {
          title: "Coverage Verification",
          content: `# Coverage Verification

Verifying coverage is the foundation of accurate claims processing.

## The Verification Process

### Step 1: Policy Status Check
- Is policy active?
- Were premiums paid?
- Any lapses in coverage?
- Effective dates correct?

### Step 2: Coverage Analysis
- What coverages apply?
- What are the limits?
- Are there sublimits?
- Any endorsements?

### Step 3: Exclusions Review
- Standard exclusions
- Policy-specific exclusions
- Waiting periods
- Pre-existing conditions

### Step 4: Deductible Calculation
- Amount of deductible
- Has it been met?
- Per-occurrence vs. annual
- Multiple policies involved?

## Common Coverage Issues

### Auto Insurance
| Issue | Resolution |
|-------|------------|
| Named driver only | Check if permissive use applies |
| Business use exclusion | Verify vehicle use at time of loss |
| Territorial limits | Confirm incident location |

### Property Insurance
| Issue | Resolution |
|-------|------------|
| Vacancy clause | Verify occupancy status |
| Maintenance exclusion | Determine cause of damage |
| Flood exclusion | Identify water source |

### Health Insurance
| Issue | Resolution |
|-------|------------|
| Network status | Verify provider at time of service |
| Prior authorization | Check if obtained |
| Waiting period | Calculate enrollment date |

## Decision Documentation

Always document:
- Coverage provisions applied
- Exclusions considered
- Limits referenced
- Your coverage determination
- Rationale for decision`,
          estimatedMinutes: 6,
        },
        {
          title: "Setting Reserves",
          content: `# Setting Reserves

Accurate reserve setting is crucial for financial management and claim handling.

## What Are Reserves?

Reserves are the estimated amount needed to pay a claim. They represent:
- Anticipated indemnity payments
- Expected expenses (legal, investigation)
- Allocated loss adjustment expenses (ALAE)

## Reserve Setting Principles

### 1. Timeliness
- Set initial reserve within 24-48 hours
- Update as new information emerges
- Review regularly throughout claim life

### 2. Accuracy
- Base on available facts
- Use comparable claims data
- Consider all cost components
- Apply professional judgment

### 3. Consistency
- Follow company guidelines
- Use standard methodologies
- Document your reasoning
- Review for adequacy

## Reserve Components

### Indemnity Reserve
The expected payment for the actual loss:
- Property damage amount
- Medical costs
- Lost wages
- Pain and suffering (liability)

### Expense Reserve
The expected cost to handle the claim:
- Independent adjuster fees
- Legal costs
- Expert witness fees
- Investigation expenses

## Reserve Calculation Methods

**Average Method:**
Based on historical averages for similar claims.

**Individual Case Method:**
Detailed analysis of specific claim facts.

**Formula Method:**
Applying percentages to certain claim values.

## Reserve Documentation

Required for each reserve:
- Date set/modified
- Amount and components
- Basis for estimate
- Supporting documentation
- Adjuster signature

> **Warning**: Under-reserving affects company finances; over-reserving affects profitability. Accuracy is essential.`,
          estimatedMinutes: 7,
        },
      ],
      quiz: {
        title: "Claims Fundamentals Quiz",
        description: "Test your knowledge of claims fundamentals.",
        passingScore: 70,
        questions: [
          {
            question: "What is the FIRST step in the claims lifecycle?",
            options: ["Investigation", "Settlement", "First Notice of Loss (FNOL)", "Evaluation"],
            correctAnswer: 2,
            explanation:
              "First Notice of Loss (FNOL) is when the customer reports the incident and the claim process begins.",
          },
          {
            question: "Which document is typically required for an auto accident claim?",
            options: ["Building permit", "Prescription receipt", "Police report", "Inventory list"],
            correctAnswer: 2,
            explanation:
              "A police report is typically required for auto accident claims to document the incident details.",
          },
          {
            question: "What are reserves in insurance claims?",
            options: [
              "Extra coverage amounts",
              "Estimated amounts needed to pay claims",
              "Customer prepayments",
              "Policy deductibles",
            ],
            correctAnswer: 1,
            explanation:
              "Reserves are the estimated amounts set aside to pay anticipated claim costs including indemnity and expenses.",
          },
          {
            question: "When should an initial reserve be set?",
            options: ["Within a week", "Within 24-48 hours", "After settlement", "Only for large claims"],
            correctAnswer: 1,
            explanation:
              "Initial reserves should typically be set within 24-48 hours of receiving the claim to ensure proper financial tracking.",
          },
        ],
      },
    },
    {
      title: "Investigation Techniques",
      description: "Learn effective investigation methods for various claim types.",
      estimatedMinutes: 25,
      lessons: [
        {
          title: "Gathering Evidence",
          content: `# Gathering Evidence

Thorough evidence collection is the foundation of accurate claim evaluation.

## Types of Evidence

### Physical Evidence
- Damaged property
- Vehicle damage
- Building damage
- Personal belongings
- Safety equipment

### Documentary Evidence
- Policies and contracts
- Receipts and invoices
- Medical records
- Financial statements
- Maintenance records

### Testimonial Evidence
- Claimant statements
- Witness accounts
- Expert opinions
- Medical testimony
- Depositions

### Digital Evidence
- Photos and videos
- Security camera footage
- Electronic records
- GPS/telematics data
- Social media posts

## Evidence Collection Best Practices

### Timing
⏰ Collect evidence as soon as possible
⏰ Physical evidence can change or disappear
⏰ Witnesses' memories fade
⏰ Document current conditions

### Documentation
📝 Photograph everything
📝 Note date, time, location
📝 Identify who, what, when, where
📝 Preserve originals
📝 Maintain chain of custody

### Organization
📁 Create a master evidence list
📁 Cross-reference documents
📁 Use consistent naming conventions
📁 Secure sensitive information

## Scene Investigation Checklist

\`\`\`
□ Overall scene photos (all angles)
□ Close-up damage photos
□ Measurements taken
□ Weather conditions noted
□ Witness information obtained
□ Physical evidence preserved
□ Relevant documents collected
□ Timeline established
\`\`\``,
          estimatedMinutes: 6,
        },
        {
          title: "Interviewing Techniques",
          content: `# Interviewing Techniques

Effective interviewing extracts accurate information while maintaining professionalism.

## Interview Preparation

### Before the Interview
1. Review all available documents
2. Prepare your questions
3. Know the coverage issues
4. Plan your approach
5. Choose appropriate setting

### Setting the Stage
- Private, comfortable location
- Minimize distractions
- Allow adequate time
- Have recording equipment ready (with consent)

## Questioning Techniques

### Open-Ended Questions
Encourage detailed responses:
- "Tell me what happened..."
- "Describe the events leading up to..."
- "What did you notice about..."
- "How did you respond when..."

### Closed Questions
Confirm specific facts:
- "What time did this occur?"
- "Were there any witnesses?"
- "Did you report this to police?"
- "Is this your signature?"

### Probing Questions
Dig deeper:
- "Can you explain that further?"
- "What happened next?"
- "Why do you think that occurred?"
- "How did that make you feel?"

## Active Listening

👂 **Do:**
- Make eye contact
- Nod acknowledgment
- Take notes
- Allow silences
- Summarize understanding

🚫 **Don't:**
- Interrupt
- Rush responses
- Show bias
- Lead the witness
- React emotionally

## Handling Difficult Interviewees

| Behavior | Technique |
|----------|-----------|
| Evasive | Ask direct questions |
| Hostile | Stay calm, empathize |
| Verbose | Redirect politely |
| Confused | Simplify questions |
| Emotional | Allow breaks |

## Documentation

After every interview:
- Summarize key points
- Note inconsistencies
- Document demeanor
- Record follow-up needs
- Secure signed statement`,
          estimatedMinutes: 6,
        },
        {
          title: "Fraud Detection",
          content: `# Fraud Detection

Identifying potentially fraudulent claims protects the company and honest policyholders.

## Types of Insurance Fraud

### Hard Fraud
Deliberate, planned schemes:
- Staged accidents
- Arson for profit
- Fake injuries
- Phantom employees
- Death fraud

### Soft Fraud
Exaggeration or opportunism:
- Inflating damage estimates
- Adding unrelated damage
- Exaggerating injuries
- Billing for services not rendered
- Misrepresenting facts

## Red Flags Checklist

### Timing Issues
🚩 Claim shortly after policy inception
🚩 Coverage increase before loss
🚩 Loss near policy expiration
🚩 Friday afternoon accidents
🚩 Claims around financial difficulties

### Documentation Concerns
🚩 Illegible or altered documents
🚩 No police report for significant loss
🚩 Receipts for items not matching claim
🚩 Estimates significantly higher than damage
🚩 Conflicting accounts

### Behavioral Indicators
🚩 Overly pushy for quick settlement
🚩 Extensive knowledge of claim process
🚩 Reluctant to provide information
🚩 Changing stories
🚩 Unable to provide witnesses

## Investigation Actions

When fraud is suspected:

1. **Do Not Accuse**
   - Gather facts neutrally
   - Document observations
   - Involve SIU when appropriate

2. **Conduct Thorough Investigation**
   - Request additional documentation
   - Perform database checks
   - Interview all parties
   - Inspect physical evidence

3. **Document Everything**
   - Create detailed timeline
   - Note inconsistencies
   - Preserve all evidence
   - Maintain confidentiality

4. **Follow Company Procedures**
   - Report to Special Investigations Unit (SIU)
   - Comply with regulatory requirements
   - Coordinate with legal if needed

## Fraud Prevention

💡 **Best Practices:**
- Verify information at FNOL
- Use fraud detection software
- Cross-reference databases
- Train for red flag recognition
- Establish tip lines`,
          estimatedMinutes: 7,
        },
        {
          title: "Working with Experts",
          content: `# Working with Experts

Engaging appropriate experts ensures accurate claim evaluation.

## Types of Experts

### Medical Experts
- Independent Medical Examiners (IME)
- Medical specialists
- Life care planners
- Vocational rehabilitation experts
- Medical record reviewers

### Engineering Experts
- Accident reconstructionists
- Structural engineers
- Electrical engineers
- Fire investigators
- Mechanical experts

### Financial Experts
- Forensic accountants
- Business valuation specialists
- Economic loss experts
- Tax professionals

### Other Specialists
- Appraisers
- Meteorologists
- Digital forensics experts
- Handwriting analysts
- Private investigators

## When to Engage Experts

Consider expert involvement when:
- Technical knowledge needed
- Liability is disputed
- Damages are complex
- Fraud is suspected
- Litigation is likely
- Regulatory requirements apply

## Managing Expert Relationships

### Selection
- Verify credentials
- Check references
- Review past work
- Confirm availability
- Understand fees

### Engagement
- Provide clear scope
- Share relevant documents
- Set deadlines
- Establish communication protocol
- Maintain confidentiality

### Communication
- Regular status updates
- Clear questions
- Documented conversations
- Written reports
- Deposition preparation

## Expert Report Requirements

A quality expert report includes:
- Expert's qualifications
- Materials reviewed
- Methods used
- Findings and conclusions
- Supporting evidence
- Signature and date

## Cost Management

💰 **Control expert costs:**
- Define scope clearly
- Set budget expectations
- Request estimates
- Monitor hours
- Negotiate rates
- Use panel experts when possible`,
          estimatedMinutes: 6,
        },
      ],
      quiz: {
        title: "Investigation Techniques Quiz",
        description: "Test your investigation skills.",
        passingScore: 70,
        questions: [
          {
            question: "Which type of question encourages detailed responses in an interview?",
            options: ["Closed questions", "Yes/No questions", "Open-ended questions", "Leading questions"],
            correctAnswer: 2,
            explanation:
              "Open-ended questions like 'Tell me what happened...' encourage interviewees to provide detailed, narrative responses.",
          },
          {
            question: "What type of fraud involves deliberately staged incidents for financial gain?",
            options: ["Soft fraud", "Hard fraud", "Opportunistic fraud", "Minor fraud"],
            correctAnswer: 1,
            explanation:
              "Hard fraud involves deliberate, planned schemes such as staged accidents, arson, or fake injuries.",
          },
          {
            question: "When you suspect fraud, what should you do FIRST?",
            options: [
              "Confront the claimant",
              "Deny the claim immediately",
              "Gather facts neutrally without accusing",
              "Report to police",
            ],
            correctAnswer: 2,
            explanation:
              "When fraud is suspected, the first step is to gather facts neutrally and document observations without making accusations.",
          },
          {
            question: "Which expert would you engage for a disputed accident reconstruction?",
            options: [
              "Forensic accountant",
              "Accident reconstructionist",
              "Medical examiner",
              "Business valuation specialist",
            ],
            correctAnswer: 1,
            explanation:
              "Accident reconstructionists are engineering experts who specialize in analyzing and reconstructing how accidents occurred.",
          },
        ],
      },
    },
    {
      title: "Settlement and Closure",
      description: "Mastering the settlement process and effective claim closure.",
      estimatedMinutes: 25,
      lessons: [
        {
          title: "Evaluating Damages",
          content: `# Evaluating Damages

Accurate damage evaluation is essential for fair settlements.

## Types of Damages

### Economic Damages
Quantifiable financial losses:
- Medical expenses (past and future)
- Lost wages
- Property repair/replacement
- Loss of earning capacity
- Out-of-pocket expenses

### Non-Economic Damages
Subjective losses:
- Pain and suffering
- Emotional distress
- Loss of enjoyment of life
- Loss of consortium
- Disfigurement

### Punitive Damages
Punishment for egregious conduct:
- Rare in insurance claims
- Requires malicious or reckless behavior
- Subject to legal limits

## Damage Calculation Methods

### Property Damage

**Actual Cash Value (ACV)**
\`\`\`
ACV = Replacement Cost - Depreciation
\`\`\`

**Replacement Cost Value (RCV)**
\`\`\`
RCV = Cost to replace with like kind and quality
\`\`\`

### Medical Expenses
- Review itemized bills
- Check for reasonableness
- Verify treatment necessity
- Consider future care needs

### Lost Wages
- Obtain employer verification
- Calculate daily/hourly rate
- Include benefits and bonuses
- Project future losses

## Depreciation Schedules

| Item Type | Useful Life | Annual Depreciation |
|-----------|-------------|---------------------|
| Electronics | 5 years | 20% |
| Appliances | 10 years | 10% |
| Furniture | 15 years | 6.67% |
| Roofing | 20 years | 5% |
| HVAC | 15 years | 6.67% |

## Documentation Required

For each damage component, document:
- Method used
- Sources referenced
- Calculations performed
- Assumptions made
- Supporting evidence`,
          estimatedMinutes: 6,
        },
        {
          title: "Negotiation Strategies",
          content: `# Negotiation Strategies

Effective negotiation leads to fair settlements for all parties.

## Preparation

### Know Your Position
- Coverage limits and issues
- Liability assessment
- Damage valuation
- Settlement authority
- Comparable settlements

### Understand the Other Party
- Their priorities
- Constraints they face
- Decision-making process
- Emotional factors
- Time pressures

## Negotiation Approaches

### Collaborative (Win-Win)
- Focus on interests, not positions
- Generate multiple options
- Build rapport
- Find mutual benefit
- Maintain long-term relationships

### Competitive (Win-Lose)
- Appropriate when:
  - Other party is unreasonable
  - Clear liability issues exist
  - Fraud is suspected
  - Litigation is likely

## Key Techniques

### Anchoring
Make the first offer when you have strong position:
- Sets the negotiation range
- Psychological advantage
- But requires solid justification

### Bracketing
If they make first offer:
- Respond to create desired midpoint
- Example: They demand $50K, you want $30K, offer $10K

### Concession Strategy
- Start with room to negotiate
- Make decreasing concessions
- Get something for each give
- Document all offers

## Communication Skills

✅ **Effective Phrases:**
- "Help me understand..."
- "What if we considered..."
- "Based on the evidence..."
- "I can offer... if you can..."

❌ **Avoid:**
- "Take it or leave it"
- "That's ridiculous"
- "We never pay that much"
- "You should be grateful"

## Breaking Deadlocks

When negotiations stall:
1. Take a break
2. Bring in fresh perspective
3. Reframe the issues
4. Focus on objective criteria
5. Consider mediation
6. Explore creative solutions`,
          estimatedMinutes: 6,
        },
        {
          title: "Settlement Documentation",
          content: `# Settlement Documentation

Proper documentation protects all parties and ensures compliance.

## Settlement Components

### Release Agreement
Key elements:
- Parties identified
- Claim described
- Settlement amount
- Release language
- Signatures and dates
- Notarization (if required)

### Payment Authorization
- Payee information
- Payment amount
- Payment method
- Tax reporting requirements
- Lien considerations

### Closing Letter
- Summary of settlement
- What is/isn't covered
- Future claims statement
- Contact information
- Relevant deadlines

## Release Types

### General Release
- Releases all claims
- Known and unknown
- Past, present, future
- All parties

### Limited Release
- Specific claims only
- Preserves other rights
- May be reopenable
- Specific time periods

### Partial Payment Agreement
- Payment for portion of claim
- Without prejudice
- Reserves right to pursue balance
- Interim solution

## Compliance Considerations

### Medicare/Medicaid
- Report certain settlements
- Set aside funds if required
- Verify status before payment
- Document compliance

### Workers' Compensation
- Subrogation considerations
- Lien resolution
- Employer notification
- State-specific requirements

### Tax Reporting
- 1099 requirements
- Taxable vs. non-taxable portions
- Attorney fee reporting
- Record keeping

## Quality Control

Before closing, verify:
\`\`\`
□ Settlement within authority
□ All releases signed
□ Liens resolved
□ Subrogation addressed
□ Payment processed
□ File documented
□ Reserves adjusted
□ Customer notified
□ Reporting completed
\`\`\``,
          estimatedMinutes: 7,
        },
        {
          title: "Claim File Management",
          content: `# Claim File Management

Organized file management ensures efficiency and compliance.

## File Organization

### Standard Sections
1. **Index/Summary**
   - Claim overview
   - Key dates
   - Reserve history
   - Payment summary

2. **Coverage**
   - Policy documents
   - Coverage letters
   - Reservation of rights

3. **Investigation**
   - Reports
   - Photos/videos
   - Statements
   - Expert opinions

4. **Correspondence**
   - Internal memos
   - External letters
   - Emails

5. **Financial**
   - Payment records
   - Invoices
   - Reserve notes

6. **Legal**
   - Suit papers
   - Court documents
   - Attorney correspondence

## Documentation Standards

### Diary Notes
Every note should include:
- Date and time
- Author identification
- Action taken or planned
- Rationale for decisions
- Follow-up dates

### Activity Log
\`\`\`
Date       | Activity              | Next Action    | Due Date
-----------|----------------------|----------------|----------
01/15/2025 | FNOL received        | Contact insured| 01/16
01/16/2025 | Spoke with insured   | Schedule insp. | 01/18
01/18/2025 | Inspection completed | Get estimate   | 01/22
\`\`\`

## File Closure

### Pre-Closure Checklist
□ All payments made
□ Reserves at zero
□ Subrogation complete
□ Recovery documented
□ File review completed
□ Compliance verified
□ All documents filed
□ Closure letter sent

### Post-Closure
- Retention per schedule
- Audit accessibility
- Reopening procedures
- Archive protocols

## Quality Metrics

Monitor these file quality indicators:
| Metric | Target |
|--------|--------|
| Documentation completeness | 100% |
| Diary compliance | 95%+ |
| Reserve accuracy | ±5% |
| Cycle time | Per standards |
| Customer satisfaction | 90%+ |`,
          estimatedMinutes: 6,
        },
      ],
      quiz: {
        title: "Settlement and Closure Quiz",
        description: "Test your knowledge of settlement and closure procedures.",
        passingScore: 70,
        questions: [
          {
            question: "What formula is used to calculate Actual Cash Value (ACV)?",
            options: [
              "ACV = Replacement Cost + Depreciation",
              "ACV = Replacement Cost - Depreciation",
              "ACV = Market Value x Age",
              "ACV = Original Cost - Repairs",
            ],
            correctAnswer: 1,
            explanation:
              "Actual Cash Value is calculated by subtracting depreciation from the replacement cost of an item.",
          },
          {
            question: "What negotiation technique involves making the first offer to set the range?",
            options: ["Bracketing", "Anchoring", "Concession", "Mirroring"],
            correctAnswer: 1,
            explanation:
              "Anchoring involves making the first offer to set the psychological range for negotiation, giving you an advantage when you have a strong position.",
          },
          {
            question: "Which type of release covers only specific claims and preserves other rights?",
            options: ["General Release", "Limited Release", "Full Release", "Universal Release"],
            correctAnswer: 1,
            explanation:
              "A Limited Release covers only specific claims and may preserve the claimant's right to pursue other claims or balances.",
          },
          {
            question: "What should reserves be at when closing a claim file?",
            options: ["Original amount", "Zero", "Settlement amount", "Policy limit"],
            correctAnswer: 1,
            explanation:
              "When closing a claim file, reserves should be adjusted to zero since all anticipated payments have been made.",
          },
        ],
      },
    },
  ],
};

// ============================================
// Course 3: Underwriting Principles
// ============================================

const underwritingCourse: CourseDefinition = {
  title: "Underwriting Principles",
  description:
    "Learn the fundamentals of insurance underwriting, risk assessment, and pricing strategies for profitable portfolio management.",
  category: "underwriting",
  difficulty: "advanced",
  estimatedMinutes: 90,
  modules: [
    {
      title: "Risk Assessment Fundamentals",
      description: "Understanding and evaluating insurance risks systematically.",
      estimatedMinutes: 30,
      lessons: [
        {
          title: "The Underwriting Process",
          content: `# The Underwriting Process

Underwriting is the process of evaluating risk to determine insurability and appropriate pricing.

## The Underwriting Function

### Purpose
- Select and classify risks
- Determine appropriate premiums
- Maintain profitable portfolio
- Protect against adverse selection

### Key Principles
1. **Equity**: Similar risks pay similar premiums
2. **Adequacy**: Premiums cover expected losses + expenses
3. **Profitability**: Generate acceptable returns
4. **Growth**: Support business objectives

## The Underwriting Workflow

### 1. Application Receipt
- Review completeness
- Verify information
- Check for red flags
- Identify missing data

### 2. Risk Assessment
- Analyze exposures
- Evaluate hazards
- Consider loss history
- Assess mitigation measures

### 3. Decision Making
- Accept at standard rates
- Accept with modifications
- Decline the risk
- Request additional information

### 4. Policy Issuance
- Document decisions
- Set terms and conditions
- Communicate with agent
- Issue policy

## Risk Selection Criteria

| Factor | Considerations |
|--------|---------------|
| Moral Hazard | Character, integrity, claims history |
| Physical Hazard | Property condition, location, use |
| Financial | Premium payment ability, coverage adequacy |
| Legal | Insurable interest, compliance |

## Underwriting Authority

Levels of authority based on:
- Risk complexity
- Premium size
- Deviation from guidelines
- Special coverage requests
- Experience of underwriter`,
          estimatedMinutes: 8,
        },
        {
          title: "Risk Classification",
          content: `# Risk Classification

Proper classification ensures fair treatment and accurate pricing.

## Classification Systems

### Personal Lines

**Auto Insurance Classes:**
- Age and experience
- Driving record
- Vehicle type
- Usage (commute, pleasure)
- Geographic location
- Credit score (where permitted)

**Homeowners Classes:**
- Construction type
- Location (protection class)
- Age of home
- Coverage amount
- Claims history
- Security features

### Commercial Lines

**Business Classification:**
- Industry/SIC code
- Operations description
- Size (payroll, revenues)
- Experience modification
- Years in business

## Rating Factors

### Objective Factors
Measurable, verifiable data:
- Age
- Location
- Property values
- Payroll
- Square footage

### Subjective Factors
Require judgment:
- Management quality
- Safety culture
- Financial stability
- Reputation

## Class Rating vs. Individual Rating

| Class Rating | Individual Rating |
|--------------|-------------------|
| Based on group statistics | Based on specific risk |
| Standard premiums | Customized premiums |
| Efficient processing | Time-intensive |
| Less precise | More accurate |
| Small to medium risks | Large, complex risks |

## Schedule Rating

Adjustment for specific characteristics:

**Debits (+)** increase premium:
- Poor housekeeping
- Inadequate safety
- High-risk processes
- Remote location

**Credits (-)** reduce premium:
- Safety programs
- Automatic sprinklers
- Security systems
- Favorable loss experience

## Experience Rating

\`\`\`
Experience Mod = (Actual Losses / Expected Losses) × Weight Factor

Mod < 1.00 = Better than average
Mod = 1.00 = Average
Mod > 1.00 = Worse than average
\`\`\``,
          estimatedMinutes: 7,
        },
        {
          title: "Information Sources",
          content: `# Information Sources

Comprehensive information gathering enables sound underwriting decisions.

## Application Data

### Direct Application
- Personal information
- Coverage requested
- Property descriptions
- Loss history (self-reported)
- Financial data

### Agent Submissions
- Agent recommendations
- Market knowledge
- Relationship history
- Supporting documentation

## Third-Party Sources

### Motor Vehicle Reports (MVRs)
Information includes:
- License status
- Moving violations
- Accidents
- Suspensions/revocations
- Points

### Credit Information
Used for (where permitted):
- Payment history
- Debt levels
- Credit utilization
- Public records
- Credit score

### CLUE Reports
Comprehensive Loss Underwriting Exchange:
- Prior claims history
- All carriers
- Property and auto
- Seven-year history

### Building Inspections
Evaluates:
- Construction quality
- Systems condition
- Safety features
- Code compliance
- Maintenance status

## Commercial Sources

### Financial Statements
Review for:
- Profitability trends
- Debt ratios
- Cash flow
- Growth patterns
- Financial stability

### Industry Data
- Loss experience
- Trends
- Regulatory changes
- Emerging risks

### Public Records
- Court filings
- Regulatory actions
- Business registrations
- Property records

## Ordering Information

| Report | When to Order | Typical Cost |
|--------|--------------|--------------|
| MVR | All auto risks | $ |
| CLUE | New business | $ |
| Credit | Where permitted | $ |
| Inspection | High value risks | $$ |
| Financial | Commercial risks | $$$ |

## Privacy Considerations

- Obtain proper consent
- Use only for underwriting purposes
- Protect confidential information
- Comply with FCRA requirements
- Provide adverse action notices`,
          estimatedMinutes: 8,
        },
        {
          title: "Loss Analysis",
          content: `# Loss Analysis

Understanding loss patterns drives better risk selection and pricing.

## Loss Ratio Fundamentals

### Loss Ratio Formula
\`\`\`
Loss Ratio = (Incurred Losses / Earned Premium) × 100

Example:
Losses = $700,000
Premium = $1,000,000
Loss Ratio = 70%
\`\`\`

### Combined Ratio
\`\`\`
Combined Ratio = Loss Ratio + Expense Ratio

Example:
Loss Ratio = 70%
Expense Ratio = 28%
Combined Ratio = 98%

< 100% = Underwriting profit
> 100% = Underwriting loss
\`\`\`

## Loss Trend Analysis

### Frequency Analysis
- Number of claims per exposure unit
- Trending over time
- Comparison to benchmarks
- Identifies emerging patterns

### Severity Analysis
- Average claim size
- Distribution of claim sizes
- Large loss impacts
- Inflation effects

## Analyzing Individual Risk Losses

### Questions to Ask
1. What caused each loss?
2. Were losses preventable?
3. Has the risk changed?
4. What mitigation exists now?
5. Is the pattern continuing?

### Red Flags
🚩 Increasing frequency
🚩 Large/catastrophic losses
🚩 Same cause repeated
🚩 No corrective action
🚩 Suspicious timing

## Portfolio Analysis

### Segment Performance
| Segment | Premium | Losses | LR |
|---------|---------|--------|-----|
| Class A | $5M | $3M | 60% |
| Class B | $3M | $2.4M | 80% |
| Class C | $2M | $2.2M | 110% |

### Actions Based on Analysis
- Profitable segments: Grow
- Marginal segments: Review pricing
- Unprofitable segments: Restrict or exit

## Predictive Indicators

Using data to predict future losses:
- Past claims history
- Credit-based insurance scores
- Driving behavior (telematics)
- Property condition scores
- Business financial health`,
          estimatedMinutes: 7,
        },
      ],
      quiz: {
        title: "Risk Assessment Quiz",
        description: "Test your understanding of risk assessment fundamentals.",
        passingScore: 70,
        questions: [
          {
            question: "What is the purpose of schedule rating?",
            options: [
              "To set policy renewal dates",
              "To adjust premiums for specific risk characteristics",
              "To schedule underwriting reviews",
              "To create payment schedules",
            ],
            correctAnswer: 1,
            explanation:
              "Schedule rating allows underwriters to adjust premiums up (debits) or down (credits) based on specific characteristics of an individual risk.",
          },
          {
            question: "What does a combined ratio below 100% indicate?",
            options: [
              "Underwriting loss",
              "Break-even performance",
              "Underwriting profit",
              "Inadequate premium",
            ],
            correctAnswer: 2,
            explanation:
              "A combined ratio below 100% indicates an underwriting profit, meaning premium collected exceeds losses and expenses.",
          },
          {
            question: "Which report provides a seven-year claims history across all insurance carriers?",
            options: ["MVR", "Credit Report", "CLUE Report", "Financial Statement"],
            correctAnswer: 2,
            explanation:
              "CLUE (Comprehensive Loss Underwriting Exchange) provides a seven-year claims history for property and auto across all insurance carriers.",
          },
          {
            question: "An experience modification factor of 1.25 indicates what?",
            options: [
              "25% better than average",
              "25% worse than average",
              "Average performance",
              "Not enough data",
            ],
            correctAnswer: 1,
            explanation:
              "An experience mod above 1.00 indicates worse-than-average loss experience. A mod of 1.25 means 25% worse than the expected average.",
          },
        ],
      },
    },
    {
      title: "Pricing and Premium Calculation",
      description: "Understanding how insurance premiums are determined.",
      estimatedMinutes: 30,
      lessons: [
        {
          title: "Rating Methodologies",
          content: `# Rating Methodologies

Understanding how premiums are calculated enables better pricing decisions.

## Rate Components

### Pure Premium
The expected cost of losses:
\`\`\`
Pure Premium = Expected Losses / Exposure Units
\`\`\`

### Gross Premium
Total premium charged:
\`\`\`
Gross Premium = Pure Premium + Expense Loading + Profit Margin
\`\`\`

### Expense Components
- Acquisition costs (commissions)
- Administrative costs
- Claims handling
- Taxes and fees
- Overhead

## Manual Rating

### Class Rate × Exposure
\`\`\`
Premium = Rate × Exposure Units

Examples:
Auto: Rate × Number of vehicles
Property: Rate per $100 × Property value
Liability: Rate per $1,000 × Payroll
\`\`\`

### Minimum Premium
- Ensures administrative cost recovery
- Applies to small risks
- Set per coverage type

## Modified Rating

### Schedule Modifications
Base premium adjusted by credits/debits:
\`\`\`
Modified Premium = Base Premium × (1 + Modification %)

Example:
Base = $10,000
Safety credit = -10%
Modified = $10,000 × 0.90 = $9,000
\`\`\`

### Experience Modifications
For risks with credible loss history:
\`\`\`
Modified Premium = Manual Premium × Experience Mod

Example:
Manual = $50,000
E-Mod = 0.85
Modified = $50,000 × 0.85 = $42,500
\`\`\`

## Composite Rating

### Rating Plans
For complex risks, combine multiple approaches:
- Manual rates for standard exposures
- Individual rating for unique exposures
- Negotiated rates for large accounts

### Package Policies
Single premium for multiple coverages:
- Convenience
- Possible discount
- Simplified administration`,
          estimatedMinutes: 8,
        },
        {
          title: "Rate Development",
          content: `# Rate Development

Understanding how rates are developed helps explain pricing to agents and customers.

## Rate Making Process

### 1. Data Collection
- Premium data
- Loss data
- Exposure data
- Market data

### 2. Data Organization
- Group by class
- Adjust for development
- Trend to current period
- Remove anomalies

### 3. Rate Indication
Calculate needed rate change:
\`\`\`
Indicated Rate Change =
(Expected Loss Ratio / Target Loss Ratio) - 1

Example:
Expected LR = 75%
Target LR = 65%
Change = (75% / 65%) - 1 = +15.4%
\`\`\`

### 4. Implementation
- Regulatory filing
- System updates
- Agent communication
- Effective date

## Loss Development

### Development Factors
Losses develop over time:
\`\`\`
Year 1: 60% reported
Year 2: 85% reported
Year 3: 95% reported
Year 4: 99% reported
Year 5: 100% ultimate
\`\`\`

### Development Application
\`\`\`
Ultimate Losses = Reported Losses × Development Factor

Example:
Reported (12 months) = $800,000
Development Factor = 1.25
Ultimate = $800,000 × 1.25 = $1,000,000
\`\`\`

## Trend Factors

### Frequency Trends
Changes in claim count per exposure:
- Driving habits
- Safety improvements
- Economic conditions
- Social inflation

### Severity Trends
Changes in average claim cost:
- Medical cost inflation
- Repair cost increases
- Wage inflation
- Legal environment

### Applied Trend
\`\`\`
Trended Losses = Historical Losses × (1 + Annual Trend)^Years

Example:
Historical = $1,000,000
Annual Trend = 5%
Years to project = 2
Trended = $1,000,000 × 1.05² = $1,102,500
\`\`\`

## Credibility

### Credibility Factor
How much to rely on individual experience:
\`\`\`
0% = Use only class experience
100% = Use only individual experience
Between = Blend both
\`\`\`

### Credibility Formula
\`\`\`
Indicated Rate = Z × Individual Rate + (1-Z) × Class Rate

Where Z = Credibility factor (0 to 1)
\`\`\``,
          estimatedMinutes: 7,
        },
        {
          title: "Pricing Strategies",
          content: `# Pricing Strategies

Strategic pricing balances growth, profitability, and market position.

## Pricing Objectives

### Short-Term Goals
- Meet production targets
- Respond to competition
- Address rate adequacy
- Manage cash flow

### Long-Term Goals
- Sustainable profitability
- Market share growth
- Customer retention
- Brand positioning

## Competitive Analysis

### Market Position Assessment
| Position | Strategy | Premium Level |
|----------|----------|---------------|
| Market Leader | Premium pricing, service focus | Above average |
| Challenger | Value pricing, differentiation | Competitive |
| Niche Player | Specialized expertise | Varies |
| Low-Cost | Volume focus, efficiency | Below average |

### Competitive Intelligence
- Monitor competitor rates
- Track market share
- Analyze win/loss data
- Understand positioning

## Pricing Decisions

### New Business Pricing
Consider:
- Acquisition costs
- Learning curve losses
- Target market fit
- Growth objectives

### Renewal Pricing
Balance:
- Rate adequacy
- Retention targets
- Relationship value
- Account profitability

### Account Rounding
Pricing strategy to capture full account:
- Package discounts
- Multi-policy credits
- Long-term agreements

## Price Optimization

### Data-Driven Pricing
Use analytics to:
- Predict loss costs
- Identify price sensitivity
- Optimize retention
- Maximize profitability

### Constraints
- Regulatory requirements
- Company guidelines
- Ethical considerations
- Market perceptions

## Common Pricing Mistakes

❌ **Avoid:**
- Racing to the bottom on price
- Ignoring loss trends
- Underpricing to win business
- Overpricing renewals
- Inconsistent pricing logic`,
          estimatedMinutes: 8,
        },
        {
          title: "Regulatory Considerations",
          content: `# Regulatory Considerations

Insurance pricing is heavily regulated to protect consumers and ensure market stability.

## Rate Regulation Types

### Prior Approval
- Rates must be approved before use
- Regulator reviews for adequacy
- May cause implementation delays
- Common in personal lines

### File and Use
- File rates with regulator
- Use immediately or after waiting period
- Regulator can disapprove later
- Balance of speed and oversight

### Use and File
- Implement rates first
- File with regulator after
- Most flexible approach
- Common in commercial lines

### No Filing
- No regulatory rate oversight
- Market determines prices
- Limited to certain lines
- Competitive market controls

## Rating Law Principles

### Rates Must Be:

**Adequate**
- Sufficient to pay losses and expenses
- Maintain solvency
- Not unfairly discriminatory to company

**Not Excessive**
- Reasonable profit margin
- Not exploiting consumers
- Competition considered

**Not Unfairly Discriminatory**
- Differences based on risk
- Not based on protected classes
- Actuarially justified

## Filing Requirements

### What to File
- Rate pages
- Rating rules
- Actuarial support
- Loss data
- Trend factors
- Supporting documentation

### Filing Process
1. Prepare filing materials
2. Submit to regulator
3. Respond to questions
4. Receive approval/disapproval
5. Implement approved rates

## Compliance Best Practices

✅ **Do:**
- Document all rating decisions
- Use approved rates
- Apply rules consistently
- Maintain audit trails
- Train staff on requirements

❌ **Don't:**
- Deviate from filed rates
- Use unfiled credits/debits
- Discriminate unlawfully
- Misrepresent coverage
- Ignore regulatory guidance

## Special Rating Considerations

### Protected Classes
Cannot rate based on:
- Race
- Religion
- National origin
- Gender (varies by state/line)
- Other protected characteristics

### Credit-Based Insurance Scores
- Allowed in most states
- Some restrictions apply
- Must provide adverse action notices
- Cannot be sole factor

### Telematics
- Usage-based insurance
- Regulatory evolving
- Privacy considerations
- Actuarial support required`,
          estimatedMinutes: 7,
        },
      ],
      quiz: {
        title: "Pricing and Premium Quiz",
        description: "Test your knowledge of insurance pricing.",
        passingScore: 70,
        questions: [
          {
            question: "What formula is used to calculate gross premium?",
            options: [
              "Gross Premium = Pure Premium only",
              "Gross Premium = Pure Premium + Expense Loading + Profit Margin",
              "Gross Premium = Losses / Exposure",
              "Gross Premium = Rate × Discount",
            ],
            correctAnswer: 1,
            explanation:
              "Gross premium includes the pure premium (expected losses) plus expense loading and profit margin.",
          },
          {
            question: "What does a loss development factor account for?",
            options: [
              "Future premium increases",
              "Losses not yet reported or fully developed",
              "Agent commissions",
              "Regulatory fees",
            ],
            correctAnswer: 1,
            explanation:
              "Loss development factors account for the fact that reported losses increase over time as more claims are reported and settled.",
          },
          {
            question: "Under 'Prior Approval' rate regulation, what must happen before rates can be used?",
            options: [
              "Rates can be used immediately",
              "Rates must be approved by the regulator first",
              "Rates only need to be filed afterward",
              "No filing is required",
            ],
            correctAnswer: 1,
            explanation:
              "Prior Approval requires rates to be approved by the regulator before they can be used in the market.",
          },
          {
            question: "Insurance rates must be adequate, not excessive, and:",
            options: [
              "Not discriminatory at all",
              "Not unfairly discriminatory",
              "Lower than competitors",
              "Fixed for all customers",
            ],
            correctAnswer: 1,
            explanation:
              "Rates must be 'not unfairly discriminatory' - meaning differences must be based on actuarial risk factors, not protected classes.",
          },
        ],
      },
    },
    {
      title: "Portfolio Management",
      description: "Managing a book of business for optimal performance.",
      estimatedMinutes: 30,
      lessons: [
        {
          title: "Book of Business Analysis",
          content: `# Book of Business Analysis

Analyzing your book of business enables strategic decision-making.

## Portfolio Metrics

### Volume Metrics
- Written premium
- Policy count
- Average premium
- Growth rate
- Retention rate

### Profitability Metrics
- Loss ratio
- Combined ratio
- Operating ratio
- Return on equity

### Quality Metrics
- New business quality
- Renewal quality
- Mix of business
- Concentration risk

## Segmentation Analysis

### By Product
| Product | Premium | LR | Growth |
|---------|---------|-----|--------|
| Auto | $10M | 68% | +5% |
| Home | $8M | 55% | +3% |
| Umbrella | $2M | 45% | +8% |

### By Geography
| Region | Premium | LR | Concentration |
|--------|---------|-----|---------------|
| Urban | $12M | 72% | 60% |
| Suburban | $6M | 58% | 30% |
| Rural | $2M | 50% | 10% |

### By Agent
| Agent | Premium | LR | Retention |
|-------|---------|-----|-----------|
| Top 10 | $8M | 62% | 92% |
| Middle | $10M | 68% | 88% |
| Bottom | $2M | 85% | 75% |

## Trend Analysis

### Year-Over-Year Comparison
\`\`\`
                2023      2024    Change
Premium        $18M      $20M     +11%
Loss Ratio     65%       68%      +3pts
Retention      90%       88%      -2pts
New Business   $3M       $4M      +33%
\`\`\`

### Rolling 12-Month
- Smooths seasonal variations
- Shows true trending
- Early warning of changes

## Concentration Risk

### Identify Concentrations
- Large accounts (>5% of book)
- Geographic clusters
- Industry exposures
- Reinsurance dependence

### Manage Concentrations
- Diversification strategies
- Exposure limits
- Reinsurance solutions
- Growth restrictions`,
          estimatedMinutes: 8,
        },
        {
          title: "Mix of Business",
          content: `# Mix of Business

Optimal mix balances growth, profitability, and risk.

## Mix Considerations

### Desirable Mix Characteristics
- Spread of risk
- Profitable segments
- Growth potential
- Manageable complexity

### Mix Components
- Product lines
- Customer segments
- Geographic distribution
- Size distribution
- Industry sectors

## Product Mix Strategy

### Portfolio Approach

**Stars** (High growth, High profit)
- Invest resources
- Expand capacity
- Protect market share

**Cash Cows** (Low growth, High profit)
- Maintain position
- Harvest profits
- Efficient operations

**Question Marks** (High growth, Low profit)
- Selective investment
- Improve or exit
- Monitor closely

**Dogs** (Low growth, Low profit)
- Minimize investment
- Exit strategy
- Avoid new business

## Balancing the Mix

### Risk-Return Trade-off
| Risk Level | Expected Return | Role |
|------------|-----------------|------|
| Low | Moderate | Stability |
| Medium | Good | Core business |
| High | High | Growth/profit |

### Correlation Considerations
- Avoid correlated risks
- Geographic diversification
- Industry diversification
- Coverage diversification

## Mix Management Actions

### To Improve Mix:
1. **Grow good segments**
   - Target marketing
   - Competitive pricing
   - Agent incentives

2. **Shrink bad segments**
   - Non-renewal strategy
   - Price increases
   - Restrictive underwriting

3. **Enter new segments**
   - Market research
   - Product development
   - Strategic partnerships

4. **Exit poor segments**
   - Portfolio sales
   - Run-off management
   - Reinsurance solutions`,
          estimatedMinutes: 7,
        },
        {
          title: "Reinsurance Basics",
          content: `# Reinsurance Basics

Reinsurance enables insurers to manage capacity and volatility.

## What is Reinsurance?

Insurance for insurance companies:
- Transfer of risk
- Capacity expansion
- Volatility reduction
- Capital management

## Types of Reinsurance

### Treaty Reinsurance
Automatic coverage for defined risks:

**Pro-Rata (Proportional)**
- Quota Share: Fixed percentage of all risks
- Surplus: Variable percentage above retention

**Excess of Loss**
- Per Risk: Protects individual large losses
- Per Occurrence: Protects against events
- Aggregate: Annual loss limit protection

### Facultative Reinsurance
Individual risk negotiation:
- Used for unusual risks
- Supplements treaties
- Higher cost per transaction
- More flexibility

## Reinsurance Structures

### Quota Share Example
\`\`\`
Risk: $1,000,000
Quota Share: 25%

Company keeps: $750,000 (75%)
Reinsurer takes: $250,000 (25%)

Premium and losses shared proportionally
\`\`\`

### Excess of Loss Example
\`\`\`
Coverage: $900,000 xs $100,000

Loss $50,000:
Company pays: $50,000
Reinsurer pays: $0

Loss $500,000:
Company pays: $100,000
Reinsurer pays: $400,000

Loss $1,500,000:
Company pays: $100,000 + $500,000 (over limit)
Reinsurer pays: $900,000
\`\`\`

## Benefits of Reinsurance

### Capacity
- Write larger risks
- Grow premium volume
- Enter new markets

### Stability
- Smooth earnings
- Reduce volatility
- Protect surplus

### Expertise
- Access specialized knowledge
- Learn from reinsurers
- Improve underwriting

## Working with Reinsurers

### Communication
- Share complete information
- Timely reporting
- Accurate data
- Strategic discussions

### Relationship Management
- Long-term partnerships
- Market positioning
- Mutual benefit focus`,
          estimatedMinutes: 8,
        },
        {
          title: "Performance Monitoring",
          content: `# Performance Monitoring

Regular monitoring enables timely corrective action.

## Key Performance Indicators (KPIs)

### Production KPIs
| Metric | Target | Frequency |
|--------|--------|-----------|
| New business premium | $XXX/month | Monthly |
| Quote-to-bind ratio | 30%+ | Weekly |
| Policy count growth | +5%/year | Monthly |
| Agent new appointments | X/quarter | Quarterly |

### Profitability KPIs
| Metric | Target | Frequency |
|--------|--------|-----------|
| Loss ratio | <65% | Monthly |
| Combined ratio | <98% | Quarterly |
| Expense ratio | <30% | Quarterly |
| Underwriting income | +$XX | Quarterly |

### Quality KPIs
| Metric | Target | Frequency |
|--------|--------|-----------|
| Retention rate | 90%+ | Monthly |
| Hit ratio | 25%+ | Weekly |
| Audit compliance | 100% | Per audit |
| Customer satisfaction | 4.5/5 | Quarterly |

## Monitoring Tools

### Dashboards
Real-time visibility:
- Production tracking
- Loss activity
- Pipeline status
- Team performance

### Reports
Regular analysis:
- Monthly production
- Quarterly results
- Annual reviews
- Special studies

### Alerts
Early warning systems:
- Large losses
- High loss ratio accounts
- Unusual patterns
- Compliance issues

## Performance Reviews

### Individual Reviews
- Production goals
- Quality metrics
- Development needs
- Action plans

### Book Reviews
- Segment performance
- Problem areas
- Opportunities
- Strategic direction

### Agent Reviews
- Production volume
- Loss experience
- Hit ratio
- Relationship health

## Taking Action

### When Performance Lags:
1. **Diagnose** - Identify root cause
2. **Plan** - Develop corrective strategy
3. **Execute** - Implement changes
4. **Monitor** - Track improvement
5. **Adjust** - Refine as needed

### Common Interventions
- Rate adjustments
- Underwriting guideline changes
- Training programs
- Portfolio actions
- Agent management`,
          estimatedMinutes: 7,
        },
      ],
      quiz: {
        title: "Portfolio Management Quiz",
        description: "Test your portfolio management knowledge.",
        passingScore: 70,
        questions: [
          {
            question: "In portfolio analysis, what does a 'Star' segment represent?",
            options: [
              "Low growth, low profit",
              "High growth, high profit",
              "Low growth, high profit",
              "High growth, low profit",
            ],
            correctAnswer: 1,
            explanation:
              "A 'Star' represents a segment with both high growth potential and high profitability - these deserve investment and protection.",
          },
          {
            question: "What type of reinsurance automatically covers all risks meeting certain criteria?",
            options: [
              "Facultative reinsurance",
              "Treaty reinsurance",
              "Spot reinsurance",
              "Optional reinsurance",
            ],
            correctAnswer: 1,
            explanation:
              "Treaty reinsurance provides automatic coverage for all risks meeting predefined criteria, unlike facultative which is negotiated risk by risk.",
          },
          {
            question: "In a Quota Share arrangement of 25%, if there's a $100,000 loss, how much does the reinsurer pay?",
            options: ["$100,000", "$75,000", "$25,000", "$0"],
            correctAnswer: 2,
            explanation:
              "In a 25% Quota Share, the reinsurer takes 25% of premiums and losses. For a $100,000 loss, the reinsurer pays $25,000 (25%).",
          },
          {
            question: "What is the typical target retention rate for a healthy book of business?",
            options: ["70%+", "80%+", "90%+", "100%"],
            correctAnswer: 2,
            explanation:
              "A healthy book typically targets 90%+ retention rate, indicating strong customer satisfaction and competitive pricing.",
          },
        ],
      },
    },
  ],
};

// ============================================
// Main Seeding Function
// ============================================

async function seedCourse(definition: CourseDefinition): Promise<void> {
  console.log(`\n📚 Creating course: ${definition.title}`);

  // 1. Create the course
  const course = await createCourse({
    appId: APP_ID,
    entityId: ENTITY_ID,
    title: definition.title,
    description: definition.description,
    category: definition.category,
    difficulty: definition.difficulty,
    estimatedMinutes: definition.estimatedMinutes,
    createdBy: CREATED_BY,
    tags: [definition.category, definition.difficulty],
  });

  console.log(`   ✓ Course created: ${course.id}`);

  // 2. Create modules, lessons, and quizzes
  for (let moduleIndex = 0; moduleIndex < definition.modules.length; moduleIndex++) {
    const moduleDef = definition.modules[moduleIndex];
    const moduleOrder = moduleIndex + 1;

    // Create module
    const module = await createModule({
      courseId: course.id,
      title: moduleDef.title,
      description: moduleDef.description,
      order: moduleOrder,
      estimatedMinutes: moduleDef.estimatedMinutes,
    });

    console.log(`   📖 Module ${moduleOrder}: ${module.title}`);

    // Increment course module count
    await incrementModuleCount(APP_ID, ENTITY_ID, course.id);

    // Create lessons
    for (let lessonIndex = 0; lessonIndex < moduleDef.lessons.length; lessonIndex++) {
      const lessonDef = moduleDef.lessons[lessonIndex];
      const lessonOrder = lessonIndex + 1;

      await createLesson({
        moduleId: module.id,
        title: lessonDef.title,
        content: lessonDef.content,
        order: lessonOrder,
        estimatedMinutes: lessonDef.estimatedMinutes,
      });

      // Increment module lesson count
      await incrementLessonCount(course.id, moduleOrder, module.id);

      console.log(`      📄 Lesson ${lessonOrder}: ${lessonDef.title}`);
    }

    // Create quiz
    const quiz = await createQuiz({
      moduleId: module.id,
      title: moduleDef.quiz.title,
      description: moduleDef.quiz.description,
      passingScore: moduleDef.quiz.passingScore,
    });

    console.log(`      📝 Quiz: ${quiz.title}`);

    // Create quiz questions
    for (let qIndex = 0; qIndex < moduleDef.quiz.questions.length; qIndex++) {
      const questionDef = moduleDef.quiz.questions[qIndex];

      await createQuizQuestion({
        quizId: quiz.id,
        question: questionDef.question,
        options: questionDef.options,
        correctAnswer: questionDef.correctAnswer,
        explanation: questionDef.explanation,
        order: qIndex + 1,
      });

      // Increment quiz question count
      await incrementQuestionCount(module.id, quiz.id);
    }

    console.log(`         ✓ ${moduleDef.quiz.questions.length} questions added`);
  }

  // 3. Publish the course
  await updateCourse(APP_ID, ENTITY_ID, course.id, { status: "published" });
  console.log(`   ✅ Course published!`);
}

async function main() {
  console.log("🚀 Starting E-Learning Course Seed Script");
  console.log("=========================================");

  const courses = [healthInsuranceCourse, claimsProcessingCourse, underwritingCourse];

  for (const course of courses) {
    try {
      await seedCourse(course);
    } catch (error) {
      console.error(`❌ Error creating course "${course.title}":`, error);
    }
  }

  console.log("\n=========================================");
  console.log("✅ Seeding complete!");
  console.log(`   Created ${courses.length} courses`);
  console.log(
    `   Total modules: ${courses.reduce((acc, c) => acc + c.modules.length, 0)}`
  );
  console.log(
    `   Total lessons: ${courses.reduce(
      (acc, c) => acc + c.modules.reduce((m, mod) => m + mod.lessons.length, 0),
      0
    )}`
  );
}

main().catch(console.error);
