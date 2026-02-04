
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Patient, NutritionData } from '../types';
import { SaveIcon, XIcon, TrashIcon, CalendarIcon } from './Icons';

interface PatientFormProps {
  patient: Patient | null;
  onSave: (patient: Patient) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

const DEFAULT_NUTRITION: NutritionData = {
  glucosioPerc: 0,
  glucosioMl: 0,
  tphMl: 0,
  esafosfinaMl: 0,
  naclMeq: 0,
  kclMeq: 0,
  mgMg: 0,
  caMg: 0,
  oligoMl: 0,
  cernevitMl: 0,
  smofMl: 0,
  altroMl: 0,
  altroLabel: 'Nuovo componente',
  altro2Ml: 0,
  altro2Label: 'Nuovo componente 2',
  fentanestDose: 0, fentanestSpeed: 0.1,
  morfinaDose: 0, morfinaSpeed: 0.1,
  midazolamDose: 0, midazolamSpeed: 0.1,
  dopaminaDose: 0, dopaminaSpeed: 0.1,
  dobutaminaDose: 0, dobutaminaSpeed: 0.1,
  noradrenalinaDose: 0, noradrenalinaSpeed: 0.1,
  lasixDose: 0, lasixSpeed: 0.1,
  sildenafilDose: 0, sildenafilSpeed: 0.1,
  fenoldopamDose: 0, fenoldopamSpeed: 0.1,
  acidoEtacrinicoDose: 0, acidoEtacrinicoSpeed: 0.1,
};

const DrugSection = ({ 
  title, 
  doseKey, 
  speedKey, 
  formula, 
  unit, 
  colorClass,
  nutrition,
  updateField
}: { 
  title: string, 
  doseKey: keyof NutritionData, 
  speedKey: keyof NutritionData, 
  formula: (dose: number) => number,
  unit: string,
  colorClass: string,
  nutrition: NutritionData,
  updateField: (field: keyof NutritionData, value: string | number) => void
}) => {
  const dose = (nutrition[doseKey] as number) || 0;
  const speed = (nutrition[speedKey] as number) || 0.1;
  const prelevare = formula(dose);
  
  const portaA = useMemo(() => {
    if (speed === 0.1) return "2,5 ml";
    if (speed === 0.2) return "5 ml";
    if (speed === 0.5) return "12 ml";
    if (speed === 1.0) return "24 ml";
    return "---";
  }, [speed]);

  const colors: Record<string, any> = {
    purple: { bg: 'bg-purple-50', border: 'border-purple-100', icon: 'bg-purple-600', text: 'text-purple-900', label: 'text-purple-400' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-100', icon: 'bg-orange-600', text: 'text-orange-900', label: 'text-orange-400' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-100', icon: 'bg-teal-600', text: 'text-teal-900', label: 'text-teal-400' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'bg-amber-600', text: 'text-amber-900', label: 'text-amber-400' },
    red: { bg: 'bg-red-50', border: 'border-red-100', icon: 'bg-red-600', text: 'text-red-900', label: 'text-red-400' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'bg-blue-600', text: 'text-blue-900', label: 'text-blue-400' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-100', icon: 'bg-cyan-600', text: 'text-cyan-900', label: 'text-cyan-400' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', icon: 'bg-indigo-600', text: 'text-indigo-900', label: 'text-indigo-400' },
    slate: { bg: 'bg-slate-50', border: 'border-slate-100', icon: 'bg-slate-600', text: 'text-slate-900', label: 'text-slate-400' },
  };

  const c = colors[colorClass] || colors.slate;
  const formatVal = (num: number) => (num || 0).toFixed(2).replace('.', ',');

  return (
    <div className={`mt-2 ${c.bg} rounded-2xl p-3 border ${c.border} shadow-sm space-y-2`}>
      <div className="flex items-center gap-2 border-b border-black/5 pb-1">
        <div className={`w-5 h-5 ${c.icon} rounded flex items-center justify-center text-white`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
        </div>
        <h3 className={`text-sm font-black ${c.text} uppercase tracking-tight`}>{title}</h3>
      </div>
      
      <div className="grid grid-cols-4 gap-2 items-end">
        <div className="space-y-0.5">
          <label className={`text-[8px] font-black ${c.label} uppercase tracking-widest leading-none block ml-1`}>Dose ({unit})</label>
          <input 
            type="number" 
            step="0.01"
            value={nutrition[doseKey] === 0 ? '' : nutrition[doseKey]} 
            onChange={e => updateField(doseKey, e.target.value)}
            className={`w-full px-2 py-1.5 bg-white border border-slate-400 rounded-lg focus:ring-1 focus:ring-black/5 outline-none text-sm font-black ${c.text}`}
            placeholder={unit}
          />
        </div>
        <div className="space-y-0.5">
          <label className={`text-[8px] font-black ${c.label} uppercase tracking-widest leading-none block ml-1`}>Velocità (ml/h)</label>
          <select 
            value={nutrition[speedKey] || 0.1}
            onChange={e => updateField(speedKey, e.target.value)}
            className={`w-full px-2 py-1.5 bg-white border border-slate-400 rounded-lg focus:ring-1 focus:ring-black/5 outline-none text-sm font-black ${c.text} cursor-pointer appearance-none`}
          >
            <option value={0.1}>0,1</option>
            <option value={0.2}>0,2</option>
            <option value={0.5}>0,5</option>
            <option value={1.0}>1,0</option>
          </select>
        </div>
        <div className={`${c.bg} p-1.5 rounded-lg border border-black/5`}>
          <p className={`text-[8px] font-black ${c.label} uppercase tracking-widest leading-none mb-1`}>Prelevare</p>
          <div className="flex items-baseline gap-0.5">
            <span className={`text-base font-black ${c.text}`}>{formatVal(prelevare)}</span>
            <span className={`text-[8px] font-bold ${c.label}`}>ml</span>
          </div>
        </div>
        <div className="bg-white p-1.5 rounded-lg border border-dashed border-black/10">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-center">Diluizione (Gluc 5%)</p>
          <div className="flex items-baseline justify-center gap-0.5">
            <span className="text-[8px] font-bold text-slate-300">Porta a:</span>
            <span className={`text-base font-black ${c.text}`}>{portaA}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientForm: React.FC<PatientFormProps> = ({ patient, onSave, onCancel, onDelete }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [nutrition, setNutrition] = useState<NutritionData>(DEFAULT_NUTRITION);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (patient) {
      setFirstName(patient.firstName);
      setLastName(patient.lastName);
      setBirthDate(patient.birthDate);
      setNutrition({ ...DEFAULT_NUTRITION, ...(patient.nutrition || {}) });
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      setBirthDate(`${year}-${month}-${day}`);
    }
  }, [patient]);

  const updateField = (field: keyof NutritionData, value: string | number) => {
    const isSpeedField = field.toString().endsWith('Speed');
    const isNumericField = !isSpeedField && !field.toString().endsWith('Label');

    if (typeof value === 'string' && isNumericField) {
      if (value === '') {
        setNutrition(prev => ({ ...prev, [field]: 0 }));
        return;
      }
      const numValue = parseFloat(value.replace(',', '.')) || 0;
      setNutrition(prev => ({ ...prev, [field]: numValue }));
    } else if (isSpeedField) {
      setNutrition(prev => ({ ...prev, [field]: Number(value) }));
    } else {
      setNutrition(prev => ({ ...prev, [field]: value }));
    }
  };

  const formatDisplay = (num: number) => {
    return (num || 0).toFixed(2).replace('.', ',');
  };

  const glucoseMixParts = useMemo(() => {
    const targetC = nutrition.glucosioPerc;
    const targetV = nutrition.glucosioMl;
    const empty = { p1: "---", p2: "---", l1: "Glucosio --%", l2: "Glucosio --%" };
    if (targetV <= 0 || targetC <= 0) return empty;
    if (targetC < 5 || targetC > 33) return { ...empty, p1: "Range errato", p2: "5-33%" };
    let cLow = 5, cHigh = 10;
    if (targetC >= 10) { cLow = 10; cHigh = 33; }
    const labelLow = `Glucosio ${cLow}%`;
    const labelHigh = `Glucosio ${cHigh}%`;
    if (targetC === cLow) return { p1: `${formatDisplay(targetV)} ml`, p2: "---", l1: labelLow, l2: labelHigh };
    if (targetC === cHigh) return { p1: "---", p2: `${formatDisplay(targetV)} ml`, l1: labelLow, l2: labelHigh };
    const vHighRaw = targetV * (targetC - cLow) / (cHigh - cLow);
    const vHighRounded = Math.ceil(vHighRaw * 10) / 10;
    const vLowAdjusted = Math.max(0, targetV - vHighRounded);
    return { p1: `${formatDisplay(vLowAdjusted)} ml`, p2: `${formatDisplay(vHighRounded)} ml`, l1: labelLow, l2: labelHigh };
  }, [nutrition.glucosioPerc, nutrition.glucosioMl]);

  const volumes = useMemo(() => ({
    glucosio: nutrition.glucosioMl,
    tph: nutrition.tphMl,
    esafosfina: nutrition.esafosfinaMl,
    nacl: (nutrition.naclMeq || 0) / 2,
    kcl: (nutrition.kclMeq || 0) / 2,
    mg: (nutrition.mgMg || 0) / 10,
    ca: (nutrition.caMg || 0) / 10,
    oligo: nutrition.oligoMl,
    cernevit: nutrition.cernevitMl,
    smof: nutrition.smofMl,
    altro: nutrition.altroMl,
    altro2: nutrition.altro2Ml,
  }), [nutrition]);

  const totalVolume = useMemo(() => 
    (Object.values(volumes) as number[]).reduce((acc, curr) => acc + (curr || 0), 0)
  , [volumes]);

  const flowRate = (totalVolume / 24).toFixed(1).replace('.', ',');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: patient?.id || Math.random().toString(36).substr(2, 9),
      createdAt: patient?.createdAt || Date.now(),
      firstName,
      lastName,
      birthDate,
      nutrition
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto border border-slate-100 mb-8 transition-all duration-300">
      <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-3">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Scheda Nutrizione</h2>
        <button onClick={onCancel} className="p-1.5 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
          <XIcon />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Cognome</label>
            <input required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-400 focus:border-rose-400 outline-none text-lg font-semibold text-slate-700 bg-white uppercase" placeholder="ROSSI" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Nome</label>
            <input required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-400 focus:border-rose-400 outline-none text-lg font-semibold text-slate-700 bg-white" placeholder="Mario" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Data</label>
            <div className="relative group" onClick={() => dateInputRef.current?.showPicker()}>
              <input ref={dateInputRef} required type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-400 focus:border-rose-400 outline-none text-lg font-semibold text-slate-700 bg-white cursor-pointer appearance-none" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><CalendarIcon /></div>
            </div>
          </div>
        </div>

        {/* Nutrizione Parenterale Section - TEMA ROSA PASTELLO */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest border-l-4 border-rose-500 pl-2">Nutrizione Parenterale</h3>
          <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 transition-colors">
             <div className="space-y-1">
                <label className="text-xs font-black text-rose-600 uppercase tracking-wider">Glucosio %</label>
                <input type="number" step="0.1" value={nutrition.glucosioPerc === 0 ? '' : nutrition.glucosioPerc} onChange={e => updateField('glucosioPerc', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-400 text-xl font-black text-rose-900 focus:ring-1 focus:ring-rose-200 outline-none bg-white" />
             </div>
             <div className="space-y-1">
                <label className="text-xs font-black text-rose-600 uppercase tracking-wider">Glucosio ml</label>
                <input type="number" step="0.1" value={nutrition.glucosioMl === 0 ? '' : nutrition.glucosioMl} onChange={e => updateField('glucosioMl', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-400 text-xl font-black text-rose-900 focus:ring-1 focus:ring-rose-200 outline-none bg-white" />
             </div>
             <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-2 rounded-lg border border-rose-100 flex flex-col justify-center text-center">
                  <span className="text-[9px] font-bold text-rose-400 uppercase leading-none mb-1">{glucoseMixParts.l1}</span>
                  <span className="text-rose-800 font-black text-xs">{glucoseMixParts.p1}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-rose-100 flex flex-col justify-center text-center">
                  <span className="text-[9px] font-bold text-rose-400 uppercase leading-none mb-1">{glucoseMixParts.l2}</span>
                  <span className="text-rose-800 font-black text-xs">{glucoseMixParts.p2}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Componenti Nutrizione */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-emerald-500 pl-2 mb-2">Componenti Nutrizione</h3>
          <div className="grid grid-cols-1 gap-y-1 px-1 max-w-2xl mx-auto border-l-2 border-rose-50/50 pl-4">
            {[
              { id: 'tphMl', label: 'TPH', unit: 'ml', res: volumes.tph },
              { id: 'esafosfinaMl', label: 'Esafosfina', unit: 'ml', res: volumes.esafosfina },
              { id: 'naclMeq', label: 'NaCl', unit: 'mEq', res: volumes.nacl },
              { id: 'kclMeq', label: 'KCl', unit: 'mEq', res: volumes.kcl },
              { id: 'mgMg', label: 'Magnesio', unit: 'mg', res: volumes.mg },
              { id: 'caMg', label: 'Calcio', unit: 'mg', res: volumes.ca },
              { id: 'oligoMl', label: 'Oligoelementi', unit: 'ml', res: volumes.oligo },
              { id: 'cernevitMl', label: 'Cernevit', unit: 'ml', res: volumes.cernevit },
              { id: 'smofMl', label: 'SMOF Lipids', unit: 'ml', res: volumes.smof },
            ].map(f => (
              <div key={f.id} className="flex items-center justify-between border-b border-slate-100 py-2 group hover:bg-rose-50/30 px-2 rounded-lg transition-colors">
                <span className="text-sm font-bold text-slate-600 w-48">{f.label}</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={nutrition[f.id as keyof NutritionData] === 0 ? '' : nutrition[f.id as keyof NutritionData]} onChange={e => updateField(f.id as keyof NutritionData, e.target.value)} className="w-24 px-2 py-1.5 bg-white border border-slate-400 rounded-lg text-sm font-bold text-slate-800 text-center focus:border-rose-300 outline-none" placeholder="0" />
                    <span className="text-[10px] font-black text-slate-300 uppercase w-8">{f.unit}</span>
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-base font-black text-slate-900">{formatDisplay(f.res)}</span>
                    <span className="text-[10px] ml-1 font-bold text-slate-400">ml</span>
                  </div>
                </div>
              </div>
            ))}
            {/* Componenti Editabili */}
            {[
              { id: 'altroMl', labelField: 'altroLabel' as const, res: volumes.altro },
              { id: 'altro2Ml', labelField: 'altro2Label' as const, res: volumes.altro2 },
            ].map(f => (
              <div key={f.id} className="flex items-center justify-between border-b border-slate-100 py-2 group hover:bg-rose-50/30 px-2 rounded-lg transition-colors">
                <input value={nutrition[f.labelField] || ''} onChange={e => updateField(f.labelField, e.target.value)} className="text-sm font-bold text-slate-600 bg-transparent outline-none w-48 border-b border-dashed border-slate-400 focus:border-rose-400" placeholder="Componente..." />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={nutrition[f.id as keyof NutritionData] === 0 ? '' : nutrition[f.id as keyof NutritionData]} onChange={e => updateField(f.id as keyof NutritionData, e.target.value)} className="w-24 px-2 py-1.5 bg-white border border-slate-400 rounded-lg text-sm font-bold text-slate-800 text-center focus:border-rose-300 outline-none" placeholder="0" />
                    <span className="text-[10px] font-black text-slate-300 uppercase w-8">ml</span>
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-base font-black text-slate-900">{formatDisplay(f.res)}</span>
                    <span className="text-[10px] ml-1 font-bold text-slate-400">ml</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sommario Volumi */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-600 rounded-xl p-4 text-center shadow-lg shadow-emerald-50">
             <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-1 opacity-70">Volume Totale</p>
             <div className="text-3xl font-black text-white">{formatDisplay(totalVolume)} <span className="text-sm opacity-50">ml</span></div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 text-center shadow-lg shadow-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-70">Velocità Infusione</p>
             <div className="text-3xl font-black text-blue-400">{flowRate} <span className="text-sm opacity-50">ml/h</span></div>
          </div>
        </div>

        {/* SEZIONE FARMACI SPECIALE */}
        <div className="space-y-1">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-purple-500 pl-2 mb-2">Farmaci e Sedazione</h3>
          <div className="grid grid-cols-1 gap-1">
            <DrugSection title="Fentanest 100mcg/ 2 ml" doseKey="fentanestDose" speedKey="fentanestSpeed" formula={d => (d * 2) / 100} unit="mcg" colorClass="purple" nutrition={nutrition} updateField={updateField} />
            <DrugSection title="Dopamina 40 mg/ 1 ml" doseKey="dopaminaDose" speedKey="dopaminaSpeed" formula={d => (d * 1) / 40} unit="mg" colorClass="orange" nutrition={nutrition} updateField={updateField} />
            <DrugSection title="Midazolam 5 mg/ 1 ml" doseKey="midazolamDose" speedKey="midazolamSpeed" formula={d => (d * 1) / 5} unit="mg" colorClass="teal" nutrition={nutrition} updateField={updateField} />
            <DrugSection title="Dobutamina 12,5 mg/ 1 ml" doseKey="dobutaminaDose" speedKey="dobutaminaSpeed" formula={d => (d * 1) / 12.5} unit="mg" colorClass="amber" nutrition={nutrition} updateField={updateField} />
            <DrugSection title="Noradrenalina 2mg / 1 ml" doseKey="noradrenalinaDose" speedKey="noradrenalinaSpeed" formula={d => (d * 1) / 2} unit="mg" colorClass="red" nutrition={nutrition} updateField={updateField} />
            <DrugSection title="Lasix 20 mg/ 2 ml" doseKey="lasixDose" speedKey="lasixSpeed" formula={d => (d * 2) / 20} unit="mg" colorClass="blue" nutrition={nutrition} updateField={updateField} />
            <DrugSection title="Sildenafil 0,8 mg/ 1 ml" doseKey="sildenafilDose" speedKey="sildenafilSpeed" formula={d => (d * 1) / 0.8} unit="mg" colorClass="cyan" nutrition={nutrition} updateField={updateField} />
            <DrugSection title="Fenoldopam 20 mg/ 2 ml" doseKey="fenoldopamDose" speedKey="fenoldopamSpeed" formula={d => (d * 2) / 20} unit="mg" colorClass="indigo" nutrition={nutrition} updateField={updateField} />
            <DrugSection title="Acido etacrinico 50 mg/ 20 ml" doseKey="acidoEtacrinicoDose" speedKey="acidoEtacrinicoSpeed" formula={d => (d * 20) / 50} unit="mg" colorClass="slate" nutrition={nutrition} updateField={updateField} />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
          <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-md active:scale-95">
            <SaveIcon /> SALVA SCHEDA
          </button>
          <button type="button" onClick={onCancel} className="bg-slate-50 hover:bg-slate-100 text-slate-500 px-6 py-4 rounded-xl font-bold text-lg transition-all">ANNULLA</button>
          {patient && onDelete && (
            <button type="button" onClick={() => isConfirmingDelete ? onDelete(patient.id) : (setIsConfirmingDelete(true), setTimeout(() => setIsConfirmingDelete(false), 3000))} className={`p-4 rounded-xl transition-all ${isConfirmingDelete ? "bg-red-600 text-white animate-pulse" : "text-red-400 hover:bg-red-50"}`}>
              <TrashIcon />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
