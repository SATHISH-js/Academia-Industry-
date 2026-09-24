const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const QUESTION_BANK = {
  'Wipro Elite & Turbo SDE': [
    {
      id: 1,
      question: 'How do you design a high-throughput RESTful service in Java Spring Boot that connects to a relational database with connection pooling?',
      category: 'System Architecture',
      expectedKeywords: ['spring boot', 'hikari', 'connection pool', 'rest', 'jpa', 'hibernate', 'throughput', 'indexes', 'transactions', 'latency'],
      idealAnswer: 'In Spring Boot, I configure HikariCP for high-throughput connection pooling by tuning maximumPoolSize and minimumIdle to match database worker threads. I implement asynchronous endpoints with @Async or reactive WebFlux when suitable, apply read-only transaction flags (@Transactional(readOnly = true)) to optimize dirty checking, and ensure all frequently queried columns possess B-tree indexes. Furthermore, I implement connection timeout thresholds and circuit breakers via Resilience4j to avoid thread starvation.'
    },
    {
      id: 2,
      question: 'Explain the internal working of Java HashMap and how collisions are resolved in Java 8 and beyond.',
      category: 'Data Structures & Core Java',
      expectedKeywords: ['hashcode', 'equals', 'bucket', 'collision', 'linked list', 'red-black tree', 'treeify', 'threshold', 'capacity', 'load factor'],
      idealAnswer: 'Java HashMap utilizes an array of Node buckets. When an entry is inserted, its key hashCode is scrambled and bitwise AND-ed with capacity minus one. If two keys land in the same bucket, a collision occurs. Prior to Java 8, entries formed a singly linked list with O(n) lookup. In Java 8+, once a bucket reaches the TREEIFY_THRESHOLD (8 entries) and table capacity is at least 64, the linked list converts into a balanced Red-Black Tree, reducing lookup and insertion time from O(n) to O(log n).'
    },
    {
      id: 3,
      question: 'How do you secure web APIs against SQL Injection and Cross-Site Scripting (XSS) in an enterprise project?',
      category: 'Application Security',
      expectedKeywords: ['parameterized query', 'prepared statement', 'orm', 'input validation', 'sanitize', 'csp', 'xss', 'sql injection', 'escaping'],
      idealAnswer: 'To prevent SQL Injection, I strictly enforce parameterized queries via PreparedStatement or ORM query builders (e.g., Spring Data JPA / Hibernate), completely avoiding string concatenation. For XSS, I implement strict context-aware output encoding, sanitize user inputs using standard libraries, enforce a rigorous Content Security Policy (CSP) header, and mark sensitive authentication tokens as HttpOnly and Secure cookies.'
    },
    {
      id: 4,
      question: 'Describe a situation where a production bug or unexpected system outage occurred under your watch. How did you diagnose and resolve it?',
      category: 'Behavioral & STAR Method',
      expectedKeywords: ['situation', 'task', 'action', 'result', 'root cause', 'logs', 'monitoring', 'incident', 'fix', 'post-mortem'],
      idealAnswer: 'Situation: During a deployment rollout, API latency spiked by 400% due to unindexed foreign key lookups under peak load. Task: As lead developer, I had to restore SLA compliance within 30 minutes without downtime. Action: I inspected APM telemetry logs, identified the bottleneck query using EXPLAIN ANALYZE, and applied a non-blocking concurrent index on PostgreSQL. Result: Query latency dropped by 92%, normal operations were restored in 18 minutes, and I documented the incident in a blameless post-mortem with automated CI index checks.'
    }
  ],
  'Full Stack Software Engineer': [
    {
      id: 1,
      question: 'How do you handle state management across deeply nested components in a modern React application?',
      category: 'Frontend Engineering',
      expectedKeywords: ['context', 'redux', 'props', 'state', 'hooks', 'performance', 're-render', 'zustand', 'memo'],
      idealAnswer: 'For global or deeply nested state in React, I evaluate the state scope. For lightweight shared state like authentication or theme, React Context API with useReducer is ideal, separated into granular contexts to avoid unnecessary re-renders. For complex asynchronous or entity-driven state, I leverage Zustand or Redux Toolkit. I pair this with React.memo and useMemo for performance-sensitive subtrees.'
    },
    {
      id: 2,
      question: 'Explain how database indexing works in relational databases and what tradeoffs are involved.',
      category: 'Databases & Performance',
      expectedKeywords: ['b-tree', 'index', 'read', 'write', 'tradeoff', 'performance', 'query', 'overhead', 'table scan'],
      idealAnswer: 'Database indexing creates auxiliary data structures, predominantly balanced B-Trees, allowing the query planner to locate rows in O(log n) time rather than executing full sequential table scans. The key tradeoff is write amplification: every INSERT, UPDATE, or DELETE requires updating both the base table and all corresponding index trees, increasing disk I/O and storage footprint.'
    },
    {
      id: 3,
      question: 'How do you secure a REST API against common vulnerabilities such as unauthorized access and injection attacks?',
      category: 'API Security',
      expectedKeywords: ['jwt', 'token', 'authentication', 'authorization', 'validation', 'cors', 'sql injection', 'sanitize', 'https', 'rate limit'],
      idealAnswer: 'I secure REST APIs with a defense-in-depth model: stateless JWT authentication with short-lived access tokens and secure HTTP-only refresh tokens, Role-Based Access Control (RBAC) middleware, strict input validation using schemas like Joi or Zod, parameterized SQL queries, rate limiting via Redis token buckets, and enforcing TLS 1.3 encryption.'
    },
    {
      id: 4,
      question: 'Tell me about a challenging bug you encountered in a team project and how you resolved it.',
      category: 'Engineering Process & STAR',
      expectedKeywords: ['debug', 'problem', 'root cause', 'solution', 'team', 'test', 'result', 'log', 'resolved'],
      idealAnswer: 'I encountered an intermittent race condition where user balance updates were being overwritten during concurrent requests. I reproduced it in a local sandbox using k6 load tests, diagnosed missing row-level locks, implemented pessimistic locking with SELECT FOR UPDATE inside a transactional boundary, added regression tests, and verified zero discrepancies across 10,000 concurrent simulation cycles.'
    }
  ],
  'Backend Developer': [
    {
      id: 1,
      question: 'What is the difference between monolithic and microservices architectures, and when would you choose one over the other?',
      category: 'System Architecture',
      expectedKeywords: ['monolith', 'microservices', 'scalability', 'coupling', 'deploy', 'independent', 'complexity', 'network'],
      idealAnswer: 'Monoliths bundle all domain logic in a single deployment unit, providing low operational complexity and zero network latency between modules. Microservices decouple domains into independently deployable services communicating over gRPC or REST. I recommend monoliths for early-stage or medium-scale products to accelerate development speed, and transition to microservices when distinct bounded contexts require independent autoscaling and dedicated engineering squads.'
    },
    {
      id: 2,
      question: 'How does connection pooling in Node.js improve database throughput under high traffic?',
      category: 'Backend Concurrency',
      expectedKeywords: ['connection', 'pool', 'reuse', 'overhead', 'concurrency', 'latency', 'throughput', 'handshake'],
      idealAnswer: 'Establishing a TCP and SSL database connection involves significant latency (three-way handshakes, TLS negotiation, authentication). A connection pool maintains a set of warm, reusable connections. Worker requests borrow an idle connection, execute their query, and immediately return it to the pool, eliminating connection churn and drastically increasing query throughput.'
    },
    {
      id: 3,
      question: 'Explain the ACID properties of relational transactions with a real-world banking scenario.',
      category: 'Databases',
      expectedKeywords: ['atomicity', 'consistency', 'isolation', 'durability', 'rollback', 'commit', 'transaction'],
      idealAnswer: 'In a bank transfer: Atomicity ensures debiting Account A and crediting Account B succeed together or roll back completely. Consistency maintains valid balance invariants (no negative balances). Isolation ensures concurrent transfers cannot view partial states. Durability guarantees that once committed, transaction records survive even system crashes via write-ahead logging (WAL).'
    }
  ],
  'Frontend Engineer': [
    {
      id: 1,
      question: 'Explain the Virtual DOM and the reconciliation algorithm in React.',
      category: 'Core React',
      expectedKeywords: ['virtual dom', 'diffing', 'reconciliation', 'render', 'fiber', 'keys', 'efficiency', 'batch'],
      idealAnswer: 'The Virtual DOM is an in-memory lightweight representation of the actual DOM. When component state changes, React creates a new VDOM tree and executes its heuristic O(n) diffing reconciliation algorithm (React Fiber). By comparing node types and unique keys, React calculates the minimal set of real DOM mutations required, batching them together for optimal 60fps rendering.'
    },
    {
      id: 2,
      question: 'What strategies do you use to optimize Cumulative Layout Shift (CLS) and Largest Contentful Paint (LCP)?',
      category: 'Web Performance & Core Web Vitals',
      expectedKeywords: ['lcp', 'cls', 'core web vitals', 'images', 'font', 'dimensions', 'cdn', 'lazy load', 'priority'],
      idealAnswer: 'For LCP, I prioritize hero resources with preload links, serve compressed modern image formats (AVIF/WebP) via global CDN edge caches, and eliminate render-blocking CSS/JS. For CLS, I explicitly set width/height attributes or CSS aspect-ratio on all images and ad containers, use font-display: optional to prevent layout shifts from FOIT/FOUT, and reserve space for dynamic asynchronous content.'
    },
    {
      id: 3,
      question: 'How do you make complex web user interfaces accessible for screen readers and keyboard users?',
      category: 'Web Accessibility',
      expectedKeywords: ['aria', 'semantic html', 'keyboard', 'focus', 'contrast', 'accessibility', 'alt text'],
      idealAnswer: 'I prioritize semantic HTML5 elements (nav, main, button) before relying on ARIA. For interactive custom widgets like modals or comboboxes, I manage roving tabindex, provide distinct aria-expanded and aria-haspopup attributes, implement trap focus inside active dialogs, ensure 4.5:1 WCAG contrast ratios, and test with screen readers such as NVDA and VoiceOver.'
    }
  ],
  'Data Scientist / ML Engineer': [
    {
      id: 1,
      question: 'How do you detect and mitigate overfitting in a machine learning model?',
      category: 'Machine Learning',
      expectedKeywords: ['overfitting', 'regularization', 'cross-validation', 'dropout', 'pruning', 'training', 'validation', 'dataset'],
      idealAnswer: 'Overfitting occurs when training loss continues declining while validation loss begins diverging upward. I detect it through k-fold cross-validation and learning curves. Mitigation strategies include L1/L2 weight regularization, dropout in deep neural networks, early stopping, pruning in decision trees, data augmentation, and gathering more representative training samples.'
    },
    {
      id: 2,
      question: 'Explain the difference between Precision and Recall. Which metric would you prioritize for medical disease detection?',
      category: 'Model Evaluation',
      expectedKeywords: ['precision', 'recall', 'false positive', 'false negative', 'f1-score', 'tradeoff', 'sensitivity'],
      idealAnswer: 'Precision measures true positives out of all predicted positive cases (minimizing false alarms). Recall measures true positives out of all actual real-world positive cases (minimizing false negatives). In medical diagnosis, missing a diseased patient is fatal, so we prioritize Recall (sensitivity) to catch all potential cases, followed by secondary confirmation.'
    },
    {
      id: 3,
      question: 'How do you handle missing values and skewed features during data preprocessing?',
      category: 'Feature Engineering',
      expectedKeywords: ['imputation', 'median', 'mean', 'outliers', 'log transform', 'scaling', 'normalization'],
      idealAnswer: 'For missing numerical data, I assess the missingness mechanism (MCAR, MAR, MNAR) and apply median imputation or KNN/iterative MICE imputers to avoid variance distortion. For categorical features, I use mode or a dedicated Missing indicator. For skewed distributions, I apply log, Box-Cox, or Yeo-Johnson transformations followed by robust or standard scaling.'
    }
  ],
  'Cloud & DevOps Engineer': [
    {
      id: 1,
      question: 'Explain the lifecycle of a container from Dockerfile to running in a Kubernetes pod.',
      category: 'Containerization & Orchestration',
      expectedKeywords: ['dockerfile', 'image', 'container', 'registry', 'pod', 'kubernetes', 'node', 'deploy'],
      idealAnswer: 'A developer defines instructions in a Dockerfile. The Docker engine builds read-only image layers and pushes the artifact to an OCI container registry. A Kubernetes Deployment manifest specifies this image. The Kube-apiserver validates the manifest, the scheduler assigns the Pod to a healthy Node, and Kubelet instructs the container runtime (containerd) to pull and execute the container with configured cgroups and namespaces.'
    },
    {
      id: 2,
      question: 'What is the difference between blue-green deployment and canary deployment strategies?',
      category: 'CI/CD & Reliability',
      expectedKeywords: ['blue-green', 'canary', 'traffic', 'zero downtime', 'rollback', 'release', 'monitoring', 'percentage'],
      idealAnswer: 'Blue-Green deployment runs two identical environments; new version is deployed to Green, verified, and load balancer switches 100% traffic instantaneously with instant rollback capability. Canary deployment rolls out the new version to a small subset of production traffic (e.g., 5%), monitors error rates and latency in real time, and incrementally shifts remaining traffic.'
    },
    {
      id: 3,
      question: 'How do you manage secret keys and credentials securely in a CI/CD automation pipeline?',
      category: 'DevSecOps & Cloud Security',
      expectedKeywords: ['secrets', 'vault', 'environment variables', 'iam', 'encryption', 'pipeline', 'credentials'],
      idealAnswer: 'I eliminate hardcoded credentials entirely by integrating centralized secret management tools like HashiCorp Vault, AWS Secrets Manager, or Azure Key Vault. In CI/CD pipelines, I use OpenID Connect (OIDC) with short-lived IAM assume-role tokens rather than long-lived static API keys, and enforce automated secret scanning via tools like GitGuardian.'
    }
  ]
};

const FILLER_WORDS = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'sort of', 'kind of', 'literally', 'i mean', 'so yeah', 'right'];

/**
 * Detailed Grammar & Syntax Mistake Analyzer
 */
function analyzeGrammarAndPhrasing(text) {
  const issues = [];
  if (!text || typeof text !== 'string') return issues;

  // 1. Informal Slang & Colloquialisms
  const slangRules = [
    { regex: /\bgonna\b/gi, fix: 'going to', issue: 'Informal slang "gonna"', explanation: 'In formal engineering interviews, say "going to" instead of "gonna".' },
    { regex: /\bwanna\b/gi, fix: 'want to / intend to', issue: 'Informal slang "wanna"', explanation: 'Say "want to" or "intend to" for executive presence.' },
    { regex: /\bkinda\b/gi, fix: 'somewhat / relatively', issue: 'Colloquial term "kinda"', explanation: 'Replace "kinda" with precise adjectives or qualifiers.' },
    { regex: /\bgotta\b/gi, fix: 'need to / must', issue: 'Informal slang "gotta"', explanation: 'Use "need to" or "must" in professional discourse.' },
    { regex: /\bdunno\b/gi, fix: 'do not know / am unfamiliar with', issue: 'Slang "dunno"', explanation: 'Always enunciate "I do not know" or "I am not familiar with".' },
    { regex: /\byeah\b/gi, fix: 'yes / certainly / indeed', issue: 'Casual affirmative "yeah"', explanation: 'Prefer "yes", "certainly", or "indeed" during technical interviews.' }
  ];

  slangRules.forEach(r => {
    const matches = text.match(r.regex);
    if (matches) {
      issues.push({
        issueType: 'Informal Slang',
        severity: 'MEDIUM',
        detectedText: matches[0],
        suggestedCorrection: r.fix,
        ruleExplanation: r.explanation
      });
    }
  });

  // 2. Double Negatives
  const doubleNegatives = [
    { regex: /\b(don't|do not|doesn't|does not|didn't|did not)\s+(have|got)?\s+no\b/gi, fix: 'do not have any', explanation: 'Double negative creates semantic confusion and grammatical errors.' },
    { regex: /\bcan't\s+hardly\b/gi, fix: 'can hardly', explanation: '"can\'t hardly" is a double negative; use "can hardly".' },
    { regex: /\bnot\s+never\b/gi, fix: 'never', explanation: 'Double negative; simplify to "never".' }
  ];
  doubleNegatives.forEach(r => {
    const matches = text.match(r.regex);
    if (matches) {
      issues.push({
        issueType: 'Double Negative',
        severity: 'HIGH',
        detectedText: matches[0],
        suggestedCorrection: r.fix,
        ruleExplanation: r.explanation
      });
    }
  });

  // 3. Subject-Verb Agreement Pitfalls
  const subjectVerbRules = [
    { regex: /\b(he|she|it)\s+(don't)\b/gi, fix: '$1 does not', explanation: 'Singular third-person pronoun requires "does not".' },
    { regex: /\b(they|we|you)\s+(doesn't)\b/gi, fix: '$1 do not', explanation: 'Plural subject requires "do not".' },
    { regex: /\b(there\s+is)\s+([a-zA-Z]+s)\b/gi, fix: 'there are $2', explanation: 'Plural complement requires "there are" instead of "there is".' }
  ];
  subjectVerbRules.forEach(r => {
    const matches = text.match(r.regex);
    if (matches) {
      issues.push({
        issueType: 'Subject-Verb Agreement',
        severity: 'HIGH',
        detectedText: matches[0],
        suggestedCorrection: r.fix,
        ruleExplanation: r.explanation
      });
    }
  });

  // 4. Repeated Words (Stuttering/Repetition)
  const repeatedWords = text.match(/\b([a-zA-Z]{2,})\s+\1\b/gi);
  if (repeatedWords) {
    repeatedWords.forEach(w => {
      issues.push({
        issueType: 'Word Repetition',
        severity: 'LOW',
        detectedText: w,
        suggestedCorrection: w.split(' ')[0],
        ruleExplanation: `Accidental duplicate word "${w}". Take a breath and pause rather than repeating words.`
      });
    });
  }

  // 5. Vague Crutches & Approximations
  const vagueRules = [
    { regex: /\band\s+stuff\s+like\s+that\b/gi, fix: 'and related architecture components', explanation: 'Avoid ending technical descriptions with "and stuff like that". Be specific.' },
    { regex: /\bor\s+something\s+like\s+that\b/gi, fix: 'or an equivalent design pattern', explanation: 'Express engineering conviction rather than tentative approximations.' },
    { regex: /\band\s+things\b/gi, fix: 'and relevant application modules', explanation: 'Use concrete nouns rather than generic "things".' }
  ];
  vagueRules.forEach(r => {
    const matches = text.match(r.regex);
    if (matches) {
      issues.push({
        issueType: 'Vague Phrasing',
        severity: 'MEDIUM',
        detectedText: matches[0],
        suggestedCorrection: r.fix,
        ruleExplanation: r.explanation
      });
    }
  });

  return issues;
}

/**
 * Get available interview presets with questions
 */
async function getInterviewPresets(req, res) {
  const presets = [
    {
      id: 'wipro-elite-turbo',
      role: 'Wipro Elite & Turbo SDE',
      company: 'Wipro',
      difficulty: 'INTERMEDIATE',
      description: 'Comprehensive software engineering track focusing on Java, Spring Boot, REST APIs, and production troubleshooting.',
      questions: QUESTION_BANK['Wipro Elite & Turbo SDE']
    },
    {
      id: 'google-swe',
      role: 'Full Stack Software Engineer',
      company: 'Google',
      difficulty: 'ADVANCED',
      description: 'Big Tech systems and frontend architecture assessment focusing on high-scale web performance and system reliability.',
      questions: QUESTION_BANK['Full Stack Software Engineer']
    },
    {
      id: 'amazon-backend',
      role: 'Backend Developer',
      company: 'Amazon',
      difficulty: 'ADVANCED',
      description: 'Distributed services, database scalability, and transactional concurrency for cloud-scale architectures.',
      questions: QUESTION_BANK['Backend Developer']
    },
    {
      id: 'meta-frontend',
      role: 'Frontend Engineer',
      company: 'Meta',
      difficulty: 'INTERMEDIATE',
      description: 'Modern component lifecycle, Core Web Vitals, and WCAG accessibility standards.',
      questions: QUESTION_BANK['Frontend Engineer']
    },
    {
      id: 'cloud-devops',
      role: 'Cloud & DevOps Engineer',
      company: 'Microsoft',
      difficulty: 'ADVANCED',
      description: 'Kubernetes container lifecycles, zero-downtime deployment strategies, and CI/CD secret automation.',
      questions: QUESTION_BANK['Cloud & DevOps Engineer']
    },
    {
      id: 'data-ml',
      role: 'Data Scientist / ML Engineer',
      company: 'TechCorp Solutions',
      difficulty: 'INTERMEDIATE',
      description: 'Statistical modeling, bias-variance tradeoff, evaluation metrics, and feature preprocessing.',
      questions: QUESTION_BANK['Data Scientist / ML Engineer']
    }
  ];

  return sendSuccess(res, presets, 'Interview presets retrieved successfully');
}

/**
 * Get available interview roles and company options
 */
async function getInterviewRoles(req, res) {
  const roles = Object.keys(QUESTION_BANK);
  const companies = ['Wipro', 'Google', 'Amazon', 'Microsoft', 'TCS', 'Infosys', 'Tesla', 'Meta', 'TechCorp Solutions'];
  return sendSuccess(res, { roles, companies }, 'Interview roles and companies retrieved');
}

/**
 * Generate tailored questions for standard or custom company & role combinations
 */
function generateTailoredQuestions(targetCompany, targetRole) {
  const bankMatch = QUESTION_BANK[targetRole];
  if (bankMatch) {
    return bankMatch.map(q => {
      const customQ = q.question.replace(/Google|Wipro|Amazon|Microsoft|our enterprise/gi, targetCompany || 'our enterprise');
      const customAns = q.idealAnswer.replace(/Google|Wipro|Amazon|Microsoft/gi, targetCompany || 'the company');
      return {
        id: q.id,
        question: customQ,
        category: q.category,
        idealAnswer: customAns
      };
    });
  }

  // Dynamic custom questions for any user-added company & custom role
  return [
    {
      id: 1,
      question: `In your experience as a ${targetRole}, how do you architect resilient and high-throughput systems for ${targetCompany || 'enterprise scale'}?`,
      category: 'System Architecture & Design',
      idealAnswer: `For ${targetCompany || 'enterprise scale'}, I architect services with clear domain boundaries, event streaming with Kafka or RabbitMQ, distributed caching with Redis, and resilient connection pooling with circuit breakers to achieve sub-50ms latency.`
    },
    {
      id: 2,
      question: `Explain how you diagnose and eliminate database bottlenecks, query latencies, or deadlocks in ${targetRole} projects.`,
      category: 'Databases & Performance',
      idealAnswer: `I profile queries using EXPLAIN ANALYZE, implement covering indexes, ensure proper transaction isolation levels, and use optimistic locking or distributed locks to prevent deadlocks under high concurrency.`
    },
    {
      id: 3,
      question: `Why are you targeting ${targetCompany || 'our company'} for the ${targetRole} position, and how does your tech stack align with our engineering culture?`,
      category: 'Company Alignment & Culture',
      idealAnswer: `I admire ${targetCompany || 'the company'}'s engineering excellence and innovation. My experience in clean architecture, automated testing, and agile collaboration enables me to make an immediate impact on core product initiatives.`
    },
    {
      id: 4,
      question: `Describe a challenging technical problem you solved using the STAR methodology (Situation, Task, Action, Result).`,
      category: 'STAR Method & Problem Solving',
      idealAnswer: `Situation: During a high-load simulation, service latency spiked significantly. Task: I was responsible for diagnosing the bottleneck within a strict window. Action: I analyzed APM telemetry, identified unindexed queries and lock contention, and implemented non-blocking concurrency with caching. Result: Latency decreased by 80% and system throughput doubled.`
    }
  ];
}

/**
 * Get questions tailored for role and company
 */
async function getInterviewQuestions(req, res) {
  const { role, company } = req.query;
  const targetRole = role || 'Wipro Elite & Turbo SDE';
  const targetCompany = company || 'Wipro';

  const questions = generateTailoredQuestions(targetCompany, targetRole);

  return sendSuccess(res, {
    role: targetRole,
    company: targetCompany,
    questions: questions.map(q => ({
      id: q.id,
      question: q.question,
      category: q.category,
      idealAnswer: q.idealAnswer
    }))
  }, 'Interview questions generated');
}

/**
 * Submit and analyze full mock interview
 */
async function submitInterview(req, res) {
  const userId = req.user.id;
  const { role, role_title, company, company_name, answers, userResponse, questionsAsked } = req.body;

  const targetRole = role_title || role || 'Wipro Elite & Turbo SDE';
  const targetCompany = company_name || company || 'Wipro';

  try {
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    // Normalize answers format
    let normalizedAnswers = [];
    if (Array.isArray(answers) && answers.length > 0) {
      normalizedAnswers = answers;
    } else if (userResponse) {
      // Single continuous response fallback
      const qList = Array.isArray(questionsAsked) ? questionsAsked : ['Interview Question 1'];
      normalizedAnswers = [{
        question_id: 1,
        question: qList[0],
        user_response: userResponse
      }];
    }

    if (normalizedAnswers.length === 0) {
      return sendError(res, 'Please provide responses to analyze', 400);
    }

    let totalWords = 0;
    let totalFillerWords = 0;
    let totalTechScore = 0;
    let totalConfidenceScore = 0;
    let totalCommScore = 0;
    let totalGrammarScore = 0;
    const allGrammarMistakes = [];
    const allDetectedFillers = [];

    const targetQuestions = generateTailoredQuestions(targetCompany, targetRole);

    normalizedAnswers.forEach((item, index) => {
      const text = (item.user_response || '').trim();
      const words = text.length > 0 ? text.split(/\s+/) : [];
      const wordCount = words.length;
      totalWords += wordCount;

      // 1. Filler Words Detection
      let qFillerCount = 0;
      const qDetectedFillers = [];
      const lowerText = text.toLowerCase();
      FILLER_WORDS.forEach(fw => {
        const regex = new RegExp(`\\b${fw}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          qFillerCount += matches.length;
          qDetectedFillers.push(fw);
          if (!allDetectedFillers.includes(fw)) allDetectedFillers.push(fw);
        }
      });
      totalFillerWords += qFillerCount;

      // 2. Grammar & Phrasing Mistake Detection
      const qGrammarIssues = analyzeGrammarAndPhrasing(text);
      qGrammarIssues.forEach(iss => allGrammarMistakes.push({ ...iss, questionId: item.question_id || index + 1 }));

      let qGrammarScore = 100;
      qGrammarScore -= (qGrammarIssues.length * 8);
      if (wordCount < 10) qGrammarScore -= 20;
      qGrammarScore = Math.max(45, Math.min(100, qGrammarScore));
      totalGrammarScore += qGrammarScore;

      // 3. Technical Keyword & Concept Matching
      const qMeta = targetQuestions.find(q => q.id === item.question_id) || targetQuestions[index % targetQuestions.length];
      const expectedKeywords = qMeta?.expectedKeywords || ['architecture', 'performance', 'design', 'test', 'security'];

      const matchedKeywords = [];
      expectedKeywords.forEach(kw => {
        if (lowerText.includes(kw.toLowerCase())) {
          matchedKeywords.push(kw);
        }
      });

      const keywordCoverage = expectedKeywords.length > 0 
        ? Math.min(100, Math.round((matchedKeywords.length / (expectedKeywords.length * 0.55)) * 100))
        : 70;

      // Per-question Technical Score
      let qTechScore = 50;
      if (wordCount >= 20) qTechScore += 15;
      if (wordCount >= 45) qTechScore += 10;
      qTechScore = Math.min(100, Math.round((qTechScore * 0.35) + (keywordCoverage * 0.65)));

      // Per-question Confidence Score
      let qConfidence = 82;
      if (wordCount < 15) qConfidence -= 25;
      else if (wordCount >= 30) qConfidence += 10;
      qConfidence -= Math.min(30, qFillerCount * 5);
      qConfidence = Math.max(35, Math.min(98, qConfidence));

      // Per-question Communication & Delivery Score
      let qComm = 78;
      if (wordCount >= 25 && wordCount <= 130) qComm += 14;
      if (qFillerCount === 0) qComm += 8;
      else qComm -= Math.min(25, qFillerCount * 4);
      qComm = Math.max(40, Math.min(96, qComm));

      totalTechScore += qTechScore;
      totalConfidenceScore += qConfidence;
      totalCommScore += qComm;

      analyzedQuestions.push({
        question_id: item.question_id || index + 1,
        question: item.question || qMeta?.question || `Question ${index + 1}`,
        category: qMeta?.category || 'Technical Assessment',
        user_response: item.user_response,
        word_count: wordCount,
        filler_count: qFillerCount,
        detected_fillers: qDetectedFillers,
        grammar_issues: qGrammarIssues,
        matched_keywords: matchedKeywords,
        technical_score: qTechScore,
        confidence_score: qConfidence,
        communication_score: qComm,
        grammar_score: qGrammarScore,
        ideal_answer: qMeta?.idealAnswer || 'In an enterprise environment, structure responses using the STAR method (Situation, Task, Action, Result) with explicit technical metrics.',
        critique: wordCount < 20 
          ? 'Response is concise but lacks engineering elaboration, specific trade-offs, and metrics.'
          : matchedKeywords.length >= 3 
            ? 'Strong technical answer with domain vocabulary and clear logical structure.'
            : 'Good foundational explanation; incorporate more architecture keywords and tradeoffs for higher score.'
      });
    });

    const questionCount = normalizedAnswers.length;
    const finalTechScore = Math.round(totalTechScore / questionCount);
    const finalConfidenceScore = Math.round(totalConfidenceScore / questionCount);
    const finalCommScore = Math.round(totalCommScore / questionCount);
    const finalGrammarScore = Math.round(totalGrammarScore / questionCount);

    // Composite Overall Score & Speech Rating
    const finalOverallScore = Math.round(
      (finalTechScore * 0.40) +
      (finalConfidenceScore * 0.25) +
      (finalCommScore * 0.20) +
      (finalGrammarScore * 0.15)
    );
    const speechRatingStars = Math.min(5.0, Math.max(2.5, +(finalOverallScore / 20).toFixed(1)));

    // Generate Personalized "What to Improve & Enhancing the Student"
    const strengths = [];
    if (finalTechScore >= 75) strengths.push('Strong grasp of core architecture patterns and domain vocabulary.');
    else strengths.push('Solid fundamental understanding with clear technical instincts.');
    if (finalConfidenceScore >= 75) strengths.push('Decisive, assertive delivery with minimal hesitation.');
    if (finalGrammarScore >= 80) strengths.push('Clean grammatical syntax and formal interview diction.');
    if (totalFillerWords <= 2) strengths.push('Exceptional verbal fluency with near-zero conversational filler words.');

    const improvements = [];
    if (allGrammarMistakes.length > 0) {
      improvements.push(`Review detected grammar and colloquial slang (e.g. avoid phrases like "${allGrammarMistakes[0].detectedText}").`);
    }
    if (totalFillerWords > 3) {
      improvements.push(`Reduce filler words (${allDetectedFillers.join(', ')}). Practice inserting a silent 1-second pause when formulating thoughts.`);
    }
    if (finalTechScore < 75) {
      improvements.push('Incorporate explicit Big-O complexities, data structure internals, and system trade-offs in your answers.');
    }
    improvements.push('Structure complex situational questions using the STAR framework (Situation, Task, Action, Result).');

    // Summary Text
    let summaryText = '';
    if (finalOverallScore >= 82) {
      summaryText = `🌟 Outstanding Performance! Candidate exhibited high readiness for ${targetRole} at ${targetCompany}. Delivery was articulate, grammatically precise, and technically sound with minimal hesitation.`;
    } else if (finalOverallScore >= 68) {
      summaryText = `✅ Commendable Performance! Candidate demonstrates solid technical knowledge for ${targetRole}. Focus on polishing grammatical precision, reducing conversational filler words, and citing quantitative metrics.`;
    } else {
      summaryText = `📚 Developing Readiness. Good initial attempt! We recommend reviewing core system design topics, practicing structured STAR responses aloud, and eliminating informal slang.`;
    }

    // Insert into mock_interviews
    const [insertResult] = await pool.query(
      `INSERT INTO mock_interviews (student_id, role_title, company_name, overall_score, confidence_score, technical_score, communication_score, words_analyzed, filler_words_count, feedback_summary, transcript)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        targetRole,
        targetCompany,
        finalOverallScore,
        finalConfidenceScore,
        finalTechScore,
        finalCommScore,
        totalWords,
        totalFillerWords,
        summaryText,
        JSON.stringify({
          analyzedQuestions,
          speechRatingStars,
          grammarScore: finalGrammarScore,
          grammarMistakes: allGrammarMistakes,
          detectedFillers: allDetectedFillers,
          strengths,
          improvements,
          enhancementPlan: [
            { phase: 'Phase 1: Diction & Delivery', tip: 'Practice answering 2-minute questions without filler words by recording your audio.' },
            { phase: 'Phase 2: Technical Depth', tip: 'Memorize B-tree indexing trade-offs, Spring Boot / React lifecycle internals, and API security headers.' },
            { phase: 'Phase 3: Executive Presence', tip: 'State your high-level thesis upfront before diving into implementation details.' }
          ]
        })
      ]
    );

    // Record in user activity logs
    await pool.query(
      `INSERT INTO user_activity_logs (user_id, action_type, title, description)
       VALUES (?, 'MOCK_INTERVIEW', ?, ?)`,
      [
        userId,
        `AI Mock Interview: ${targetCompany} - ${targetRole}`,
        `Rated ${speechRatingStars} / 5.0 ⭐ (${finalOverallScore}% Readiness, Tech: ${finalTechScore}%, Grammar: ${finalGrammarScore}%).`
      ]
    );

    const report = {
      interviewId: insertResult.insertId,
      overallScore: finalOverallScore,
      speechRatingStars,
      confidenceScore: finalConfidenceScore,
      technicalScore: finalTechScore,
      communicationScore: finalCommScore,
      grammarScore: finalGrammarScore,
      totalWordsAnalyzed: totalWords,
      fillerWordsDetected: totalFillerWords,
      detectedFillers: allDetectedFillers,
      grammarMistakes: allGrammarMistakes,
      feedbackSummary: summaryText,
      strengths,
      improvements,
      questionsFeedback: analyzedQuestions,
      roleTitle: targetRole,
      companyName: targetCompany,
      role: targetRole,
      company: targetCompany,
      wordCount: totalWords,
      fillerWordsCount: totalFillerWords,
      detailedFeedback: summaryText
    };

    return sendSuccess(res, report, 'Mock interview analyzed successfully with grammar & speech ratings', 201);
  } catch (error) {
    console.error('[MockInterview submitInterview Error]', error);
    return sendError(res, 'Failed to analyze mock interview: ' + error.message, 500);
  }
}

/**
 * Get past mock interviews for student
 */
async function getInterviewHistory(req, res) {
  const userId = req.user.id;

  try {
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    const [rows] = await pool.query(
      `SELECT id, role_title, company_name, overall_score, confidence_score, technical_score, communication_score, words_analyzed, filler_words_count, feedback_summary, transcript, created_at
       FROM mock_interviews
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [studentId]
    );

    const parsedRows = rows.map(r => {
      let meta = {};
      try {
        meta = typeof r.transcript === 'string' ? JSON.parse(r.transcript) : (r.transcript || {});
      } catch (e) {
        meta = {};
      }
      return {
        id: r.id,
        role: r.role_title,
        company: r.company_name,
        overall_score: r.overall_score,
        confidence_score: r.confidence_score,
        technical_score: r.technical_score,
        communication_score: r.communication_score,
        words_analyzed: r.words_analyzed,
        filler_words_count: r.filler_words_count,
        feedback: r.feedback_summary,
        speechRatingStars: meta.speechRatingStars || (r.overall_score / 20).toFixed(1),
        grammarScore: meta.grammarScore || 85,
        grammarMistakes: meta.grammarMistakes || [],
        strengths: meta.strengths || [],
        improvements: meta.improvements || [],
        created_at: r.created_at
      };
    });

    return sendSuccess(res, parsedRows, 'Mock interview history retrieved');
  } catch (error) {
    console.error('[MockInterview getInterviewHistory Error]', error);
    return sendError(res, 'Failed to fetch interview history', 500);
  }
}

/**
 * Get specific interview session report
 */
async function getInterviewById(req, res) {
  const interviewId = req.params.id;

  try {
    const [rows] = await pool.query('SELECT * FROM mock_interviews WHERE id = ? LIMIT 1', [interviewId]);
    if (rows.length === 0) return sendError(res, 'Interview report not found', 404);

    const interview = rows[0];
    try {
      interview.transcript = typeof interview.transcript === 'string' ? JSON.parse(interview.transcript) : interview.transcript;
    } catch (e) {
      interview.transcript = {};
    }

    return sendSuccess(res, interview, 'Interview report details retrieved');
  } catch (error) {
    console.error('[MockInterview getInterviewById Error]', error);
    return sendError(res, 'Failed to fetch report', 500);
  }
}

module.exports = {
  getInterviewPresets,
  getInterviewRoles,
  getInterviewQuestions,
  submitInterview,
  getInterviewHistory,
  getInterviewById
};
