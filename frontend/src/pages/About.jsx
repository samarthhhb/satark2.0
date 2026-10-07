import React from 'react';
import { 
  Users, 
  Target, 
  CheckCircle2, 
  GraduationCap, 
  Cloud, 
  ShieldCheck, 
  Cpu, 
  Layers 
} from 'lucide-react';

const TEAM_MEMBERS = [
  { id: 1, name: "Samarth Buchake" },
  { id: 2, name: "Rehaan Kasad" },
  { id: 3, name: "Rashi Singh" },
  { id: 4, name: "Shaikh Aakef" }
];

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          About SATARK 2.0
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cloud-Based Cybercrime Intelligence and Risk Assessment Platform.
        </p>
      </div>

      {/* Container 1: Academic Institution */}
      <div className="clean-card rounded-xl p-6 bg-white space-y-2 border border-slate-200">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <GraduationCap className="w-4 h-4 text-slate-600" />
          <span>Academic Institution</span>
        </div>
        <div className="pl-6 space-y-1">
          <p className="text-sm font-bold text-slate-900">
            Department of AI and Machine Learning
          </p>
          <p className="text-xs text-slate-600">
            Symbiosis Institute of Technology (SIT), Pune
          </p>
        </div>
      </div>

      {/* Container 2: Development Team (Placed below Institution) */}
      <div className="clean-card rounded-xl p-6 bg-white space-y-4 border border-slate-200">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <Users className="w-4 h-4 text-slate-600" />
          <span>Development Team</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.id}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center">
                  {member.id}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{member.name}</p>
                  <p className="text-[11px] text-slate-500">Department of AI &amp; ML, SIT Pune</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Container 3: Project Overview */}
      <div className="clean-card rounded-xl p-6 bg-white space-y-3 border border-slate-200">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <Target className="w-4 h-4 text-slate-600" />
          <span>Project Overview</span>
        </div>
        <div className="text-xs text-slate-600 leading-relaxed space-y-2 pl-6">
          <p>
            SATARK 2.0 is a cloud-based cybercrime intelligence platform designed to demonstrate how cloud computing can be used to securely store, process, analyze, and deliver cybercrime information through a centralized web application. The project combines cloud infrastructure, cybersecurity, data analytics, and machine learning to create a practical decision-support system for understanding regional cybercrime risk.
          </p>
          <p>
            The primary focus of SATARK 2.0 is not simply building a machine learning model, but developing a cloud-hosted system in which data, computing resources, APIs, security mechanisms, and predictive services work together. Historical cybercrime data is stored and processed through the cloud, while users access the system through a web-based interface. The platform can forecast the expected cybercrime burden for a district in the following year and classify the region as Low, Medium, or High risk.
          </p>
        </div>
      </div>

      {/* Container 4: Relevance to Cloud Computing */}
      <div className="clean-card rounded-xl p-6 bg-white space-y-3 border border-slate-200">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <Cloud className="w-4 h-4 text-slate-600" />
          <span>Relevance to Cloud Computing</span>
        </div>
        <div className="text-xs text-slate-600 leading-relaxed space-y-2 pl-6">
          <p>
            Modern cybersecurity systems often need to handle large datasets, multiple users, secure data access, and continuously available services. Deploying such systems locally can make data management, accessibility, and scalability more difficult. Cloud computing provides a suitable environment by offering centralized storage, on-demand computing, network-based access, and managed infrastructure.
          </p>
          <p>
            SATARK demonstrates these concepts through AWS EC2 for application hosting and computation and AWS RDS PostgreSQL for managed database storage. A React-based frontend communicates with a FastAPI backend through REST APIs. The backend manages authentication, retrieves required data, performs machine learning inference, and stores prediction results.
          </p>
        </div>
      </div>

      {/* Container 5: Cybersecurity Component */}
      <div className="clean-card rounded-xl p-6 bg-white space-y-3 border border-slate-200">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <ShieldCheck className="w-4 h-4 text-slate-600" />
          <span>Cybersecurity Component</span>
        </div>
        <div className="text-xs text-slate-600 leading-relaxed space-y-2 pl-6">
          <p>
            Cybersecurity is an important part of the system because the platform handles user accounts and cybercrime-related information. Authentication and authorization mechanisms are incorporated to ensure that only permitted users can access protected services.
          </p>
          <p>
            User passwords are stored using secure hashing rather than plaintext. JWT-based authentication can be used for API access, while AWS Security Groups restrict unnecessary network exposure. The PostgreSQL database can be configured so that it accepts connections only from the application server. Environment variables are used to keep database credentials and other secrets outside the application source code.
          </p>
        </div>
      </div>

      {/* Container 6: Machine Learning and Analytics */}
      <div className="clean-card rounded-xl p-6 bg-white space-y-3 border border-slate-200">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <Cpu className="w-4 h-4 text-slate-600" />
          <span>Machine Learning and Analytics</span>
        </div>
        <div className="text-xs text-slate-600 leading-relaxed space-y-2 pl-6">
          <p>
            Machine learning acts as the intelligence layer of SATARK 2.0. Historical cybercrime records are cleaned and aggregated at the State–District–Year level. A CatBoost regression model uses the current-year crime profile to estimate the following year’s total cybercrime burden. A separate classification model categorizes the predicted regional risk into Low, Medium, or High.
          </p>
          <p>
            The predictions are delivered through the cloud backend and presented through the web dashboard. This allows the ML model to function as a service within a larger cloud-based application.
          </p>
        </div>
      </div>

      {/* Container 7: Scope & Expected Outcome */}
      <div className="clean-card rounded-xl p-6 bg-white space-y-3 border border-slate-200">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <Layers className="w-4 h-4 text-slate-600" />
          <span>Scope &amp; Expected Outcome</span>
        </div>
        <div className="text-xs text-slate-600 leading-relaxed space-y-2 pl-6">
          <p>
            The initial implementation focuses on a simple and manageable cloud architecture consisting of an AWS EC2 application server and AWS RDS PostgreSQL database. The frontend, backend, ML models, and API services can operate through the same application environment, keeping deployment straightforward.
          </p>
          <p>
            Overall, SATARK 2.0 demonstrates how Cloud Computing can provide the foundation for a secure cybercrime intelligence system, while machine learning supplies predictive capabilities. The project therefore brings together cloud infrastructure, cybersecurity, databases, APIs, visualization, and AI into one practical application.
          </p>
        </div>
      </div>
    </div>
  );
}
