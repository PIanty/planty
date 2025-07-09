import axios from "axios";
import { ReceiptData } from "./type";
import { backendURL } from "../config";

export type Response = {
  validation?: {
    validityFactor: number;
    descriptionOfAnalysis: string;
  };
  catMessage?: string;
  error?: boolean;
  errorType?: 'duplicate_image' | 'invalid_image' | 'server_error' | 'unknown';
};

export const submitReceipt = async (data: ReceiptData): Promise<Response> => {
  try {
    const response = await axios.post(`${backendURL}/submitReceipt`, data);

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      // Return the error response formatted by our backend
      return error.response.data as Response;
    }
    
    // Fallback error response with cat theme
    const fallbackResponse: Response = {
      validation: {
        validityFactor: 0,
        descriptionOfAnalysis: "Something went wrong when connecting to JusCat."
      },
      catMessage: "Meow? 😾 This kitty couldn't connect to the server!",
      error: true,
      errorType: 'server_error'
    };
    
    return fallbackResponse;
  }
};
