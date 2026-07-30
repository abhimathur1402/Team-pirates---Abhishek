import { motion } from 'framer-motion';
import { Hospital } from '../lib/mockHospitals';
import ScoreBar from './ScoreBar';
import { MapPin, Clock, Activity, Ambulance } from 'lucide-react';

export default function HospitalCard({ 
  hospital, 
  index,
  isBestMatch,
  onDispatch
}: { 
  hospital: Hospital, 
  index: number, 
  isBestMatch?: boolean,
  onDispatch: () => void 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative p-5 rounded-xl border bg-card overflow-hidden flex flex-col md:flex-row gap-5 items-start md:items-center ${isBestMatch ? 'border-accent shadow-[0_0_15px_rgba(255,50,50,0.2)]' : 'border-border'}`}
      data-testid={`card-hospital-${index}`}
    >
      {isBestMatch && (
        <div className="absolute top-0 left-0 bg-accent text-white text-[10px] font-bold uppercase px-3 py-1 rounded-br-lg tracking-widest">
          Best Match
        </div>
      )}
      
      <div className="flex-1 mt-4 md:mt-0 space-y-3 w-full">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground" data-testid={`text-hospital-name-${index}`}>{hospital.name}</h3>
              <span className="text-muted-foreground text-sm font-mono tracking-widest">#{index + 1}</span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {hospital.distance} km</div>
              <div className="flex items-center gap-1 font-semibold text-foreground"><Clock className="w-4 h-4 text-accent" /> {hospital.eta} min ETA</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold font-mono" data-testid={`text-hospital-score-${index}`}>{hospital.score}%</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Match</div>
          </div>
        </div>
        
        <ScoreBar score={hospital.score} />
        
        <div className="flex flex-wrap gap-3 mt-3">
          <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded border border-border text-xs">
            <Activity className={`w-4 h-4 ${hospital.status === 'Available' ? 'text-emerald-400' : hospital.status === 'Limited' ? 'text-amber-400' : 'text-destructive'}`} />
            <span className="uppercase tracking-wider">{hospital.status}</span>
          </div>
          <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded border border-border text-xs">
            <span className="text-muted-foreground">CAPACITY:</span>
            <span className="font-mono text-foreground">{hospital.bedsAvailable} / {hospital.totalBeds}</span>
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-auto flex-shrink-0 mt-4 md:mt-0">
        <button 
          onClick={onDispatch}
          data-testid={`button-dispatch-${index}`}
          className="w-full md:w-32 py-4 md:py-8 bg-accent hover:bg-red-600 transition-colors rounded-lg flex flex-col items-center justify-center gap-2 text-white shadow-lg active:scale-95"
        >
          <Ambulance className="w-6 h-6" />
          <span className="font-bold uppercase tracking-widest text-[11px]">Dispatch</span>
        </button>
      </div>
    </motion.div>
  );
}