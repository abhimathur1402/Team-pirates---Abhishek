import { motion } from 'framer-motion';
import { XCircle, Phone, Search, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function NoMatchFound({ onReset }: { onReset: () => void }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-card border border-destructive/30 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.15)] overflow-hidden"
      >
        <div className="p-8 text-center border-b border-border bg-destructive/10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-destructive/20 text-destructive mb-6"
          >
            <XCircle className="w-12 h-12" />
          </motion.div>
          
          <h1 className="text-2xl md:text-3xl font-bold tracking-widest uppercase text-foreground mb-2">No Match Found</h1>
          <p className="text-muted-foreground font-mono tracking-wide text-xs">SYSTEM: SEARCH EXHAUSTED</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-background border border-border p-5 rounded-xl border-l-4 border-l-destructive">
            <p className="text-foreground text-sm leading-relaxed">
              No hospitals in your area currently have the required resources for this request. All nearby facilities are at capacity or lacking the specified blood type/resource combination.
            </p>
          </div>

          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 font-bold">Suggested Actions</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-xs md:text-sm text-foreground bg-card p-3 rounded border border-border">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                Expand search radius to 50+ km (Requires regional override)
              </li>
              <li className="flex items-center gap-3 text-xs md:text-sm text-foreground bg-card p-3 rounded border border-border">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                Contact Regional Hub for manual coordination
              </li>
              <li className="flex items-center gap-3 text-xs md:text-sm text-foreground bg-card p-3 rounded border border-border">
                <RefreshCw className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                Downgrade urgency or resource constraints and try again
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
            <button 
              onClick={onReset}
              data-testid="button-try-again"
              className="flex-1 py-4 bg-card border border-border hover:bg-muted/30 transition-colors rounded-xl font-bold uppercase tracking-widest text-[11px] text-foreground"
            >
              Modify Request
            </button>
            <button 
              onClick={() => setShowModal(true)}
              data-testid="button-contact-hub"
              className="flex-1 py-4 bg-destructive text-destructive-foreground hover:bg-red-600 transition-colors rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-[0_0_15px_rgba(220,38,38,0.3)]"
            >
              Contact Regional Hub
            </button>
          </div>
        </div>
      </motion.div>

      {/* Simple Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6 max-w-sm w-full text-center shadow-2xl relative"
          >
            <Phone className="w-12 h-12 text-accent mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2 uppercase tracking-widest text-foreground">Regional Dispatch Hub</h2>
            <p className="text-3xl font-mono font-bold text-foreground mb-6">1-800-MED-LINK</p>
            <p className="text-xs text-muted-foreground mb-6">Quote Dispatch ID <strong className="text-foreground">FAILED-REQ</strong> for priority handling.</p>
            <button 
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-muted text-foreground font-bold uppercase tracking-widest text-[11px] rounded-lg border border-border hover:bg-muted/80"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}