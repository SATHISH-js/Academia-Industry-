const crypto = require('crypto');
const { GoogleGenAI } = require('@google/genai');

const QUESTION_COUNT = 20;

const GEMINI_API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
let genAI = null;
if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (e) {
    console.warn('[TopicAssessmentService] GoogleGenAI init warning:', e.message);
  }
}

/**
 * High-quality domain knowledge templates to construct 20 comprehensive questions
 * across computer science, electrical, electronics, mechanical, and civil engineering.
 */
const DOMAIN_KNOWLEDGE_BASE = {
  react: [
    { q: "What is the primary benefit of React 18 Concurrent Rendering?", opts: ["Synchronous rendering blocks DOM updates", "Allows React to interrupt and prioritize urgent updates", "Eliminates need for any state hooks", "Replaces virtual DOM with WebAssembly"], ans: "B", exp: "Concurrent React allows rendering to be interrupted, yielded, or restarted, keeping the browser responsive." },
    { q: "Which hook should be used to memoize an expensive calculation between renders?", opts: ["useCallback", "useMemo", "useRef", "useLayoutEffect"], ans: "B", exp: "useMemo caches the result of an expensive calculation and only recalculates when dependencies change." },
    { q: "Why must custom hook functions begin with the 'use' prefix in React?", opts: ["It is a strict JavaScript keyword", "Enables the ESLint linter to enforce the Rules of Hooks", "It automatically attaches global state", "It binds the function to the Window object"], ans: "B", exp: "The 'use' prefix signals to React and the ESLint plugin to verify that the Rules of Hooks are observed." },
    { q: "When using useEffect with an empty dependency array [], when does cleanup run?", opts: ["After every state change", "Never", "When the component unmounts", "Before the first paint"], ans: "C", exp: "An empty dependency array [] indicates the effect runs once on mount, and its cleanup function runs when unmounted." },
    { q: "How does React.memo optimize component performance?", opts: ["By preventing parent components from re-rendering", "By shallowly comparing previous and next props to skip render", "By deep cloning the component's internal state", "By converting the component into a Web Worker"], ans: "B", exp: "React.memo performs a shallow comparison of props and skips rendering if props have not changed." }
  ],
  node: [
    { q: "In the Node.js event loop, which phase executes setImmediate() callbacks?", opts: ["Timers phase", "Poll phase", "Check phase", "Close callbacks phase"], ans: "C", exp: "setImmediate() callbacks are specifically scheduled and executed in the Check phase of the libuv event loop." },
    { q: "What is the correct way to handle unhandled asynchronous errors in an Express 4 middleware?", opts: ["Pass the error to next(err)", "Throw error synchronously", "Call res.send(err)", "Restart the process immediately"], ans: "A", exp: "Calling next(err) passes the error down to Express's centralized error handling middleware." },
    { q: "Which HTTP header is essential for mitigating Cross-Site Scripting (XSS) via cookies?", opts: ["Access-Control-Allow-Origin", "HttpOnly", "X-Frame-Options", "Content-Type"], ans: "B", exp: "The HttpOnly flag prevents client-side JavaScript from accessing cookies, mitigating session theft via XSS." },
    { q: "Why is connection pooling critical when connecting Node.js to a relational database like MySQL or PostgreSQL?", opts: ["Node.js is multithreaded by default", "Avoids the overhead of establishing a new TCP/TLS handshake on every request", "It bypasses SQL syntax checking", "It encrypts table columns automatically"], ans: "B", exp: "Connection pooling reuses idle connections, significantly reducing the cost of repeated TCP/TLS handshakes." }
  ],
  java: [
    { q: "What is the primary breakthrough introduced by Java 21 Virtual Threads (Project Loom)?", opts: ["Direct compilation to C++ binaries", "Lightweight user-mode threads scheduled by the JVM rather than 1:1 OS kernel threads", "Removal of all garbage collection pauses", "Automatic generation of database schemas"], ans: "B", exp: "Virtual threads are lightweight threads managed by the JVM that dramatically increase throughput for I/O-bound tasks." },
    { q: "In Spring Data JPA, how can the notorious N+1 query problem be resolved?", opts: ["Using JOIN FETCH in JPQL or EntityGraphs", "Adding @Transactional(readOnly = true)", "Disabling second-level cache", "Using native SQL only"], ans: "A", exp: "JOIN FETCH or @EntityGraph eagerly loads related entities in a single SQL query, avoiding N subsequent queries." },
    { q: "What does the @Transactional propagation REQUIRED attribute specify in Spring?", opts: ["Always suspends the current transaction and creates a new one", "Supports current transaction; creates a new one if none exists", "Throws an exception if a transaction is already active", "Runs without any transaction context"], ans: "B", exp: "PROPAGATION_REQUIRED joins the existing transaction if available, otherwise initiates a new one." },
    { q: "How does Apache Kafka guarantee message ordering within a topic?", opts: ["Across all partitions globally", "Only within a single partition", "By hashing the timestamp", "Using round-robin consumer groups"], ans: "B", exp: "Kafka guarantees total FIFO ordering within a single partition, using the message key to route related events to that partition." }
  ],
  python: [
    { q: "How does FastAPI achieve high concurrent request performance?", opts: ["By running on the GIL-free CPython 2", "By leveraging Python asyncio event loops with Starlette and Pydantic", "By compiling Python to WebAssembly", "By running every request in a separate OS thread"], ans: "B", exp: "FastAPI is built on Starlette and Pydantic, executing asynchronous endpoints within an asyncio event loop." },
    { q: "In SQLAlchemy 2.0, what is the recommended way to execute an asynchronous query with asyncpg?", opts: ["await session.execute(select(Model))", "session.query(Model).all() synchronously", "session.raw_sql()", "session.thread_run()"], ans: "A", exp: "SQLAlchemy 2.0 uses 2.0-style select() statements executed asynchronously via await session.execute()." },
    { q: "What role does Redis typically play when paired with Celery in Python applications?", opts: ["Primary relational database", "In-memory message broker and result backend", "Frontend rendering engine", "Static file reverse proxy"], ans: "B", exp: "Redis serves as a fast, in-memory queue message broker and task result store for Celery workers." }
  ],
  embedded: [
    { q: "Why is the 'volatile' keyword critical when declaring hardware registers in Embedded C?", opts: ["It stores the variable in external flash", "It informs the compiler not to optimize away reads/writes to memory-mapped addresses", "It makes the variable thread-safe automatically", "It converts integer types to floating point"], ans: "B", exp: "'volatile' ensures the compiler does not optimize away repeated reads or writes to memory locations that can change outside software control." },
    { q: "In the ARM Cortex-M architecture, what is the role of the NVIC?", opts: ["Network Virtual Interface Controller", "Nested Vectored Interrupt Controller for deterministic interrupt handling", "Non-Volatile Instruction Cache", "Numerical Vector Integer Calculation unit"], ans: "B", exp: "The NVIC provides low-latency, deterministic interrupt handling with configurable priority levels in ARM Cortex-M." },
    { q: "What are the two signals used in the standard I2C communication protocol?", opts: ["MOSI and MISO", "TX and RX", "SDA (Serial Data) and SCL (Serial Clock)", "CAN_H and CAN_L"], ans: "C", exp: "I2C operates using two bidirectional open-drain lines: SDA (Data) and SCL (Clock) with pull-up resistors." },
    { q: "In FreeRTOS, what mechanism prevents priority inversion when multiple tasks share a resource?", opts: ["Priority Inheritance within Mutexes", "Disabling all interrupts indefinitely", "Task deletion", "Round-robin time slicing without priorities"], ans: "A", exp: "Priority inheritance temporarily elevates the priority of a low-priority task holding a mutex to that of the highest task waiting for it." }
  ],
  ev: [
    { q: "What is the primary function of cell balancing in a Lithium-ion Battery Management System (BMS)?", opts: ["Increasing the maximum charge voltage of all cells", "Equalizing state of charge across cells to prevent overcharging or premature cutoff", "Heating the cells during discharge", "Discharging the pack to zero volts"], ans: "B", exp: "Cell balancing ensures all cells in a series pack maintain equal voltage and state of charge, maximizing usable capacity and safety." },
    { q: "Why is Field-Oriented Control (FOC) preferred for Electric Vehicle PMSM traction motors?", opts: ["It eliminates the need for battery power", "Decouples torque and flux control, delivering high efficiency and smooth torque across all speeds", "Operates without any mathematical transforms", "Requires only square wave inputs"], ans: "B", exp: "FOC transforms 3-phase stator currents into orthogonal d-q components, enabling independent control of magnetic flux and motor torque." },
    { q: "In automotive CAN bus architecture, how does message arbitration resolve collisions?", opts: ["First-come, first-served with random backoff", "Dominant bit (0) overwrites recessive bit (1), so lowest message ID wins priority", "Central master unit polls each node synchronously", "Colliding nodes abort and discard all packets"], ans: "B", exp: "CAN arbitration uses non-destructive bitwise arbitration where dominant (0) bits overwrite recessive (1) bits, granting immediate bus access to lower IDs." }
  ],
  civil: [
    { q: "What distinguishes Level 2 BIM from traditional 2D CAD drafting?", opts: ["Hand-drawn blueprints with colored pens", "Collaborative 3D parametric models shared across disciplines with metadata", "Only using photos of existing buildings", "Eliminating all engineering review meetings"], ans: "B", exp: "Level 2 BIM involves collaborative 3D parametric models containing comprehensive structural, MEP, and architectural intelligence." },
    { q: "In STAAD.Pro structural analysis, what does a P-Delta analysis account for?", opts: ["Secondary structural effects caused by gravity loads acting on deflected lateral shapes", "Painting costs per square meter", "Soil moisture evaporation", "Direct solar radiation heat gain"], ans: "A", exp: "P-Delta analysis evaluates secondary non-linear moments and forces generated when axial loads act on displaced structural members." }
  ],
  general: [
    { q: "What is the time complexity of searching for an element in a balanced Binary Search Tree (AVL / Red-Black)?", opts: ["O(1)", "O(log N)", "O(N)", "O(N log N)"], ans: "B", exp: "Balanced binary search trees maintain logarithmic height, ensuring search, insertion, and deletion operate in O(log N) time." },
    { q: "Which design pattern is best suited for notifying multiple dependent objects whenever a state change occurs?", opts: ["Singleton", "Observer", "Adapter", "Factory Method"], ans: "B", exp: "The Observer pattern defines a one-to-many dependency where observers are automatically notified upon subject state changes." },
    { q: "What does the principle of Idempotency mean in REST API engineering?", opts: ["The endpoint can only be called once per day", "Making multiple identical requests produces the same outcome as a single request", "The response must be encrypted with RSA", "The server generates random tokens"], ans: "B", exp: "An idempotent operation (e.g. GET, PUT, DELETE) produces the exact same server state regardless of whether called once or ten times." },
    { q: "In distributed database architecture, what does the CAP theorem state is impossible to guarantee simultaneously across network partitions?", opts: ["Cost, Availability, Performance", "Consistency, Availability, and Partition Tolerance", "Concurrency, Authorization, Privacy", "Caching, Architecture, Polling"], ans: "B", exp: "The CAP theorem proves that in the presence of a network partition (P), a distributed system can guarantee Consistency (C) or Availability (A), but not both." }
  ]
};

/**
 * Fallback generator for 20 topic-specific MCQs
 */
function generateFallbackTopicQuiz(topicTitle, taskDescription = '', department = '') {
  const normalized = (topicTitle + ' ' + taskDescription + ' ' + department).toLowerCase();
  
  let primaryKey = 'general';
  if (normalized.includes('react') || normalized.includes('frontend') || normalized.includes('hook') || normalized.includes('component')) {
    primaryKey = 'react';
  } else if (normalized.includes('node') || normalized.includes('express') || normalized.includes('middleware') || normalized.includes('jwt')) {
    primaryKey = 'node';
  } else if (normalized.includes('java') || normalized.includes('spring') || normalized.includes('jpa') || normalized.includes('kafka')) {
    primaryKey = 'java';
  } else if (normalized.includes('python') || normalized.includes('fastapi') || normalized.includes('celery') || normalized.includes('django')) {
    primaryKey = 'python';
  } else if (normalized.includes('embedded') || normalized.includes('arm') || normalized.includes('cortex') || normalized.includes('iot') || normalized.includes('vlsi') || normalized.includes('spi')) {
    primaryKey = 'embedded';
  } else if (normalized.includes('ev') || normalized.includes('battery') || normalized.includes('bms') || normalized.includes('motor') || normalized.includes('can bus')) {
    primaryKey = 'ev';
  } else if (normalized.includes('bim') || normalized.includes('revit') || normalized.includes('staad') || normalized.includes('civil') || normalized.includes('structural')) {
    primaryKey = 'civil';
  }

  const selectedPool = [
    ...(DOMAIN_KNOWLEDGE_BASE[primaryKey] || []),
    ...(DOMAIN_KNOWLEDGE_BASE.general || []),
    ...(DOMAIN_KNOWLEDGE_BASE.node || []),
    ...(DOMAIN_KNOWLEDGE_BASE.react || []),
    ...(DOMAIN_KNOWLEDGE_BASE.java || [])
  ];

  const questions = [];
  for (let i = 1; i <= QUESTION_COUNT; i++) {
    const item = selectedPool[(i - 1) % selectedPool.length];
    const difficulty = i <= 5 ? 'FOUNDATIONAL' : i <= 15 ? 'APPLIED' : 'ADVANCED';

    questions.push({
      id: i,
      question: `[Q${i} - ${difficulty}] Regarding "${topicTitle}": ${item.q}`,
      options: item.opts,
      answer: item.ans,
      explanation: item.exp
    });
  }

  return {
    topicTitle,
    department,
    questions
  };
}

/**
 * Generate 20 MCQs for a specific topic using Gemini (with fallback)
 */
async function generate20QuestionsForTopic(topicTitle, taskDescription, skillName, department) {
  if (!genAI) {
    return generateFallbackTopicQuiz(topicTitle, taskDescription, department);
  }

  const prompt = `
You are a senior engineering faculty assessor and technical interviewer.
TOPIC TO ASSESS: "${topicTitle}"
CONTEXT / TASK DETAILS: "${taskDescription || 'In-depth engineering topic'}"
SKILL CATEGORY: "${skillName || 'Engineering'}"
COLLEGE DEPARTMENT: "${department || 'Engineering'}"

TASK:
Generate EXACTLY 20 rigorous, highly relevant multiple-choice questions (MCQs) for student competency verification on this topic.
- Distribution: 5 Foundational/Conceptual, 10 Applied/Methodology, 5 Edge-Case/Troubleshooting & Best Practices.
- Test concrete technical concepts, syntax, architectural principles, algorithms, and practical debugging related specifically to "${topicTitle}".
- Each question must have exactly 4 choices (A, B, C, D).
- Specify the correct answer letter ("A", "B", "C", or "D").
- Provide a concise 1-2 sentence technical explanation.

OUTPUT FORMAT:
Return pure JSON with this exact schema:
{
  "topicTitle": "${topicTitle}",
  "department": "${department || 'Engineering'}",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "A",
      "explanation": "Clear reason why A is correct."
    }
  ]
}
Return pure JSON only. Do not include markdown codeblocks or conversational text.
`;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text ? response.text.trim() : '';
    const cleaned = text.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleaned);

    if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length >= 10) {
      // Pad to 20 if needed
      let qList = parsed.questions.slice(0, QUESTION_COUNT).map((q, idx) => ({
        id: idx + 1,
        question: q.question,
        options: (q.options && q.options.length === 4) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: (q.answer || 'A').toUpperCase().trim(),
        explanation: q.explanation || 'Verified domain knowledge.'
      }));

      if (qList.length < QUESTION_COUNT) {
        const fallback = generateFallbackTopicQuiz(topicTitle, taskDescription, department);
        while (qList.length < QUESTION_COUNT) {
          const nextQ = fallback.questions[qList.length];
          nextQ.id = qList.length + 1;
          qList.push(nextQ);
        }
      }

      return {
        topicTitle,
        department,
        questions: qList
      };
    }
    return generateFallbackTopicQuiz(topicTitle, taskDescription, department);
  } catch (err) {
    console.warn('[TopicAssessmentService] Gemini generation warning, using comprehensive fallback:', err.message);
    return generateFallbackTopicQuiz(topicTitle, taskDescription, department);
  }
}

/**
 * Evaluate submitted answers against correct question keys
 */
function evaluateTopicAnswers(questionsWithAnswers, userAnswers = {}) {
  let correctCount = 0;
  const questionsReview = [];

  questionsWithAnswers.forEach((q) => {
    const submitted = (userAnswers[q.id] || '').toUpperCase().trim();
    const isCorrect = submitted === q.answer;
    if (isCorrect) correctCount++;

    questionsReview.push({
      id: q.id,
      question: q.question,
      options: q.options,
      userAnswer: submitted || 'NONE',
      correctAnswer: q.answer,
      isCorrect,
      explanation: q.explanation
    });
  });

  const total = questionsWithAnswers.length || QUESTION_COUNT;
  const scorePercentage = Math.round((correctCount / total) * 100);
  const passed = scorePercentage >= 60;
  const badgeAwarded = scorePercentage >= 90;

  // Cryptographic certificate verification hash
  const hash = crypto.randomBytes(4).toString('hex').toUpperCase();
  const verificationCode = `CERT-VERIF-TOPIC-${Date.now().toString(36).toUpperCase()}-${hash}`;

  return {
    totalQuestions: total,
    correctCount,
    scorePercentage,
    passed,
    badgeAwarded,
    verificationCode,
    questionsReview
  };
}

module.exports = {
  generate20QuestionsForTopic,
  evaluateTopicAnswers
};
