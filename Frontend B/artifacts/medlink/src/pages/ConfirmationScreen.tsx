import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { FormData } from '../App';
import { Hospital } from '../lib/mockHospitals';

export default function ConfirmationScreen({ 
  formData, 
  hospital,
  onReset 
}: { 
  formData: FormData, 
  hospital: Hospital,
  onReset: () => void 
}) {
  const [dispatchId] = useState(() => `MED-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
  const [timestamp] = useState(() => new Date().toLocaleTimeString());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-card border border-emerald-500/30 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden"
      >
        <div className="p-8 text-center border-b border-border bg-emerald-500/5 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-48 h-48 bg-emerald-500 rounded-full blur-3xl"
            />
          </div>
          
          <div className="relative z-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/20 text-emerald-400 mb-6"
            >
              <CheckCircle2 className="w-12 h-12" />
            </motion.div>
            
            <h1 className="text-2xl md:text-3xl font-bold tracking-widest uppercase text-foreground mb-2">Dispatch Confirmed</h1>
            <p className="text-emerald-400 font-mono tracking-widest">{dispatchId}</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-background rounded-xl p-6 border border-border">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">Destination</div>
              <div className="font-bold text-base md:text-lg text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="truncate">{hospital.name}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">Estimated Arrival</div>
              <div className="font-bold text-base md:text-lg text-accent flex items-center gap-2">
                <Clock className="w-4 h-4 flex-shrink-0" />
                {hospital.eta} Minutes
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">Patient Info</div>
              <div className="font-medium text-foreground">{formData.patientName}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">Resource Secured</div>
              <div className="font-medium text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {formData.resourceType}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-border pt-6">
            <div className="text-xs font-mono text-muted-foreground">
              T+{formatTime(elapsed)} elapsed since dispatch
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              {timestamp}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={onReset}
              data-testid="button-another-request"
              className="flex-1 py-4 bg-card border border-border hover:bg-muted/30 transition-colors rounded-xl font-bold uppercase tracking-widest text-[11px] text-foreground"
            >
              Submit Another Request
            </button>
            <button 
              onClick={() => alert("View Active Dispatches: Feature coming soon")}
              data-testid="button-view-dispatches"
              className="flex-1 py-4 bg-primary/20 text-primary-foreground hover:bg-primary/30 transition-colors rounded-xl font-bold uppercase tracking-widest text-[11px] border border-primary/50"
            >
              Active Dispatches
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}