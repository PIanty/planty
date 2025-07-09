import { create } from "zustand";
import { Response } from "../networking";

interface useSubmissionState {
  isLoading: boolean;
  response: Response | null;
  setIsLoading: (isLoading: boolean) => void;
  setResponse: (response: Response) => void;
  clearAll: () => void;
}

export const useSubmission = create<useSubmissionState>((set) => ({
  isLoading: false,
  response: null,
  setIsLoading: (isLoading) => set({ isLoading }),
  setResponse: (response) => {
    // Make sure response is formatted properly to avoid runtime errors
    const safeResponse: Response = {
      ...response,
      validation: response.validation || { validityFactor: 0, descriptionOfAnalysis: '' }
    };
    
    set({ response: safeResponse });
  },
  clearAll: () => set({ isLoading: false, response: null }),
}));
