
import { jsPDF } from 'jspdf';
import { Patient } from '../types';

export const generatePatientPDF = (patient: Patient) => {
  // Impostazione formato A5 (148 x 210 mm)
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a5'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const rightEdge = pageWidth - margin;
  
  // Helper per formattazione italiana
  const formatNum = (n: number | undefined) => (n || 0).toFixed(2).replace('.', ',');
  const formatSimple = (n: number | undefined) => (n || 0).toString().replace('.', ',');

  // FORZA TUTTO IL TESTO A NERO
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);

  // --- INTESTAZIONE ---
  let y = 12;
  const boxHeight = 14;
  const boxSpacing = 2;
  const thirdWidth = (pageWidth - (margin * 2) - (boxSpacing * 2)) / 3;

  // Casella COGNOME
  doc.setLineWidth(0.2);
  doc.rect(margin, y, thirdWidth, boxHeight);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('COGNOME', margin + 2, y + 4);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text((patient.lastName || '').toUpperCase(), margin + 2, y + 10);

  // Casella NOME
  doc.rect(margin + thirdWidth + boxSpacing, y, thirdWidth, boxHeight);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('NOME', margin + thirdWidth + boxSpacing + 2, y + 4);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(patient.firstName || '', margin + thirdWidth + boxSpacing + 2, y + 10);

  // Casella DATA
  doc.rect(margin + (thirdWidth + boxSpacing) * 2, y, thirdWidth, boxHeight);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('DATA SCHEDA', margin + (thirdWidth + boxSpacing) * 2 + 2, y + 4);
  const recordDate = new Date(patient.birthDate).toLocaleDateString('it-IT');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(recordDate, margin + (thirdWidth + boxSpacing) * 2 + 2, y + 10);

  // --- TABELLA COMPONENTI ---
  y = 35;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
  doc.text('Componente', margin + 2, y + 5);
  doc.text('Dosaggio', 60, y + 5);
  doc.text('Volume (ml)', rightEdge - 2, y + 5, { align: 'right' });
  
  y += 11;

  // Calcolo Mix Glucosio Esteso
  const { glucosioPerc, glucosioMl } = patient.nutrition;
  let mixLines: string[] = [];
  if (glucosioMl > 0 && glucosioPerc >= 5 && glucosioPerc <= 33) {
    let cLow = 5, cHigh = 10;
    if (glucosioPerc >= 10) { cLow = 10; cHigh = 33; }
    
    if (glucosioPerc === cLow) {
      mixLines.push(`Glucosio ${cLow}% -> ${formatNum(glucosioMl)} ml`);
    } else if (glucosioPerc === cHigh) {
      mixLines.push(`Glucosio ${cHigh}% -> ${formatNum(glucosioMl)} ml`);
    } else {
      const vHighRaw = glucosioMl * (glucosioPerc - cLow) / (cHigh - cLow);
      const vHighRounded = Math.ceil(vHighRaw * 10) / 10;
      const vLowAdjusted = Math.max(0, glucosioMl - vHighRounded);
      
      if (vLowAdjusted > 0) mixLines.push(`Glucosio ${cLow}% -> ${formatNum(vLowAdjusted)} ml`);
      if (vHighRounded > 0) mixLines.push(`Glucosio ${cHigh}% -> ${formatNum(vHighRounded)} ml`);
    }
  }

  // Riga Glucosio Aggiornata
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 4, pageWidth - (margin * 2), 12, 'F');
  
  doc.setFont('helvetica', 'bold');
  // Sotto Componente: GLUCOSIO + %
  doc.text(`GLUCOSIO ${formatSimple(glucosioPerc)}%`, margin + 2, y + 2.5);
  
  doc.setFont('helvetica', 'normal');
  // Sotto Dosaggio: Volume Totale
  doc.text(`${formatNum(glucosioMl)} ml`, 60, y + 2.5);
  
  // Sotto Volume(ml): Il Calcolo Esteso
  doc.setFontSize(7);
  if (mixLines.length === 2) {
    doc.text(mixLines[0], rightEdge - 2, y + 1, { align: 'right' });
    doc.text(mixLines[1], rightEdge - 2, y + 4.5, { align: 'right' });
  } else if (mixLines.length === 1) {
    doc.text(mixLines[0], rightEdge - 2, y + 2.5, { align: 'right' });
  } else {
    doc.text(`${formatNum(glucosioMl)}`, rightEdge - 2, y + 2.5, { align: 'right' });
  }
  
  doc.setFontSize(11);
  y += 12;

  const components = [
    { label: 'TPH', val: patient.nutrition.tphMl, unit: 'ml', vol: patient.nutrition.tphMl },
    { label: 'Esafosfina', val: patient.nutrition.esafosfinaMl, unit: 'ml', vol: patient.nutrition.esafosfinaMl },
    { label: 'NaCl', val: patient.nutrition.naclMeq, unit: 'mEq', vol: (patient.nutrition.naclMeq || 0) / 2 },
    { label: 'KCl', val: patient.nutrition.kclMeq, unit: 'mEq', vol: (patient.nutrition.kclMeq || 0) / 2 },
    { label: 'Magnesio', val: patient.nutrition.mgMg, unit: 'mg', vol: (patient.nutrition.mgMg || 0) / 10 },
    { label: 'Calcio', val: patient.nutrition.caMg, unit: 'mg', vol: (patient.nutrition.caMg || 0) / 10 },
    { label: 'Oligoelementi', val: patient.nutrition.oligoMl, unit: 'ml', vol: patient.nutrition.oligoMl },
    { label: 'Cernevit', val: patient.nutrition.cernevitMl, unit: 'ml', vol: patient.nutrition.cernevitMl },
    { label: 'SMOF Lipids', val: patient.nutrition.smofMl, unit: 'ml', vol: patient.nutrition.smofMl },
    { label: patient.nutrition.altroLabel || 'Altro 1', val: patient.nutrition.altroMl, unit: 'ml', vol: patient.nutrition.altroMl },
    { label: patient.nutrition.altro2Label || 'Altro 2', val: patient.nutrition.altro2Ml, unit: 'ml', vol: patient.nutrition.altro2Ml },
  ];

  let totalVolume = glucosioMl || 0;
  doc.setDrawColor(0, 0, 0); 
  doc.setLineWidth(0.1);

  components.forEach((comp) => {
    doc.setFont('helvetica', 'normal');
    doc.text(comp.label, margin + 2, y);
    doc.text(`${formatNum(comp.val)} ${comp.unit}`, 60, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`${formatNum(comp.vol)}`, rightEdge - 2, y, { align: 'right' });
    totalVolume += (comp.vol || 0);
    y += 1.5;
    doc.line(margin, y, rightEdge, y);
    y += 5;
  });

  // --- RIEPILOGO NUTRIZIONE ---
  y += 2;
  doc.setLineWidth(0.4);
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, y, rightEdge, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('VOLUME TOTALE:', margin + 2, y);
  doc.text(`${formatNum(totalVolume)} ml`, rightEdge - 2, y, { align: 'right' });
  y += 6;
  doc.text('VELOCITÀ INFUSIONE:', margin + 2, y);
  doc.text(`${(totalVolume / 24).toFixed(1).replace('.', ',')} ml/h`, rightEdge - 2, y, { align: 'right' });

  // --- SEZIONE FARMACI E SEDAZIONE ---
  const drugs = [
    { label: 'Fentanest 100mcg/2ml', dose: patient.nutrition.fentanestDose, speed: patient.nutrition.fentanestSpeed, formula: (d: number) => (d * 2) / 100, unit: 'mcg' },
    { label: 'Dopamina 40mg/1ml', dose: patient.nutrition.dopaminaDose, speed: patient.nutrition.dopaminaSpeed, formula: (d: number) => (d * 1) / 40, unit: 'mg' },
    { label: 'Midazolam 5mg/1ml', dose: patient.nutrition.midazolamDose, speed: patient.nutrition.midazolamSpeed, formula: (d: number) => (d * 1) / 5, unit: 'mg' },
    { label: 'Dobutamina 12.5mg/1ml', dose: patient.nutrition.dobutaminaDose, speed: patient.nutrition.dobutaminaSpeed, formula: (d: number) => (d * 1) / 12.5, unit: 'mg' },
    { label: 'Noradrenalina 2mg/1ml', dose: patient.nutrition.noradrenalinaDose, speed: patient.nutrition.noradrenalinaSpeed, formula: (d: number) => (d * 1) / 2, unit: 'mg' },
    { label: 'Lasix 20mg/2ml', dose: patient.nutrition.lasixDose, speed: patient.nutrition.lasixSpeed, formula: (d: number) => (d * 2) / 20, unit: 'mg' },
    { label: 'Sildenafil 0.8mg/1ml', dose: patient.nutrition.sildenafilDose, speed: patient.nutrition.sildenafilSpeed, formula: (d: number) => (d * 1) / 0.8, unit: 'mg' },
    { label: 'Fenoldopam 20mg/2ml', dose: patient.nutrition.fenoldopamDose, speed: patient.nutrition.fenoldopamSpeed, formula: (d: number) => (d * 2) / 20, unit: 'mg' },
    { label: 'Acido Etacrinico 50mg/20ml', dose: patient.nutrition.acidoEtacrinicoDose, speed: patient.nutrition.acidoEtacrinicoSpeed, formula: (d: number) => (d * 20) / 50, unit: 'mg' },
  ];

  const activeDrugs = drugs.filter(d => d.dose && d.dose > 0);

  if (activeDrugs.length > 0) {
    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(230, 230, 255);
    doc.rect(margin, y - 4, pageWidth - (margin * 2), 6, 'F');
    doc.text('FARMACI E SEDAZIONE', margin + 2, y);
    y += 6;

    activeDrugs.forEach(drug => {
      const prelevare = drug.formula(drug.dose || 0);
      const speed = drug.speed || 0.1;
      let portaA = "---";
      if (speed === 0.1) portaA = "2,5 ml";
      else if (speed === 0.2) portaA = "5 ml";
      else if (speed === 0.5) portaA = "12 ml";
      else if (speed === 1.0) portaA = "24 ml";

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(drug.label, margin + 2, y);
      
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(`Dose: ${drug.dose} ${drug.unit}`, margin + 4, y);
      doc.text(`Vel: ${formatSimple(speed)} ml/h`, 38, y);
      doc.text(`Porta a: ${portaA}`, 68, y);
      doc.setFont('helvetica', 'bold');
      doc.text(`Prelevare: ${formatNum(prelevare)} ml`, rightEdge - 2, y, { align: 'right' });
      
      y += 2;
      doc.setDrawColor(150, 150, 150); 
      doc.line(margin + 2, y, rightEdge - 2, y);
      y += 5;
    });
  }

  // --- CORNICE ESTERNA DINAMICA ---
  const finalFrameBottom = y + 2;
  doc.setLineWidth(0.3);
  doc.setDrawColor(0, 0, 0);
  doc.rect(5, 5, pageWidth - 10, Math.min(finalFrameBottom - 5, 200));

  doc.save(`Scheda_${patient.lastName}_${patient.firstName}.pdf`);
};
