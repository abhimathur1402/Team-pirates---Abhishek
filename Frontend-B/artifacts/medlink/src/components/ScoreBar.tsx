import { motion } from 'framer-motion';

export default function ScoreBar({ score }: { score: number }) {
  let colorClass = 'bg-destructive';
  if (score >= 80) colorClass = 'bg-emerald-500';
  else if (score >= 60) colorClass = 'bg-amber-500';

  return (
    <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-border">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={`h-full ${colorClass}`}
      />
    </div>
  );
}