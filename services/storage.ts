
import { Patient } from '../types';

const STORAGE_KEY = 'meddash_patients_v1';

export const storageService = {
  getPatients: (): Patient[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  savePatients: (patients: Patient[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  },
  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
