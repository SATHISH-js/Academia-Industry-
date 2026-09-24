const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
let genAI = null;
if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (e) {
    console.warn('[CoachNova] GoogleGenAI init warning:', e.message);
  }
}

/**
 * Curated knowledge base for Coach Nova
 */
const KNOWLEDGE_RESPONSES = [
  {
    keywords: ['system design', 'caching', 'sharding', 'load balancing', 'gap', '-25'],
    title: 'High-Level System Design & Latency Optimization',
    answer: `### 🌐 Coach Nova's System Design Blueprint

System Design is one of the most decisive capabilities in senior and full stack interviews. Here is how to conquer the key concepts and close your skill gap:

#### 1. Caching Strategies (Redis / Memcached)
* **Cache-Aside (Lazy Loading):** Application queries the cache. On miss, it reads from the primary database, writes back to the cache with a defined TTL, and returns.
* **Write-Through:** Application writes to the cache, and the cache synchronously updates the database. High consistency, slightly higher write latency.
* **Write-Back (Write-Behind):** Application writes to the cache immediately; the cache asynchronously batches writes to the database. Very fast, but carries risk of data loss if the cache node crashes before flushing.

#### 2. Horizontal Scaling & Load Balancing
* Use **Round-Robin** or **Least Connections** algorithms across stateless backend instances.
* Terminate SSL/TLS at the Load Balancer (NGINX / AWS ALB) to offload cryptographic overhead from application servers.

#### 3. Database Sharding & Partitioning
* **Range Sharding:** Partition by timestamp or user ID ranges.
* **Hash Sharding (Consistent Hashing):** Distributes keys uniformly across shard nodes, preventing hotspot nodes when cluster size changes.

⚡ **Coach Nova Action Tip:** Complete your active roadmap task *"High-Level System Design: Caching, Sharding & Load Balancing"* to earn 25 verification points on your skill radar!`,
    suggestedFollowUps: [
      'What are common System Design interview questions?',
      'How does Consistent Hashing work?',
      'How do I implement Redis in Node.js?'
    ]
  },
  {
    keywords: ['master theorem', 'recursion', 'big o', 'complexity', 'asymptotic', 'divide and conquer'],
    title: 'Master Theorem & Algorithmic Complexity Made Simple',
    answer: `### ⏱️ Coach Nova's Guide to Master Theorem & Big-O

Analyzing recursive divide-and-conquer algorithms often seems daunting, but the **Master Theorem** simplifies it into 3 clear cases for recurrences of the form:

$$T(n) = a \\cdot T\\left(\\frac{n}{b}\\right) + f(n)$$

Where:
* $a \\ge 1$: Number of subproblems in each recursive step.
* $b > 1$: Factor by which subproblem size is divided.
* $f(n) = O(n^d)$: Work done outside the recursive calls (e.g., partitioning, merging).

---

#### The 3 Core Cases:
1. **Work dominated by leaves ($d < \\log_b a$):**
   * If leaf cost dominates, total complexity is:
   * $$T(n) = \\Theta\\left(n^{\\log_b a}\\right)$$
   * *Example:* Strassen's Matrix Multiplication ($a=7, b=2, d=2 \\implies \\log_2 7 \\approx 2.81 > 2$) $\\implies O(n^{2.81})$.

2. **Work evenly distributed ($d = \\log_b a$):**
   * If recursive work matches merging cost:
   * $$T(n) = \\Theta\\left(n^d \\log n\\right)$$
   * *Example:* Merge Sort ($T(n) = 2T(n/2) + O(n) \\implies a=2, b=2, d=1 \\implies \\log_2 2 = 1 = d$) $\\implies O(n \\log n)$.

3. **Work dominated by root ($d > \\log_b a$):**
   * If root combining step dominates:
   * $$T(n) = \\Theta(f(n)) = \\Theta(n^d)$$
   * *Example:* Binary Search ($T(n) = T(n/2) + O(1) \\implies a=1, b=2, d=0 \\implies \\log_2 1 = 0 = d$) $\\implies O(\\log n)$.

⚡ **Coach Nova Practice Advice:** Remember that if $a$ or $b$ are not constant, or if $f(n)$ is not polynomial, fall back to **Recursion Tree Analysis** to sum cost level-by-level!`,
    suggestedFollowUps: [
      'How do I solve recurrences with recursion trees?',
      'What are common Big-O pitfalls in coding interviews?',
      'Explain Dynamic Programming vs Divide & Conquer'
    ]
  },
  {
    keywords: ['docker', 'container', 'kubernetes', 'ci/cd', 'devops', 'pipeline'],
    title: 'Docker & CI/CD Production Pipelines',
    answer: `### 🐳 Coach Nova's Docker & CI/CD Playbook

Modern software engineering mandates container proficiency. Here is your fast-track mastery guide:

#### 1. Multi-Stage Dockerfiles (Lean & Secure)
Always use multi-stage builds to keep production images tiny (< 100MB):
\`\`\`dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
USER node
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 5000
CMD ["node", "dist/server.js"]
\`\`\`

#### 2. CI/CD Pipeline Stages (GitHub Actions)
1. **Lint & Security Scan:** Run ESLint and Trivy/Snyk for vulnerable packages.
2. **Automated Testing:** Run unit and integration tests with coverage assertions.
3. **Container Build & Push:** Build Docker image, tag with git SHA, push to AWS ECR or Docker Hub.
4. **Deploy:** Perform zero-downtime rolling update to ECS, Cloud Run, or Kubernetes cluster.

⚡ **Coach Nova Action Tip:** Complete the *"Automated Multi-Stage CI/CD Pipeline"* task in your roadmap to bridge your -20 pts pipeline deficit!`,
    suggestedFollowUps: [
      'What is the difference between Docker Compose and Kubernetes?',
      'How do GitHub Actions secrets work securely?',
      'How to monitor microservices with Prometheus & Grafana?'
    ]
  },
  {
    keywords: ['tcs', 'interview', 'wipro', 'techcorp', 'coding', 'mock', 'questions'],
    title: 'Cracking Enterprise Technical & Behavioral Rounds',
    answer: `### 🎯 Coach Nova's Enterprise Interview Preparation Strategy

Whether you are targeting **TCS Digital / Ninja**, **Wipro Turbo**, or **TechCorp Solutions**, companies evaluate two pillars:

#### Pillar 1: Hands-on Technical Mastery (60%)
* **Data Structures:** Sliding window, Two Pointers, Hash Table frequency counts, and Binary Tree traversals.
* **SQL Queries:** Writing complex \`GROUP BY\`, \`HAVING\`, \`JOIN\`, and Window Functions (\`ROW_NUMBER()\`, \`DENSE_RANK()\`).
* **Core Principles:** OOP Design Patterns (Factory, Singleton, Observer) and REST API idempotency (GET vs POST vs PUT vs PATCH).

#### Pillar 2: The STAR Method for Behavioral Rounds (40%)
* **S (Situation):** Set context in 1-2 concise sentences.
* **T (Task):** State the explicit problem or milestone you were assigned.
* **A (Action):** The technical and collaborative steps **you personally** took.
* **R (Result):** Quantifiable outcome (e.g., *"reduced query latency by 45%", "delivered 2 days ahead of schedule"*).

⚡ **Coach Nova Tip:** Use our built-in **AI Mock Interview Room** to practice simulated live voice rounds with real-time feedback!`,
    suggestedFollowUps: [
      'Give me an example STAR answer for technical conflict',
      'What are the most asked SQL interview questions?',
      'Launch an AI Mock Interview session'
    ]
  },
  {
    keywords: ['resume', 'portfolio', 'ats', 'cv', 'projects', 'github'],
    title: 'ATS Resume & Digital Portfolio Optimization',
    answer: `### 📄 Coach Nova's Resume & Portfolio Guide

Top companies filter thousands of candidate resumes through Applicant Tracking Systems (ATS). Here is how to stand out:

#### 1. The High-Impact Bullet Formula:
* Format every bullet as:
  **[Strong Action Verb] + [What You Built/Engineered] + [Technologies Used] + [Quantifiable Impact / Metric]**
* *Example:* "Architected scalable REST API with Node.js and Redis caching, slashing database read latency by 68% for 10,000+ concurrent requests."

#### 2. ATS Formatting Rules:
* Single-column, clean typography (no tables, complex multi-column columns, or graphical text boxes).
* Standard section headings: *Technical Skills, Education, Professional Experience, Engineering Projects, Verified Certifications*.
* Ensure all skills listed in your profile appear verbatim in project descriptions.

⚡ **Coach Nova Action Tip:** Navigate to **Resume Builder** to export a verified, recruiter-formatted PDF linked directly to your digital portfolio!`,
    suggestedFollowUps: [
      'How to showcase full stack projects effectively?',
      'What action verbs are best for engineering resumes?',
      'Open Resume Builder tool'
    ]
  }
];

/**
 * Handle incoming queries to Coach Nova AI
 */
async function askCoachNova(req, res) {
  const { message, history = [], context = {} } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'Question message is required.' });
  }

  const query = message.trim();
  const lower = query.toLowerCase();

  // 1. Try Gemini Generative AI if key is present
  if (genAI && GEMINI_API_KEY) {
    try {
      const systemInstruction = `You are "Coach Nova", an elite AI Engineering & Career Coach in an Academia-Industry Collaboration Portal.
You specialize in computer science, full stack engineering, cloud architecture, system design, data structures, algorithms, interviews, and career roadmaps.
The user is a student aiming for career readiness (Focus: ${context.targetRole || 'Full Stack + Cloud'}).
Provide clear, structured, encouraging, and technically rigorous markdown answers with code examples or formulas where appropriate.
End your response with a 1-sentence actionable Coach Nova tip.`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\nStudent Question: ${query}` }] }
        ]
      });

      if (response && response.text) {
        return res.json({
          success: true,
          botName: 'Coach Nova',
          answer: response.text,
          suggestedFollowUps: [
            'How do I test this in my roadmap track?',
            'What interview questions relate to this topic?',
            'Recommend next best practice step'
          ]
        });
      }
    } catch (e) {
      console.warn('[CoachNova] GenAI call failed, utilizing curated knowledge engine:', e.message);
    }
  }

  // 2. Intelligent Knowledge Matcher
  let bestMatch = null;
  let maxScore = 0;

  for (const item of KNOWLEDGE_RESPONSES) {
    let score = 0;
    for (const kw of item.keywords) {
      if (lower.includes(kw)) {
        score += 2;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && maxScore > 0) {
    return res.json({
      success: true,
      botName: 'Coach Nova',
      answer: bestMatch.answer,
      suggestedFollowUps: bestMatch.suggestedFollowUps,
      title: bestMatch.title
    });
  }

  // 3. Dynamic Technical & Career Coaching Universal Generator
  const targetRole = context.targetRole || 'Full Stack + Cloud';
  const genericAnswer = `### 🤖 Coach Nova's Career Guidance

Great question! As your AI Coach for **${targetRole}**, here is a structured breakdown:

1. **Core Conceptual Foundation:**
   Focus on understanding the underlying architectural tradeoffs rather than memorizing syntax. For instance, when designing services, always evaluate **read vs. write throughput, consistency vs. availability (CAP Theorem), and memory vs. runtime complexity**.

2. **Bridging Your Skill Gaps:**
   System Design, CI/CD pipelines, and relational database indexing are the most sought-after competencies by hiring managers at companies like TCS, TechCorp, and CloudScale.

3. **Recommended Next Steps:**
   * Step 1: Open your **Active Career Roadmap** and check off current stage milestone tasks.
   * Step 2: Practice live coding and behavioral scenarios in our **AI Mock Interview Room**.
   * Step 3: Verify your skills with an **AI Assessment Badge** to stand out to industry recruiters.

⚡ **Coach Nova Action Tip:** Ask me about specific technical topics like *"System Design"*, *"Master Theorem"*, *"Docker & CI/CD"*, or *"STAR Behavioral Method"* for in-depth masterclasses!`;

  return res.json({
    success: true,
    botName: 'Coach Nova',
    answer: genericAnswer,
    suggestedFollowUps: [
      'How do I close my System Design gap?',
      'Explain Master Theorem & Big-O easily',
      'What are top questions asked in TCS & TechCorp interviews?',
      'How to build a Docker & Cloud CI/CD pipeline?'
    ]
  });
}

/**
 * Personalized dynamic greeting from Coach Nova
 */
async function getGreeting(req, res) {
  const role = req.query.role || 'Full Stack + Cloud';
  const name = req.query.name || 'there';

  return res.json({
    success: true,
    botName: 'Coach Nova',
    greeting: `Hi ${name}! I'm Coach Nova, your AI Career & Knowledge Guide! 🚀✨ Ask me anything about System Design, Algorithms, Cloud DevOps, Interview Preparation, or your personalized roadmap!`,
    quickPrompts: [
      'How do I close my System Design gap (-25 pts)?',
      'Explain Master Theorem & Big-O in simple terms',
      'What are common TCS & TechCorp interview questions?',
      'How to containerize with Docker & GitHub Actions?'
    ]
  });
}

module.exports = {
  askCoachNova,
  getGreeting
};
