import React from 'react';
import { 
  Users, 
  Target, 
  Cloud, 
  ShieldCheck, 
  Cpu, 
  Layers,
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';

const TEAM_MEMBERS = [
  { id: 1, name: "Samarth Buchake" },
  { id: 2, name: "Rehaan Kasad" },
  { id: 3, name: "Rashi Singh" },
  { id: 4, name: "Shaikh Aakef" }
];

const ARCHITECTURE_PILLARS = [
  {
    icon: <Cloud className="w-4 h-4 text-blue-600" />,
    title: "Cloud Infrastructure",
    subtitle: "AWS EC2 & RDS PostgreSQL",
    desc: "Centralized cloud hosting running containerized FastAPI services connected to a managed relational PostgreSQL database on AWS RDS."
  },
  {
    icon: <Lock className="w-4 h-4 text-emerald-600" />,
    title: "Cybersecurity Layer",
    subtitle: "Authentication & Isolation",
    desc: "Protected REST APIs with JWT token authorization, bcrypt password hashing, AWS security groups, and strict environment secret management."
  },
  {
    icon: <Cpu className="w-4 h-4 text-purple-600" />,
    title: "Machine Learning Intelligence",
    subtitle: "Dual CatBoost Pipeline",
    desc: "Regression model predicting next-year district cybercrime volume alongside a classification model ranking threat tiers (Low, Medium, High)."
  },
  {
    icon: <Globe className="w-4 h-4 text-sky-600" />,
    title: "Decision-Support Platform",
    subtitle: "Interactive Web UI & LLM",
    desc: "Real-time analytics dashboard with geographic spatial mapping, audit tracking, and Groq LLM-powered threat assistant."
  }
];

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              About SATARK 2.0
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cloud-Based Cybercrime Intelligence, Predictive Analytics, and Risk Assessment Platform.
          </p>
        </div>
      </div>

      {/* Hero Banner (Slide Theme: Intersection of Cloud & Cybersecurity) */}
      <div className="satark-card p-6 sm:p-7 bg-gradient-to-br from-blue-100/90 via-sky-50 to-blue-50/80 border border-blue-200/80 relative overflow-hidden shadow-xs">
        {/* Soft atmospheric radial glows and cross accents matching presentation template */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/70 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-10 bottom-5 text-blue-300/80 text-3xl font-light select-none pointer-events-none">+</div>
        <div className="absolute right-32 top-6 text-blue-300/60 text-xl font-light select-none pointer-events-none">+</div>

        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-blue-200 text-[11px] font-bold text-blue-700 shadow-2xs">
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>Cloud Computing Architecture</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Intersection of Cloud Computing &amp; Cybersecurity
          </h2>

          <p className="text-[13.5px] text-slate-700 leading-relaxed font-normal">
            SATARK 2.0 demonstrates a complete cloud-hosted architecture integrating secure database storage, scalable REST API services, and machine learning inference to deliver regional cybercrime risk intelligence.
          </p>
        </div>
      </div>

      {/* Development Team Grid (Clean names without role subtext) */}
      <div className="satark-card p-5 sm:p-6 bg-white space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-[14px]">
            <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
            <span>Development Team</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Department of AI &amp; ML</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-0.5">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.id}
              className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/70 hover:bg-blue-50/30 transition-all flex items-center gap-3 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {member.id}
              </div>
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-slate-900 truncate">{member.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Architecture Pillars (4 Cards) */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System Architecture</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {ARCHITECTURE_PILLARS.map((pillar, idx) => (
            <div key={idx} className="satark-card-interactive p-4 bg-white flex flex-col justify-between space-y-2.5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    {pillar.icon}
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-400">0{idx + 1}</span>
                </div>
                <div>
                  <h3 className="text-[13.5px] font-bold text-slate-900">{pillar.title}</h3>
                  <p className="text-[11px] font-semibold text-blue-600 mt-0.5">{pillar.subtitle}</p>
                </div>
              </div>
              <p className="text-[12.5px] text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Compact Project Scope Card */}
      <div className="satark-card p-5 bg-white space-y-1.5">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-[14px]">
          <Target className="w-4 h-4 text-blue-600" />
          <span>System Scope &amp; Outcome</span>
        </div>
        <p className="text-[13px] text-slate-600 leading-relaxed pl-6">
          Historical multi-year NCRB district crime profiles (31 indicators) are processed through cloud services to forecast upcoming year crime volume and evaluate regional risk tiers. The system demonstrates practical cloud deployment, relational data isolation, REST microservice communication, and machine learning decision support.
        </p>
      </div>
    </div>
  );
}
