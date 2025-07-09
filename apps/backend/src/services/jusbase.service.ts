import { Service } from 'typedi';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_JUSROLE } from '@config';
import { logger } from '@utils/logger';

@Service()
export class JusbaseService {
  private supabase;

  constructor() {
    try {
      this.supabase = createClient(SUPABASE_URL, SUPABASE_JUSROLE);
      logger.info(`Jusbase service initialized with URL: ${SUPABASE_URL.substring(0, 15)}...`);
      this.initializeStorage();
      this.checkDatabase();
    } catch (error) {
      logger.error(`Failed to initialize Supabase client: ${error.message}`);
      throw error;
    }
  }

  /**
   * Initialize Supabase storage by checking and creating buckets if needed
   */
  private async initializeStorage() {
    try {
      // Check if receipts bucket exists
      const { data: buckets, error } = await this.supabase.storage.listBuckets();
      
      if (error) {
        logger.error(`Failed to list storage buckets: ${error.message}`);
        return;
      }
      
      const receiptsBucketExists = buckets.some(bucket => bucket.name === 'receipts');
      
      if (!receiptsBucketExists) {
        logger.info('Creating receipts bucket in Supabase storage');
        const { error: createError } = await this.supabase.storage.createBucket('receipts', {
          public: true
        });
        
        if (createError) {
          logger.error(`Failed to create receipts bucket: ${createError.message}`);
        } else {
          logger.info('Receipts bucket created successfully');
        }
      } else {
        logger.info('Receipts bucket already exists');
      }
    } catch (error) {
      logger.error(`Storage initialization error: ${error.message}`);
    }
  }

  /**
   * Check if database tables exist and show helpful messages
   */
  private async checkDatabase() {
    try {
      // Check if submission_history table exists
      const { data, error } = await this.supabase
        .from('submission_history')
        .select('count(*)')
        .limit(1);
      
      if (error) {
        if (error.message.includes('relation "submission_history" does not exist')) {
          logger.error('TABLE submission_history DOES NOT EXIST! Please run the SQL migration first.');
          logger.error('Create table by running the SQL commands in justscheme.sql');
        } else {
          logger.error(`Database check error: ${error.message}`);
        }
      } else {
        logger.info('Database tables verified successfully');
      }
    } catch (error) {
      logger.error(`Database check error: ${error.message}`);
    }
  }

  /**
   * Upload an image to Supabase Storage
   * @param imageBase64 Base64 image data
   * @param walletAddress User's wallet address
   * @returns URL of the uploaded image
   */
  public async uploadImage(imageBase64: string, walletAddress: string): Promise<string> {
    try {
      // Convert base64 to buffer
      let base64Data = imageBase64;
      
      // Handle both formats: with prefix or without
      if (base64Data.includes('base64,')) {
        base64Data = imageBase64.split('base64,')[1];
      }
      
      if (!base64Data) {
        throw new Error('Invalid image data');
      }
      
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Generate a unique filename based on timestamp and wallet
      const timestamp = Date.now();
      const filename = `${walletAddress.substring(0, 8)}_${timestamp}.jpg`;
      
      // Make sure bucket exists
      await this.ensureReceiptsBucketExists();
      
      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from('receipts')
        .upload(`public/${filename}`, buffer, {
          contentType: 'image/jpeg',
          upsert: true // Change to true to overwrite if needed
        });
      
      if (error) {
        logger.error(`Failed to upload image: ${JSON.stringify(error)}`);
        throw new Error(`Failed to upload image: ${error.message}`);
      }
      
      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('receipts')
        .getPublicUrl(`public/${filename}`);
      
      logger.info(`Image uploaded successfully: ${filename}`);
      return urlData.publicUrl;
    } catch (error) {
      logger.error(`Image upload error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Ensure receipts bucket exists
   */
  private async ensureReceiptsBucketExists(): Promise<void> {
    try {
      const { data: buckets, error } = await this.supabase.storage.listBuckets();
      
      if (error) {
        logger.error(`Failed to list buckets: ${error.message}`);
        return;
      }
      
      const receiptsBucket = buckets.find(bucket => bucket.name === 'receipts');
      
      if (!receiptsBucket) {
        logger.info('Creating receipts bucket');
        const { error: createError } = await this.supabase.storage.createBucket('receipts', {
          public: true
        });
        
        if (createError) {
          logger.error(`Failed to create bucket: ${createError.message}`);
        }
      }
    } catch (error) {
      logger.error(`Ensure bucket error: ${error.message}`);
    }
  }

  /**
   * Check if an image hash already exists in the database
   * @param imageHash Hash of the image to check
   * @returns Boolean indicating if the hash exists
   */
  public async isImageHashDuplicate(imageHash: string): Promise<boolean> {
    try {
      logger.info(`Checking for duplicate image hash: ${imageHash.substring(0, 20)}...`);
      
      const { data, error } = await this.supabase
        .from('submission_history')
        .select('id')
        .eq('image_hash', imageHash)
        .limit(1);
      
      if (error) {
        logger.error(`Error checking image hash: ${error.message}`);
        // If we can't check, assume it's not a duplicate to prevent blocking submissions
        return false;
      }
      
      const isDuplicate = Array.isArray(data) && data.length > 0;
      logger.info(`Image hash duplicate check result: ${isDuplicate}`);
      
      return isDuplicate;
    } catch (error) {
      logger.error(`Error in isImageHashDuplicate: ${error.message}`);
      return false;
    }
  }

  /**
   * Store submission history data
   * @param walletAddress User's wallet address
   * @param imageUrl URL of the uploaded image
   * @param imageHash Hash of the uploaded image
   * @param reward Amount of reward given
   * @param validityFactor Validity factor of the submission
   * @returns Success indicator
   */
  public async storeSubmissionHistory(
    walletAddress: string,
    imageUrl: string,
    imageHash: string,
    reward: number,
    validityFactor: number
  ): Promise<boolean> {
    try {
      // Log the data we're inserting
      logger.info(`Storing submission history: ${JSON.stringify({
        wallet_address: walletAddress,
        image_url: imageUrl.substring(0, 20) + '...',
        image_hash: imageHash.substring(0, 20) + '...',
        reward,
        validity_factor: validityFactor
      })}`);

      // Ensure the table exists
      await this.checkTableExists();
      
      // Check for duplicate hash
      const isDuplicate = await this.isImageHashDuplicate(imageHash);
      if (isDuplicate) {
        logger.warn(`Duplicate image hash detected: ${imageHash.substring(0, 20)}...`);
        throw new Error('Duplicate image hash detected');
      }
      
      // Insert data
      const { error } = await this.supabase
        .from('submission_history')
        .insert({
          wallet_address: walletAddress,
          image_url: imageUrl,
          image_hash: imageHash,
          reward,
          validity_factor: validityFactor
        });
      
      if (error) {
        // Special handling for unique constraint violations
        if (error.message.includes('duplicate key value violates unique constraint')) {
          logger.warn(`Duplicate image hash detected during insert: ${imageHash.substring(0, 20)}...`);
          throw new Error('Duplicate image hash detected');
        }
        
        logger.error(`Failed to store submission history: ${JSON.stringify(error)}`);
        throw new Error(`Failed to store submission history: ${error.message}`);
      }
      
      logger.info(`Submission history stored successfully for: ${walletAddress.substring(0, 10)}...`);
      return true;
    } catch (error) {
      logger.error(`Store submission history error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if the submission_history table exists
   */
  private async checkTableExists(): Promise<boolean> {
    try {
      // A simple query to check if the table exists
      const { error } = await this.supabase
        .from('submission_history')
        .select('id')
        .limit(1);
      
      if (error && error.message.includes('relation "submission_history" does not exist')) {
        logger.error('Table submission_history does not exist. Please run the SQL migration.');
        return false;
      }
      
      return !error;
    } catch (error) {
      logger.error(`Check table error: ${error.message}`);
      return false;
    }
  }

  /**
   * Get submission history for a wallet address
   * @param walletAddress User's wallet address
   * @returns Array of submission history items
   */
  public async getSubmissionHistory(walletAddress: string) {
    try {
      logger.info(`Fetching submission history for: ${walletAddress}`);
      
      const { data, error } = await this.supabase
        .from('submission_history')
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('timestamp', { ascending: false });
      
      if (error) {
        logger.error(`Failed to get submission history: ${error.message}`);
        throw new Error(`Failed to get submission history: ${error.message}`);
      }
      
      logger.info(`Retrieved ${data?.length || 0} history items`);
      return data || [];
    } catch (error) {
      logger.error(`Get submission history error: ${error.message}`);
      throw error;
    }
  }
} 