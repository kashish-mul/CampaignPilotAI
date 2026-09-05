import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  Bot, 
  FileText, 
  Mic, 
  Copy, 
  Check,
  Maximize2,
  Tv,
  ArrowRight
} from 'lucide-react';

interface PitchChapter {
  id: number;
  timeRange: string;
  title: string;
  speaker: string;
  scriptText: string;
  badge: string;
  category: string;
  keyPoints: string[];
}

const PITCH_CHAPTERS: PitchChapter[] = [
  {
    id: 1,
    timeRange: "0:00 – 0:30",
    title: "Introduction",
    speaker: "Kashish Mulchandani (Co-founder)",
    badge: "The Vision",
    category: "intro",
    scriptText: "Hello everyone, my name is Kashish, and this is CampaignPilot AI. The idea behind this project is simple: What if a merchant's payment and customer data could automatically tell them where their next revenue opportunity is — and an AI system could turn that opportunity into a campaign, verify it, get approval, and safely execute it? That's exactly what CampaignPilot AI is designed to do.",
    keyPoints: [
      "Autonomous revenue opportunity detection from store payment data",
      "Explainable AI that turns signals into bounded campaigns",
      "Self-verifying multi-agent architecture with Razorpay Test Mode execution"
    ]
  },
  {
    id: 2,
    timeRange: "0:30 – 1:10",
    title: "The Problem",
    speaker: "Kashish Mulchandani (Co-founder)",
    badge: "Merchant Data Bottleneck",
    category: "problem",
    scriptText: "Today, merchants generate a huge amount of data through transactions, customers, products, and payment activity. But having data is not the same as having actionable intelligence. A merchant might have customers who haven't purchased for months, high-value customers who are becoming inactive, failed payments, or customers who could potentially buy related products. The problem is that identifying these opportunities, designing campaigns, checking whether they are safe, and executing them usually requires multiple manual steps. And when AI is introduced into the process, another problem appears: How do we make sure the AI doesn't make an unsafe or unsupported decision?",
    keyPoints: [
      "Data rich, insight poor: 126 dormant customers & 87 failed payments go unnoticed",
      "High operational friction: manual cohort extraction & campaign setups take days",
      "The Unsafe AI Dilemma: Hallucinations, uncontrolled discounts, and unverified data"
    ]
  },
  {
    id: 3,
    timeRange: "1:10 – 1:50",
    title: "Our Solution: Multi-Agent Architecture",
    speaker: "Kashish Mulchandani (Co-founder)",
    badge: "Modular Agents",
    category: "solution",
    scriptText: "CampaignPilot AI solves this using an explainable, self-verifying multi-agent architecture. Instead of giving one LLM complete control, we divide the workflow into specialized agents. The first is the Data Analyst Agent. It analyzes merchant data and identifies opportunities. For example, it might discover: 'There are 126 customers who have not purchased for more than 60 days.' It can also identify failed-payment opportunities and cross-selling candidates. Then the Campaign Agent converts that opportunity into a concrete campaign proposal. For example: Win back inactive customers with a maximum 10% discount, targeting up to 100 customers for a limited campaign period.",
    keyPoints: [
      "No single giant LLM: Specialized agents with discrete responsibilities",
      "Data Analyst Agent: Uncovers verifiable ground-truth revenue opportunities",
      "Campaign Agent: Synthesizes bounded, targeted campaign proposals"
    ]
  },
  {
    id: 4,
    timeRange: "1:50 – 2:35",
    title: "The Important Part: Verification & Safety",
    speaker: "Kashish Mulchandani (Co-founder)",
    badge: "Zero Hallucination",
    category: "verification",
    scriptText: "But we don't blindly trust the AI. This is one of the most important parts of CampaignPilot AI. Before anything can be executed, the Verifier Agent independently checks the recommendation. It asks: Is the opportunity supported by the transaction data? Is the target audience valid? Is the proposed discount within the allowed limit? Is the budget reasonable? Does the explanation actually match the evidence? After that, we have a deterministic Policy and Risk Engine. For example, our system can enforce limits such as: Maximum discount 10%, Maximum audience 100 customers, Maximum campaign duration 7 days, and Maximum campaign budget ₹10,000. These limits are implemented as application logic rather than being controlled by the LLM. So the AI can recommend. But the AI cannot override the rules.",
    keyPoints: [
      "Verifier Agent ⭐: Independent mathematical check against raw records",
      "Deterministic Policy Engine 🔐: Hard code limits that LLMs cannot alter",
      "Enforced constraints: Max 10% discount, 100 customers, 7 days, ₹10k budget"
    ]
  },
  {
    id: 5,
    timeRange: "2:35 – 3:15",
    title: "Human Approval Gate",
    speaker: "Kashish Mulchandani (Co-founder)",
    badge: "Human-in-the-Loop",
    category: "approval",
    scriptText: "The next stage is Human-in-the-Loop approval. The system does not immediately execute an AI-generated campaign. Instead, the merchant sees: the opportunity, supporting evidence, target audience, proposed discount, budget, confidence, risk level, and verifier result. The merchant can then approve or reject the campaign. This gives us a much safer workflow: AI discovers, AI proposes, AI verifies, Policy checks, Human approves, System executes.",
    keyPoints: [
      "Zero autonomous dispatches: Explicit merchant review required",
      "Transparent decision card: Side-by-side evidence, risk, and ROI bounds",
      "Causal Chain: Discover → Propose → Verify → Policy → Approve → Execute"
    ]
  },
  {
    id: 6,
    timeRange: "3:15 – 3:55",
    title: "Razorpay Test Mode Integration",
    speaker: "Kashish Mulchandani (Co-founder)",
    badge: "Safe Sandbox",
    category: "razorpay",
    scriptText: "After approval, CampaignPilot AI can move to the execution stage using Razorpay Test Mode. For development, Test Mode provides a sandbox environment for testing integrations without processing real payments. Razorpay also uses separate Test and Live API keys, and its APIs use Basic Authentication with the key ID and key secret. In our architecture, Razorpay credentials stay on the backend and are never exposed through the frontend. This allows us to demonstrate the complete decision-to-execution workflow while keeping development isolated from real transactions.",
    keyPoints: [
      "Isolated Test Sandbox: Generates real test orders and payment links",
      "Backend credential isolation: Keys secured in server environment variables",
      "Financial Safety: ₹0.00 real money moved, 100% test mode transactions"
    ]
  },
  {
    id: 7,
    timeRange: "3:55 – 4:25",
    title: "Failure Handling & Audit Trail",
    speaker: "Kashish Mulchandani (Co-founder)",
    badge: "Traceability",
    category: "audit",
    scriptText: "We also designed the system for failure. Suppose an approved action fails during execution. The system doesn't continuously retry blindly. It follows a bounded retry strategy and uses a circuit-breaker approach to stop further attempts when necessary. At the same time, every important decision is recorded in an Audit Trail. We record: what opportunity was detected, what evidence supported it, what campaign was proposed, what the verifier decided, what policy checks passed or failed, whether the merchant approved it, and what happened during execution. So the system isn't just automated. It is traceable and explainable.",
    keyPoints: [
      "Circuit Breaker Pattern: Max 1 retry before safe halt to prevent cascades",
      "Immutable Audit Log: Full provenance matching ACT-00042 format",
      "Answers 'Why did the AI do this?' with complete causal audit trail"
    ]
  },
  {
    id: 8,
    timeRange: "4:25 – 4:50",
    title: "Live Product Walkthrough",
    speaker: "Kashish Mulchandani (Co-founder)",
    badge: "Interactive Demo",
    category: "demo",
    scriptText: "Now let's look at the dashboard. Here we can see the merchant's overall business metrics. The system identifies opportunities such as inactive customers, failed payments, and cross-selling candidates. Let's open the win-back opportunity. We can see the affected customer segment, estimated opportunity, confidence, recommended campaign parameters, and supporting evidence. Next, the verifier checks the proposal. The policy engine confirms that the campaign is within the allowed limits. Now the merchant can approve it. After approval, the system moves to the execution stage and records the result in the audit trail.",
    keyPoints: [
      "Live dashboard with ₹4.82L revenue & 126 at-risk customers",
      "One-click ground-truth evidence verification drawer",
      "Seamless progression from Verifier check to Razorpay test order"
    ]
  },
  {
    id: 9,
    timeRange: "4:50 – 5:00",
    title: "Closing & Vision",
    speaker: "Kashish Mulchandani (Co-founder)",
    badge: "Final Summary",
    category: "closing",
    scriptText: "So, CampaignPilot AI is not simply another AI chatbot. It is an agentic merchant-growth system designed around four principles: Discover. Verify. Approve. Execute. Our goal is to make AI-powered merchant automation not only intelligent, but also bounded, explainable, human-controlled, and auditable. Thank you.",
    keyPoints: [
      "Agentic commerce paradigm: Beyond generic chat interfaces",
      "Core 4 Pillars: Discover → Verify → Approve → Execute",
      "Autonomous efficiency with bulletproof enterprise risk boundaries"
    ]
  }
];

interface PitchVideoStudioProps {
  onNavigateToTab: (tabId: string) => void;
}

export const PitchVideoStudio: React.FC<PitchVideoStudioProps> = ({ onNavigateToTab }) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [copiedScript, setCopiedScript] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [activeTabMode, setActiveTabMode] = useState<'video' | 'teleprompter'>('video');

  const currentChapter = PITCH_CHAPTERS[currentChapterIndex];
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Synthesis & Find High Quality Female Voice
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);

        // Find preferable natural female English voice for Kashish Mulchandani persona
        const femaleIndex = voices.findIndex(v => 
          (v.lang.startsWith('en') && (
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('karen') ||
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('victoria') ||
            v.name.toLowerCase().includes('serena') ||
            v.name.toLowerCase().includes('google uk english female') ||
            v.name.toLowerCase().includes('google us english')
          ))
        );

        if (femaleIndex !== -1) {
          setSelectedVoiceIndex(femaleIndex);
        } else {
          // fallback to first english voice
          const enIndex = voices.findIndex(v => v.lang.startsWith('en'));
          if (enIndex !== -1) setSelectedVoiceIndex(enIndex);
        }
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle Speech playback on chapter change or play toggle
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (isPlaying && voiceEnabled) {
      const utterance = new SpeechSynthesisUtterance(currentChapter.scriptText);
      
      if (availableVoices[selectedVoiceIndex]) {
        utterance.voice = availableVoices[selectedVoiceIndex];
      }
      
      // Female pitch and natural pace
      utterance.pitch = 1.15;
      utterance.rate = 0.98;

      utterance.onend = () => {
        if (currentChapterIndex < PITCH_CHAPTERS.length - 1) {
          // Auto advance to next chapter
          setCurrentChapterIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isPlaying, currentChapterIndex, voiceEnabled, selectedVoiceIndex, availableVoices]);

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < PITCH_CHAPTERS.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    window.speechSynthesis.cancel();
    setCurrentChapterIndex(0);
    setIsPlaying(true);
  };

  const handleCopyFullScript = () => {
    const fullText = PITCH_CHAPTERS.map(c => 
      `## ${c.timeRange} — ${c.title}\nSpeaker: ${c.speaker}\n\n${c.scriptText}\n`
    ).join('\n---\n\n');
    navigator.clipboard.writeText(fullText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Presenter Identity */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Mic className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            {isPlaying && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Kashish Mulchandani</h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Co-founder
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              5-Minute Executive Pitch Video &bull; CampaignPilot AI
            </p>
          </div>
        </div>

        {/* View Switcher & Audio Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTabMode('video')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTabMode === 'video' 
                  ? 'bg-emerald-500 text-slate-950 font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Pitch Presentation</span>
            </button>
            <button
              onClick={() => setActiveTabMode('teleprompter')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTabMode === 'teleprompter' 
                  ? 'bg-emerald-500 text-slate-950 font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Full Script &amp; Teleprompter</span>
            </button>
          </div>

          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-xl border text-xs transition flex items-center gap-1.5 ${
              voiceEnabled 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={voiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-xs font-medium hidden sm:inline">
              {voiceEnabled ? 'Voice: On (Girl/Female)' : 'Voice: Muted'}
            </span>
          </button>

          <button
            onClick={handleCopyFullScript}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
          </button>
        </div>
      </div>

      {activeTabMode === 'video' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Cinema Video Stage (16:9 Display Canvas) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative aspect-[16/9] w-full rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between p-6 sm:p-8">
              {/* Background ambient lighting */}
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Top Stage Header */}
              <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {currentChapter.timeRange}
                  </span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Chapter {currentChapter.id} of {PITCH_CHAPTERS.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
                    {currentChapter.badge}
                  </span>
                </div>
              </div>

              {/* Dynamic Center Visual Graphic Per Chapter */}
              <div className="relative z-10 my-auto py-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                    {currentChapter.title}
                  </h3>
                  <div className="text-xs text-emerald-400/90 font-medium">
                    Presented by Kashish Mulchandani &bull; Co-founder
                  </div>
                </div>

                {/* Visual Architecture Cards depending on category */}
                {currentChapter.category === 'intro' && (
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 max-w-xl text-xs space-y-2">
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <Compass className="w-4 h-4 text-emerald-400" />
                      <span>CampaignPilot AI Core Thesis</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      "Turn raw payment and transaction signals into verified, bounded, merchant-approved campaigns executed safely via Razorpay Test Mode."
                    </p>
                  </div>
                )}

                {currentChapter.category === 'problem' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl text-xs">
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                      <span className="text-rose-400 font-bold block text-base">126</span>
                      <span className="text-slate-400 text-[11px]">Dormant Customers</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                      <span className="text-amber-400 font-bold block text-base">87</span>
                      <span className="text-slate-400 text-[11px]">Failed Payments</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 col-span-2 sm:col-span-1">
                      <span className="text-white font-bold block text-base">Risk</span>
                      <span className="text-slate-400 text-[11px]">Unsafe AI Hallucination</span>
                    </div>
                  </div>
                )}

                {currentChapter.category === 'solution' && (
                  <div className="flex items-center gap-2 max-w-xl text-xs overflow-x-auto py-1">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 whitespace-nowrap">
                      <span className="text-white font-semibold">1. Store Data</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 whitespace-nowrap">
                      <span className="text-emerald-300 font-semibold">2. Analyst Agent</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <div className="p-2.5 rounded-lg bg-teal-950/60 border border-teal-500/40 whitespace-nowrap">
                      <span className="text-teal-300 font-semibold">3. Campaign Agent</span>
                    </div>
                  </div>
                )}

                {currentChapter.category === 'verification' && (
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/40 max-w-xl text-xs space-y-2">
                    <div className="flex items-center justify-between text-emerald-300 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Verifier Agent ⭐ + Deterministic Policy 🔐
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">
                        IMMUTABLE
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
                      <div>Max Discount: <strong className="text-white">10%</strong></div>
                      <div>Max Audience: <strong className="text-white">100 users</strong></div>
                      <div>Max Lifespan: <strong className="text-white">7 days</strong></div>
                      <div>Max Budget: <strong className="text-white">₹10,000</strong></div>
                    </div>
                  </div>
                )}

                {currentChapter.category === 'approval' && (
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/40 max-w-xl text-xs space-y-2">
                    <div className="text-amber-300 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>Human-in-the-Loop Review Card</span>
                    </div>
                    <div className="text-slate-300 text-xs leading-relaxed font-mono">
                      Discover &rarr; Propose &rarr; Verify &rarr; Policy &rarr; <strong className="text-amber-300">Merchant Approves</strong> &rarr; Execute
                    </div>
                  </div>
                )}

                {currentChapter.category === 'razorpay' && (
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-teal-500/40 max-w-xl text-xs space-y-2">
                    <div className="text-teal-300 font-semibold flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-teal-400" />
                      <span>Razorpay Test Mode Sandbox</span>
                    </div>
                    <p className="text-slate-300 text-xs font-mono">
                      Basic Auth Isolation &bull; order_test_XXXXXX &bull; ₹0.00 Real Money Moved
                    </p>
                  </div>
                )}

                {currentChapter.category === 'audit' && (
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700 max-w-xl text-xs font-mono space-y-1">
                    <div className="text-emerald-400 font-bold">ACT-00042 Trace Recorded</div>
                    <div className="text-slate-400 text-[11px]">
                      Circuit Breaker: Safe stop after max 1 retry. Complete provenance stored.
                    </div>
                  </div>
                )}

                {currentChapter.category === 'demo' && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => onNavigateToTab('pipeline')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                    >
                      <Bot className="w-4 h-4" />
                      <span>Launch Interactive Pipeline &rarr;</span>
                    </button>
                    <button
                      onClick={() => onNavigateToTab('dashboard')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
                    >
                      Open Live Dashboard
                    </button>
                  </div>
                )}

                {currentChapter.category === 'closing' && (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 max-w-xl text-xs">
                    <div className="text-base font-bold text-white mb-1">
                      Discover &bull; Verify &bull; Approve &bull; Execute
                    </div>
                    <p className="text-emerald-300 text-xs leading-relaxed">
                      Bounded, explainable, human-controlled, and auditable merchant growth.
                    </p>
                  </div>
                )}
              </div>

              {/* Subtitles / Teleprompter Display Bar */}
              <div className="relative z-10 bg-slate-950/90 border border-slate-800/90 rounded-xl p-3.5 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold mb-1">
                  <Mic className="w-3 h-3 animate-pulse" />
                  <span>Kashish Narration:</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans line-clamp-3">
                  "{currentChapter.scriptText}"
                </p>
              </div>
            </div>

            {/* Video Player Transport Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevChapter}
                  disabled={currentChapterIndex === 0}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
                  title="Previous Chapter"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={handleTogglePlay}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 flex items-center gap-2"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? 'Pause Narration' : 'Play Presentation'}</span>
                </button>

                <button
                  onClick={handleNextChapter}
                  disabled={currentChapterIndex === PITCH_CHAPTERS.length - 1}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
                  title="Next Chapter"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleRestart}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="Restart Presentation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 max-w-xs space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>{currentChapter.timeRange}</span>
                  <span>Chapter {currentChapterIndex + 1}/{PITCH_CHAPTERS.length}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${((currentChapterIndex + 1) / PITCH_CHAPTERS.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Chapters Playlist & Key Takeaways */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Pitch Chapters (0:00 – 5:00)
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono">5 Minutes</span>
              </div>

              <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                {PITCH_CHAPTERS.map((chap, idx) => {
                  const isCurrent = idx === currentChapterIndex;
                  return (
                    <button
                      key={chap.id}
                      onClick={() => {
                        setCurrentChapterIndex(idx);
                        setIsPlaying(true);
                      }}
                      className={`w-full text-left p-3 rounded-xl transition flex items-start justify-between gap-3 text-xs ${
                        isCurrent 
                          ? 'bg-emerald-950/40 border border-emerald-500/50 text-white' 
                          : 'bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 text-slate-400'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono text-[10px] ${isCurrent ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                            {chap.timeRange}
                          </span>
                          {isCurrent && isPlaying && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          )}
                        </div>
                        <div className={`font-semibold ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                          {chap.title}
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isCurrent ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {chap.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Chapter Key Takeaways */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Key Discussion Points
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {currentChapter.keyPoints.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Full Teleprompter & Script Recording Mode */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 max-w-4xl mx-auto shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Full Video Script &amp; Teleprompter</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Formatted for Kashish Mulchandani &bull; 5:00 Total Run Time
              </p>
            </div>
            <button
              onClick={handleCopyFullScript}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedScript ? 'Copied Full Script' : 'Copy Full Script'}</span>
            </button>
          </div>

          <div className="space-y-8">
            {PITCH_CHAPTERS.map((chapter) => (
              <div key={chapter.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {chapter.timeRange}
                    </span>
                    <h4 className="font-bold text-white text-sm">{chapter.title}</h4>
                  </div>
                  <span className="text-xs text-slate-400">Speaker: {chapter.speaker}</span>
                </div>
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-sans">
                  {chapter.scriptText}
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  {chapter.keyPoints.map((kp, kIdx) => (
                    <span key={kIdx} className="text-[11px] px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      &bull; {kp}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
