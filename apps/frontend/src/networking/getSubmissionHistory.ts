import axios, { AxiosError } from "axios";
import { SubmissionHistoryResponse } from "./type";
import { backendURL } from "../config";

export const getSubmissionHistory = async (walletAddress: string): Promise<SubmissionHistoryResponse> => {
  try {
    // Make sure we're using the correct endpoint format
    const response = await axios.get(`${backendURL}/submissionHistory/${walletAddress}`);
    
    // Check if we have a valid response structure
    if (response.data && Array.isArray(response.data.history)) {
      return response.data;
    } else {
      // If the structure is wrong, try to handle different response formats
      if (Array.isArray(response.data)) {
        return { history: response.data };
      }
      
      console.error("Unexpected history format:", response.data);
      return { history: [] };
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error(
      "Error fetching submission history:", 
      axiosError.response 
        ? `Status: ${axiosError.response.status}, Message: ${JSON.stringify(axiosError.response.data)}`
        : axiosError.message || String(error)
    );
    // Return empty history on error
    return { history: [] };
  }
}; 