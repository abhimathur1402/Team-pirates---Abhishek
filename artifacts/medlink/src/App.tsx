import { useState, useEffect } from 'react';
import RequestForm from './pages/RequestForm';
import HospitalResults from './pages/HospitalResults';
import ConfirmationScreen from './pages/ConfirmationScreen';
import NoMatchFound from './pages/NoMatchFound';
import { Hospital } from './lib/mockHospitals';

export type ScreenState = 'form' | 'results' | 'confirmation' | 'no-match';

export type FormData = {
  patientName: string;
  resourceType: string;
  bloodType: string;
  urgency: string;
  location: { lat: number; lng: number } | null;
};

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('form');
  const [formData, setFormData] = useState<FormData>({
    patientName: '',
    resourceType: 'ICU Bed',
    bloodType: 'Unknown',
    urgency: 'Critical (< 5 min)',
    location: null
  });
  const [dispatchedHospital, setDispatchedHospital] = useState<Hospital | null>(null);
  
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleRequestSubmit = (data: FormData) => {
    setFormData(data);
    if (data.urgency.includes("Critical") && data.bloodType === "AB-") {
      setScreen('no-match');
    } else {
      setScreen('results');
    }
  };

  const handleDispatch = (hospital: Hospital) => {
    setDispatchedHospital(hospital);
    setScreen('confirmation');
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground selection:bg-accent/30 selection:text-white font-sans overflow-x-hidden">
      {screen === 'form' && <RequestForm formData={formData} setFormData={setFormData} onSubmit={handleRequestSubmit} />}
      {screen === 'results' && <HospitalResults formData={formData} onBack={() => setScreen('form')} onDispatch={handleDispatch} />}
      {screen === 'confirmation' && dispatchedHospital && <ConfirmationScreen formData={formData} hospital={dispatchedHospital} onReset={() => setScreen('form')} />}
      {screen === 'no-match' && <NoMatchFound onReset={() => setScreen('form')} />}
    </div>
  );
}