import React from 'react';
import { HelpTopic, HelpCategory } from '../../types/help';
import { 
  ArrowLeft, 
  Lightbulb, 
  CheckCircle2, 
  Calculator, 
  AlertTriangle 
} from 'lucide-react';

interface HelpTopicViewerProps {
  topic: HelpTopic;
  category?: HelpCategory;
  onBack: () => void;
  onSelectTopic: (topicId: string) => void;
}

export const HelpTopicViewer: React.FC<HelpTopicViewerProps> = ({
  topic,
  category,
  onBack,
  onSelectTopic
}) => {
  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between pb-3 border-b border-[#222733]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#FFB800] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para lista de tópicos</span>
        </button>

        {category && (
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#1B1E26] border border-[#2B303E] text-slate-300 font-medium">
            {category.title}
          </span>
        )}
      </div>

      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {topic.title}
        </h2>
        <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
          {topic.summary}
        </p>
      </div>

      {/* Step by Step Checklist (if present) */}
      {topic.steps && topic.steps.length > 0 && (
        <div className="bg-[#14171E] rounded-xl p-4 border border-[#222733] space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#FFB800] font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Passo a Passo Recomendado
          </h3>
          <div className="space-y-2">
            {topic.steps.map((step, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 bg-[#1A1D25] p-2.5 rounded-lg border border-[#2B303E]/50"
              >
                <span className="font-mono text-[#FFB800] font-bold">{idx + 1}.</span>
                <span>{step.replace(/^\d+\.\s*/, '')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Paragraphs */}
      <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
        {topic.content.map((paragraph, idx) => (
          <p key={idx} className="bg-[#11141A] p-3 rounded-xl border border-[#222733]">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Practical Example Box (The Core Value!) */}
      {topic.practicalExample && (
        <div className="bg-[#151922] rounded-xl p-4 sm:p-5 border border-amber-500/30 shadow-lg space-y-3.5">
          <div className="flex items-center gap-2 text-[#FFB800]">
            <Calculator className="w-5 h-5" />
            <h3 className="text-sm font-bold tracking-tight">
              {topic.practicalExample.title}
            </h3>
          </div>

          <p className="text-xs text-slate-400">
            <strong className="text-slate-200">Cenário:</strong> {topic.practicalExample.scenario}
          </p>

          {topic.practicalExample.calculationSteps && (
            <div className="space-y-1.5 bg-[#0F1115] p-3 rounded-lg border border-[#222733]">
              {topic.practicalExample.calculationSteps.map((calc, idx) => (
                <div key={idx} className="text-xs font-mono text-slate-300 flex items-center gap-2">
                  <span className="text-[#FFB800]">•</span>
                  <span>{calc}</span>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-lg text-xs font-semibold text-amber-300">
            💡 {topic.practicalExample.result}
          </div>

          {topic.practicalExample.tip && (
            <div className="flex items-start gap-2 text-[11px] text-slate-400 pt-1">
              <Lightbulb className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
              <span>{topic.practicalExample.tip}</span>
            </div>
          )}
        </div>
      )}

      {/* Alerts */}
      {topic.alerts && topic.alerts.length > 0 && (
        <div className="space-y-2">
          {topic.alerts.map((alert, idx) => (
            <div 
              key={idx}
              className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-200"
            >
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{alert}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

