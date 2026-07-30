import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, AlertTriangle, Crosshair, Activity } from 'lucide-react';
import { FormData } from '../App';

const RESOURCE_OPTIONS = ["ICU Bed", "Ventilator", "Blood Transfusion", "Surgical Suite", "Burn Unit", "Cardiac Care", "Trauma Bay", "Dialysis Unit"];
const BLOOD_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const URGENCY_OPTIONS = ["Critical (< 5 min)", "High (5-15 min)", "Moderate (15-30 min)", "Low (> 30 min)"];

export default function RequestForm({ 
  formData, 
  setFormData,
  onSubmit 
}: { 
  formData: FormData, 
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
  onSubmit: (data: FormData) => void 
}) {
  const [locStatus, setLocStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  
  const handleLocation = () => {
    setLocStatus('loading');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({ ...prev, location: { lat: pos.coords.latitude, lng: pos.coords.longitude } }));
          setLocStatus('success');
          setErrors(prev => ({ ...prev, location: false }));
        },
        () => setLocStatus('error'),
        { timeout: 5000 }
      );
    } else {
      setLocStatus('error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};
    if (!formData.patientName) newErrors.patientName = true;
    if (!formData.location) newErrors.location = true;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="bg-primary/20 border-b border-border p-6 flex items-center gap-3">
          <div className="bg-accent p-2 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest uppercase text-foreground">MedLink</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Emergency Dispatch Command</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <motion.div animate={errors.patientName ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2 font-semibold">Patient Name / ID</label>
            <input 
              type="text" 
              className={`w-full bg-background border ${errors.patientName ? 'border-destructive' : 'border-border'} rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-accent transition-colors`}
              value={formData.patientName}
              onChange={e => { setFormData(prev => ({ ...prev, patientName: e.target.value })); setErrors(prev => ({ ...prev, patientName: false })); }}
              placeholder="e.g. John Doe or UID-8492"
              data-testid="input-patient-name"
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2 font-semibold">Resource Required</label>
              <select 
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-accent appearance-none cursor-pointer"
                value={formData.resourceType}
                onChange={e => setFormData(prev => ({ ...prev, resourceType: e.target.value }))}
                data-testid="select-resource-type"
              >
                {RESOURCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2 font-semibold">Blood Type</label>
              <select 
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-accent appearance-none cursor-pointer"
                value={formData.bloodType}
                onChange={e => setFormData(prev => ({ ...prev, bloodType: e.target.value }))}
                data-testid="select-blood-type"
              >
                {BLOOD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <motion.div animate={errors.location ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2 font-semibold">Location Context</label>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <button
                type="button"
                onClick={handleLocation}
                data-testid="button-get-location"
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${errors.location ? 'border-destructive text-destructive' : 'border-border hover:border-muted-foreground bg-background text-foreground'}`}
              >
                {locStatus === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Crosshair className="w-5 h-5" />
                )}
                <span className="text-[11px] font-bold uppercase tracking-wider">Acquire Fix</span>
              </button>
              
              <div className="flex-1">
                {locStatus === 'success' && formData.location ? (
                  <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded inline-flex items-center gap-2 text-xs font-mono">
                    <MapPin className="w-3 h-3" />
                    {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
                  </div>
                ) : locStatus === 'error' ? (
                  <div className="px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/20 rounded inline-flex items-center gap-2 text-xs font-mono">
                    <AlertTriangle className="w-3 h-3" />
                    Location unavailable
                  </div>
                ) : (
                  <div className="text-[11px] text-muted-foreground font-mono">Awaiting coordinates...</div>
                )}
              </div>
            </div>
          </motion.div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2 font-semibold">Urgency Code</label>
            <select 
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-accent appearance-none cursor-pointer"
              value={formData.urgency}
              onChange={e => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
              data-testid="select-urgency"
            >
              {URGENCY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              data-testid="button-submit-request"
              className="w-full bg-accent hover:bg-red-600 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-[0_0_20px_rgba(200,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,0,0,0.5)] uppercase tracking-widest text-sm"
            >
              <Navigation className="w-5 h-5" />
              Compute Nearest Matches
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}