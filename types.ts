
export interface NutritionData {
  glucosioPerc: number;
  glucosioMl: number;
  tphMl: number;
  esafosfinaMl: number;
  naclMeq: number;
  kclMeq: number;
  mgMg: number;
  caMg: number;
  oligoMl: number;
  cernevitMl: number;
  smofMl: number;
  altroMl: number;
  altroLabel: string;
  altro2Ml: number;
  altro2Label: string;
  // Sedazione e Farmaci Speciali
  fentanestDose?: number; fentanestSpeed?: number;
  morfinaDose?: number; morfinaSpeed?: number;
  midazolamDose?: number; midazolamSpeed?: number;
  dopaminaDose?: number; dopaminaSpeed?: number;
  dobutaminaDose?: number; dobutaminaSpeed?: number;
  noradrenalinaDose?: number; noradrenalinaSpeed?: number;
  lasixDose?: number; lasixSpeed?: number;
  sildenafilDose?: number; sildenafilSpeed?: number;
  fenoldopamDose?: number; fenoldopamSpeed?: number;
  acidoEtacrinicoDose?: number; acidoEtacrinicoSpeed?: number;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  nutrition: NutritionData;
  createdAt: number;
}

export type ViewState = 'dashboard' | 'form';
