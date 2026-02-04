
import React, { useState, useEffect } from 'react';
import { Patient, ViewState } from './types';
import { storageService } from './services/storage';
import { PlusIcon, TrashIcon, EditIcon } from './components/Icons';
import PatientForm from './components/PatientForm';
import { generatePatientPDF } from './services/pdf';

const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [view, setView] = useState<ViewState>('dashboard');
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [isConfirmingDeleteAll, setIsConfirmingDeleteAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const data = storageService.getPatients();
      setPatients(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setPatients([]);
    }
  }, []);

  const handleNewPatient = () => {
    setCurrentPatient(null);
    setView('form');
  };

  const handleEditPatient = (patient: Patient) => {
    setCurrentPatient(patient);
    setView('form');
  };

  const handleSavePatient = (patient: Patient) => {
    setPatients(prev => {
      const exists = prev.find(p => p.id === patient.id);
      const updated = exists 
        ? prev.map(p => p.id === patient.id ? patient : p)
        : [patient, ...prev];
      storageService.savePatients(updated);
      return updated;
    });

    // Genera il PDF automaticamente al salvataggio
    try {
      generatePatientPDF(patient);
    } catch (err) {
      console.error("Errore generazione PDF:", err);
    }

    setView('dashboard');
  };

  const handleDeletePatient = (id: string) => {
    setPatients(prev => {
      const updated = prev.filter(p => p.id !== id);
      storageService.savePatients(updated);
      return updated;
    });
    setDeletingId(null);
    if (view === 'form') setView('dashboard');
  };

  const handleDeleteAll = () => {
    if (!isConfirmingDeleteAll) {
      setIsConfirmingDeleteAll(true);
      setTimeout(() => setIsConfirmingDeleteAll(false), 3000);
      return;
    }
    setPatients([]);
    storageService.clearAll();
    setIsConfirmingDeleteAll(false);
  };

  const toggleConfirmDelete = (id: string) => {
    if (deletingId === id) {
      handleDeletePatient(id);
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 transition-colors duration-500">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">T</div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">
              TinNutri <span className="text-blue-600 font-medium">PRO</span>
            </h1>
          </div>
          
          {view === 'dashboard' && (
            <div className="flex items-center gap-4">
              <button
                onClick={handleDeleteAll}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-semibold border ${
                  isConfirmingDeleteAll ? "bg-red-600 border-red-600 text-white animate-pulse" : "bg-white border-slate-200 text-slate-500 hover:text-red-600"
                }`}
              >
                <TrashIcon />
                <span>{isConfirmingDeleteAll ? "Conferma?" : "Elimina Tutto"}</span>
              </button>
              <button
                onClick={handleNewPatient}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-md active:scale-95"
              >
                <PlusIcon />
                <span>Nuova Scheda</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {view === 'dashboard' ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Archivio Schede</h2>
                <p className="text-slate-500 mt-1 text-sm uppercase font-bold tracking-widest">Elenco Nutrizione Parenterale</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Totale Record:</span>
                <span className="ml-2 text-lg font-black text-blue-600">{patients.length}</span>
              </div>
            </div>

            {patients.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <PlusIcon />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Nessuna scheda creata</h3>
                <p className="text-slate-400 mt-2">Inizia creando la prima scheda nutrizione per i tuoi pazienti.</p>
                <button onClick={handleNewPatient} className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-xl active:scale-95 transition-transform">
                  Crea Nuova Scheda
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paziente</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Data</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nutrizione (Glucosio)</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Creazione</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {patients.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                                {p.lastName[0]}{p.firstName[0]}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 capitalize">{p.lastName} {p.firstName}</div>
                                <div className="text-[10px] text-slate-400 md:hidden">{new Date(p.birthDate).toLocaleDateString('it-IT')}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className="text-sm font-medium text-slate-600">{new Date(p.birthDate).toLocaleDateString('it-IT')}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-blue-600">{p.nutrition.glucosioMl.toFixed(1).replace('.', ',')} ml</span>
                              <span className="text-[10px] font-bold text-slate-400">Conc: {p.nutrition.glucosioPerc.toFixed(1).replace('.', ',')}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <span className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString('it-IT')}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                              <button 
                                onClick={() => handleEditPatient(p)} 
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Modifica"
                              >
                                <EditIcon />
                              </button>
                              <button 
                                onClick={() => generatePatientPDF(p)} 
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Scarica PDF"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                              </button>
                              <button 
                                onClick={() => toggleConfirmDelete(p.id)} 
                                className={`p-2 rounded-lg transition-all flex items-center gap-1 ${
                                  deletingId === p.id 
                                    ? "bg-red-600 text-white shadow-lg animate-pulse" 
                                    : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                                }`}
                                title={deletingId === p.id ? "Clicca di nuovo per eliminare" : "Elimina"}
                              >
                                <TrashIcon />
                                {deletingId === p.id && <span className="text-[10px] font-black uppercase">Conferma?</span>}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <PatientForm 
            patient={currentPatient}
            onSave={handleSavePatient}
            onCancel={() => setView('dashboard')}
            onDelete={handleDeletePatient}
          />
        )}
      </main>
    </div>
  );
};

export default App;
