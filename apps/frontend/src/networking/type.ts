export interface ReceiptData {
  image: string;
  address: string;
  deviceID: string;
  imageHash: string;
}

export interface SubmissionHistoryItem {
  id: string;
  wallet_address: string;
  image_url: string;
  reward: number;
  timestamp: string;
  validity_factor: number;
  image_hash?: string;
}

export interface SubmissionHistoryResponse {
  history: SubmissionHistoryItem[];
}
