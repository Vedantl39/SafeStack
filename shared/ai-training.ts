// AI literacy training content (EU AI Act, Article 4).
// {owner} and {tools} are replaced with the company's AI owner and approved tools.

export const TRAINING_VERSION = "SafeStack AI literacy essentials v1 (Oct 2026)";
export const PASS_MARK = 0.8;

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  points: string[];
  example?: string;
}

export const LESSONS: Lesson[] = [
  {
    id: "act",
    title: "What the EU AI Act means for us",
    minutes: 2,
    points: [
      "The EU AI Act regulates AI by risk. Most everyday tools, like writing assistants, are low risk. AI used for decisions about people, such as hiring or credit, is high risk and has strict rules.",
      "Most of the time we are a 'deployer': we use AI that someone else built. We still have duties, especially around how we use it and what we tell people.",
      "Since February 2025 every company must make sure staff who use AI understand it well enough to use it responsibly. This training is part of how we meet that duty.",
      "Our AI owner is {owner}. They keep track of which AI tools we use and answer questions about them.",
    ],
  },
  {
    id: "data",
    title: "Using AI tools safely with data",
    minutes: 3,
    points: [
      "Only use approved AI tools for work: {tools}. If you want to try a new tool, ask {owner} first.",
      "Never paste client data, personal data (names, emails, CVs, health or financial details) or confidential company information into an AI tool that is not approved for it.",
      "Free or personal AI accounts may store what you type and use it to train their models. Treat anything you paste as potentially leaving the company.",
      "If you need AI help with sensitive material, remove names and identifying details first, or use an approved tool that is set up for it.",
      "GDPR still applies when AI is involved. Personal data must only be used for the purpose it was collected for.",
    ],
    example: "A colleague pastes a client's contract into a free chatbot to summarise it. Even if the summary is useful, the client's confidential terms have now been shared with a third party.",
  },
  {
    id: "check",
    title: "Checking what AI gives you",
    minutes: 2,
    points: [
      "AI can sound confident and still be wrong. It can invent facts, figures, quotes and sources.",
      "Check anything you rely on: numbers, names, dates, legal or technical statements, and links.",
      "AI can reflect bias in the data it learned from. Be especially careful with anything that affects people.",
      "You stay responsible for work you send, even if AI helped write it.",
      "AI should never be the only basis for a decision about a person, such as rejecting a job applicant. A person must review it.",
    ],
  },
  {
    id: "transparency",
    title: "Being open about AI",
    minutes: 2,
    points: [
      "If people chat with an AI system of ours, such as a website chatbot, they must be told they are talking to AI.",
      "Realistic AI-generated or edited images, audio or video of real people, places or events must be clearly labelled as AI-generated.",
      "AI-written text published to inform the public must be disclosed as AI-generated, unless a person has reviewed it and takes editorial responsibility.",
      "These transparency rules have applied since 2 August 2026.",
    ],
  },
  {
    id: "redlines",
    title: "Red lines and reporting problems",
    minutes: 2,
    points: [
      "Some uses of AI are banned outright in the EU, including judging people's emotions at work or school, scoring people on their social behaviour, and creating fake intimate images of real people.",
      "Do not start using AI for hiring, performance reviews, credit or similar decisions about people without approval from {owner}. These are high-risk uses.",
      "If an AI tool produces something harmful, discriminatory or clearly wrong, or you think data was shared by mistake, report it to {owner} straight away.",
      "Reporting early is always better. Nobody gets in trouble for flagging a concern.",
    ],
  },
];

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    question: "A client emails you a spreadsheet with customer names and addresses. Can you paste it into a free AI chatbot to tidy it up?",
    options: [
      "Yes, as long as you delete the chat afterwards",
      "No. Personal data must only go into approved tools set up for it",
      "Yes, if the chatbot is well known",
    ],
    correct: 1,
    explanation: "Free tools may store and reuse what you paste. Personal data only goes into approved tools.",
  },
  {
    id: "q2",
    question: "You want to try a new AI tool for work. What should you do first?",
    options: ["Ask the AI owner whether it is approved", "Use it and mention it later", "Use it only on a personal account"],
    correct: 0,
    explanation: "New tools need approval so the company knows what AI it uses and what data goes where.",
  },
  {
    id: "q3",
    question: "An AI assistant gives you a statistic for a client report. What do you do?",
    options: ["Use it, AI is usually accurate", "Check it against a reliable source before using it", "Use it but round the number"],
    correct: 1,
    explanation: "AI can invent figures and sources. You are responsible for checking anything you rely on.",
  },
  {
    id: "q4",
    question: "An AI tool ranks job applicants. Can the lowest-ranked people be rejected automatically?",
    options: ["Yes, that saves time", "Only if the tool is expensive", "No. A person must review decisions about people"],
    correct: 2,
    explanation: "Hiring is a high-risk use. AI must not be the only basis for decisions about people.",
  },
  {
    id: "q5",
    question: "Visitors chat with an AI assistant on our website. What does the AI Act require?",
    options: ["Nothing", "They must be told they are talking to AI", "They must sign a consent form"],
    correct: 1,
    explanation: "Article 50 requires people to be told when they are interacting with an AI system.",
  },
  {
    id: "q6",
    question: "Marketing creates a realistic AI image of a real-looking customer for an ad. What is needed?",
    options: ["A clear label that it is AI-generated", "Nothing, it is only marketing", "Permission from the AI tool provider"],
    correct: 0,
    explanation: "Realistic AI-generated content must be disclosed as AI-generated.",
  },
  {
    id: "q7",
    question: "Which of these is banned under the EU AI Act?",
    options: ["Using AI to draft emails", "Using AI to judge employees' emotions during meetings", "Using AI to translate documents"],
    correct: 1,
    explanation: "Emotion recognition in the workplace is a prohibited practice (except for medical or safety reasons).",
  },
  {
    id: "q8",
    question: "You realise you pasted confidential information into the wrong AI tool. What now?",
    options: ["Say nothing and delete the chat", "Report it to the AI owner straight away", "Wait to see if anything happens"],
    correct: 1,
    explanation: "Report concerns early so they can be handled quickly. Nobody gets in trouble for flagging a concern.",
  },
];

export function fillTemplate(text: string, owner: string, tools: string): string {
  return text
    .replace(/\{owner\}/g, owner?.trim() || "your AI owner")
    .replace(/\{tools\}/g, tools?.trim() || "the tools your company has approved");
}

export function scoreQuiz(answers: Record<string, number>): { correct: number; total: number; passed: boolean } {
  const correct = QUIZ.filter((q) => answers[q.id] === q.correct).length;
  return { correct, total: QUIZ.length, passed: correct / QUIZ.length >= PASS_MARK };
}
