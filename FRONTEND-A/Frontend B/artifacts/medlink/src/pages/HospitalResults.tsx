import { useMemo } from 'react';
import { ArrowLeft, Activity } from 'lucide-react';
import { FormData } from '../App';
import { generateHospitals, Hospital } from '../lib/mockHospitals';
import HospitalCard from '../components/HospitalCard';

export default function HospitalResults({ 
  formData, 
  onBack,
  onDispatch 
}: { 
  formData: FormData, 
  onBack: () => void,
  onDispatch: (h: Hospital) => void 
}) {
  const hospitals = useMemo(() => {
    return generateHospitals(formData.resourceType, formData.bloodType, formData.urgency);
  }, [formData]);

  return (
    <div className="min-h-[100dvh] bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button 
                onClick={onBack}
                data-testid="button-back-to-form"
                className="p-2 hover:bg-card rounded-lg transition-colors text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold tracking-widest uppercase text-foreground flex items-center gap-2">
                <Activity className="text-accent w-6 h-6" />
                Dispatch Results
              </h1>
            </div>
            <div className="pl-12 text-[10px] sm:text-xs text-muted-foreground flex gap-3">
              <span className="bg-card px-2 py-1 rounded border border-border">ID: <span className="font-mono text-foreground">{formData.patientName}</span></span>
              <span className="bg-card px-2 py-1 rounded border border-border">REQ: <span className="font-mono text-foreground">{formData.resourceType}</span></span>
            </div>
          </div>
          
          <button 
            onClick={onBack}
            data-testid="button-new-request"
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-border hover:bg-card text-foreground rounded-lg transition-colors"
          >
            New Request
          </button>
        </header>

        <div className="space-y-4">
          {hospitals.map((hospital, i) => (
            <HospitalCard 
              key={hospital.id} 
              hospital={hospital} 
              index={i} 
              isBestMatch={i === 0}
              onDispatch={() => onDispatch(hospital)}
            />
          ))}
        </div>

      </div>
    </div>
  );
}