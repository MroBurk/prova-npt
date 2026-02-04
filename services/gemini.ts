
import { GoogleGenAI } from "@google/genai";

export const generatePatientSummary = async (patient: { firstName: string, lastName: string, birthDate: string, notes?: string }) => {
  // Always use the API key directly from process.env.API_KEY as per coding guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Agisci come un assistente medico esperto. 
    Analizza i dati di questo paziente:
    Nome: ${patient.firstName}
    Cognome: ${patient.lastName}
    Data di Nascita: ${patient.birthDate}
    Note aggiuntive: ${patient.notes || 'Nessuna nota fornita.'}
    
    Crea un brevissimo riassunto clinico professionale (massimo 3 frasi) in lingua italiana.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // The .text property is used to access the generated text as per guidelines.
    return response.text || "Impossibile generare il riassunto.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Errore durante la generazione del riassunto AI.";
  }
};
