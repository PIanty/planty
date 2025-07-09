import axios from "axios";
import { backendURL } from "../config";

export type PassportStatus = {
  hasPassport: boolean;
  required: boolean;
  message?: string;
  catMessage?: string;
  error?: boolean;
};

export const checkPassportStatus = async (address: string): Promise<PassportStatus> => {
  try {
    const response = await axios.get(`${backendURL}/passportStatus/${address}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      // Return the error response formatted by our backend
      return error.response.data as PassportStatus;
    }
    
    // Fallback error response with cat theme
    return {
      hasPassport: false,
      required: false,
      message: "Error checking passport status",
      catMessage: "Meow? 😾 This kitty couldn't check your passport status!",
      error: true
    };
  }
}; 