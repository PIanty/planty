import { HttpException } from '@/exceptions/HttpException';
import { Submission } from '@/interfaces/submission.interface';
import { jusCatContract, jusCatPassportContract, tryWithFallbackRPC, thor } from '@/utils/thor';
import { Service } from 'typedi';
import * as console from 'node:console';
import { unitsUtils } from '@vechain/sdk-core';
import { REWARD_AMOUNT } from '@config';
import { config } from '@repo/config-contract';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '@utils/logger';
import { ADMIN_ADDRESS, BACKEND_URL } from '@config';

@Service()
export class ContractsService {
  // Local cache of passport holders to improve performance and handle pending transactions
  private passportHolders: Set<string> = new Set();
  
  public async registerSubmission(submission: Submission): Promise<boolean> {
    let isSuccess = false;
    try {
      // Use fallback RPC mechanism to ensure reliable blockchain transactions
      isSuccess = await tryWithFallbackRPC(async () => {
        // Check if rewards are available for current cycle
        const currentCycle = (await jusCatContract.read.getCurrentCycle())[0];
        const rewardsLeft = (await jusCatContract.read.rewardsLeft(currentCycle))[0];
        
        if (rewardsLeft.toString() === '0') {
          throw new HttpException(400, `Meow! 😸 This kitty's treat jar is empty! No more rewards available in this cycle. Purr-haps try again in the next cycle?`);
        }
        
        const result = await (
          await jusCatContract.transact.registerValidSubmission(
            submission.address, 
            unitsUtils.parseUnits(REWARD_AMOUNT, 'ether').toString()
          )
        ).wait();
        
        return !result.reverted;
      });
    } catch (error: any) {
      console.log('Error', error);
      
      // Check if error message contains specific pattern indicating no rewards
      if (error.message && (
          error.message.includes('insufficient') || 
          error.message.includes('no rewards') || 
          error.message.includes('empty'))) {
        throw new HttpException(400, `Meow! 😿 The JusCat's reward bowl is empty! No more treats available this cycle. Check back when the humans refill it!`);
      }
      
      // Check if error is related to missing passport
      if (error.message && error.message.includes('Participant does not have a passport')) {
        throw new HttpException(403, `Meow! 😿 This kitty needs to see your Katty before accepting your submission!`);
      }
      
      // If it's already our custom error, rethrow it
      if (error instanceof HttpException) {
        throw error;
      }
      
      // ✅ FIX: Throw any other error instead of returning false
      throw new HttpException(500, `Meow! 😿 The JusCat couldn't send your rewards. Transaction failed: ${error.message || 'Unknown error'}`);
    }

    return isSuccess;
  }

  public async validateSubmission(submission: Submission): Promise<void> {
    try {
      // Check if current cycle has rewards
      await tryWithFallbackRPC(async () => {
        console.log(`[DEBUG] Validating submission for ${submission.address.substring(0, 10)}...`);
        
        const currentCycle = (await jusCatContract.read.getCurrentCycle())[0];
        console.log(`[DEBUG] Current cycle: ${currentCycle}`);
        
        const rewardsLeft = (await jusCatContract.read.rewardsLeft(currentCycle))[0];
        console.log(`[DEBUG] Rewards left: ${rewardsLeft.toString()}`);
        
        if (rewardsLeft.toString() === '0') {
          throw new HttpException(400, `Meow! 😸 This kitty's tree planting fund is empty! No more rewards available in this cycle. Purr-haps try again in the next cycle?`);
        }
        
        const isMaxSubmissionsReached = (await jusCatContract.read.isUserMaxSubmissionsReached(submission.address))[0];
        console.log(`[DEBUG] Max submissions reached: ${isMaxSubmissionsReached}`);
        
        if (Boolean(isMaxSubmissionsReached) === true) {
          throw new HttpException(409, `Meow! 🙀 You've already planted your maximum trees this cycle! This kitty can't accept any more from you until next cycle.`);
        }
        
        console.log(`[DEBUG] Contract validation passed successfully`);
      });

      // Check if user has required passport - always require passport
      const passportStatus = await this.checkPassport(submission.address);
      if (!passportStatus.hasPassport) {
        throw new HttpException(403, `Meow! 😿 This kitty needs to see your Katty before accepting your tree planting photo!`);
      }
    } catch (error) {
      console.log(`[DEBUG] validateSubmission error:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, `Meow? 😾 Something went wrong while checking your submission: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Check if a user has a Katty passport and if it's required for submission
   * @param address The wallet address to check
   * @returns Object with hasPassport, required status, and message
   */
  public async checkPassport(address: string): Promise<{hasPassport: boolean, required: boolean, message?: string}> {
    try {
      console.log(`[DEBUG] Checking passport for address: ${address}`);
      
      // Default response if passport functionality is not set up
      if (!config.PASSPORT_ADDRESS || !jusCatPassportContract) {
        console.log(`[DEBUG] Passport system not configured. PASSPORT_ADDRESS: ${config.PASSPORT_ADDRESS}, jusCatPassportContract: ${!!jusCatPassportContract}`);
        return {
          hasPassport: false,
          required: true, // Always require passport
          message: "Passport system not configured but passport is required"
        };
      }
      
      // Always require passport regardless of contract setting
      const required = true;

      // Check if user has passport
      let hasPassport = false;
      
      // First check local cache for immediate response
      if (this.passportHolders.has(address.toLowerCase())) {
        console.log(`[DEBUG] Address ${address} found in local cache as passport holder`);
        hasPassport = true;
      } else {
        try {
          if (jusCatPassportContract) {
            // Check passport status directly from the passport contract
            const passportContract = jusCatPassportContract as any;
            
            // For admin, always return true (admin always has access)
            const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS || '';
            console.log(`[DEBUG] Admin address: ${ADMIN_ADDRESS}, user address: ${address}`);
            
            if (address.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
              hasPassport = true;
              console.log(`[DEBUG] Admin address detected: ${address}, granting passport access`);
              
              // Add admin to local cache
              this.passportHolders.add(address.toLowerCase());
            } else {
              try {
                // Use fallback RPC mechanism to ensure reliable blockchain queries
                hasPassport = await tryWithFallbackRPC(async () => {
                  // For regular users, check the contract
                  console.log(`[DEBUG] Checking passport status for address: ${address}`);
                  
                  // Try multiple ways to check passport status
                  try {
                    // Method 1: Call hasPassport function
                    const result = (await passportContract.read.hasPassport(address))[0];
                    console.log(`[DEBUG] Method 1 - hasPassport result: ${result}`);
                    return result;
                  } catch (err1) {
                    console.log('[DEBUG] Method 1 failed:', err1);
                    
                    try {
                      // Method 2: Check balance
                      const balance = (await passportContract.read.balanceOf(address))[0];
                      console.log(`[DEBUG] Method 2 - balance result: ${balance}`);
                      return balance > 0;
                    } catch (err2) {
                      console.log('[DEBUG] Method 2 failed:', err2);
                      
                      // If both methods fail, default to false
                      return false;
                    }
                  }
                });
                
                // If passport found on blockchain, add to local cache
                if (hasPassport) {
                  this.passportHolders.add(address.toLowerCase());
                }
                
                console.log(`[DEBUG] Passport status for ${address}: ${hasPassport ? 'Has passport' : 'No passport'}`);
              } catch (err) {
                console.log('[DEBUG] Contract read error:', err);
                // If the function call fails, assume no passport
                hasPassport = false;
              }
            }
          }
        } catch (err) {
          console.log('[DEBUG] Has passport check failed:', err);
        }
      }
      
      console.log(`[DEBUG] Final passport status for ${address}: ${hasPassport ? 'Has passport' : 'No passport'}`);
      
      return {
        hasPassport,
        required: true, // Always require passport
        message: hasPassport 
          ? "You have a valid Katty"
          : "You need a Katty to submit tree planting photos"
      };
    } catch (error) {
      console.error('[DEBUG] Error checking passport status:', error);
      // Even if there's an error, still require passport
      return {
        hasPassport: false,
        required: true,
        message: "Error checking passport status, but passport is still required"
      };
    }
  }

  /**
   * Mint a passport for a user
   * @param userAddress The address to mint the passport for
   * @returns Success status
   */
  public async mintPassport(userAddress: string): Promise<boolean> {
    try {
      console.log(`[DEBUG] Starting mint passport for ${userAddress}`);
      
      if (!config.PASSPORT_ADDRESS || !jusCatPassportContract) {
        console.log(`[DEBUG] Passport system not configured. PASSPORT_ADDRESS: ${config.PASSPORT_ADDRESS}, jusCatPassportContract: ${!!jusCatPassportContract}`);
        throw new HttpException(500, 'Passport system not configured');
      }

      // IMPORTANT: Check if user already has a passport BEFORE trying to mint
      console.log(`[DEBUG] Checking if ${userAddress} already has a passport...`);
      const passportStatus = await this.checkPassport(userAddress);
      
      if (passportStatus.hasPassport) {
        console.log(`[DEBUG] User ${userAddress} already has a passport! Skipping mint.`);
        throw new HttpException(400, `Address ${userAddress} already has a Katty passport!`);
      }

      console.log(`[DEBUG] User ${userAddress} doesn't have passport, proceeding with mint...`);
      
      // Use local image for NFT passport - create proper metadata with local logo
      const metadataUri = await this.createPassportMetadata();
      
      // Get the passport contract
      const passportContract = jusCatPassportContract as any;
      
      try {
        // Use fallback RPC mechanism to ensure the transaction goes through
        return await tryWithFallbackRPC(async () => {
          try {
            // Mint the passport with direct image URL
            console.log(`[DEBUG] Sending transaction to mint passport for ${userAddress} with metadata URI: ${metadataUri}`);
            
            // Create transaction - mintPassport only takes 2 parameters according to ABI
            const tx = await passportContract.transact.mintPassport(
              userAddress, 
              metadataUri
            );
            console.log(`[DEBUG] Transaction created with ID: ${tx.id}`);
            
            // Wait for transaction to be processed with timeout
            console.log(`[DEBUG] Waiting for transaction to be processed...`);
            const result = await Promise.race([
              tx.wait(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Transaction timeout after 30 seconds')), 30000)
              )
            ]);
            console.log(`[DEBUG] Transaction result received`);
            
            if (result.reverted) {
              console.log(`[DEBUG] Transaction was reverted`);
              throw new HttpException(500, 'Transaction was reverted by the blockchain');
            }
            
            console.log(`[DEBUG] Transaction successful! Passport minted for ${userAddress}`);
            
            // Add the address to our local cache of passport holders
            this.passportHolders.add(userAddress.toLowerCase());
            
            return true;
          } catch (innerError) {
            console.error('[DEBUG] Inner transaction error:', innerError);
            
            // If there's still an error, try fallback approach without options
            try {
              console.log(`[DEBUG] Trying fallback transaction approach for ${userAddress}`);
              
              const simpleTx = await passportContract.transact.mintPassport(
                userAddress, 
                metadataUri
              );
              
              const simpleResult = await simpleTx.wait();
              
              if (!simpleResult.reverted) {
                console.log(`[DEBUG] Fallback transaction successful! Passport minted for ${userAddress}`);
                this.passportHolders.add(userAddress.toLowerCase());
                return true;
              }
            } catch (fallbackError) {
              console.error('[DEBUG] Fallback transaction also failed:', fallbackError);
            }
            
            // Don't simulate success if we know the user already has a passport
            throw new HttpException(500, 'Failed to mint passport - transaction reverted');
          }
        });
      } catch (txError) {
        console.error('[DEBUG] Transaction error:', txError);
        
        // Check if error is related to RPC URL
        if (txError.message && txError.message.includes('Invalid URL')) {
          throw new HttpException(500, 'Invalid RPC URL. Please check network configuration.');
        }
        
        // Check if error is related to duplicate passport
        if (txError.message && (txError.message.includes('Already has a passport') || txError.message.includes('revert'))) {
          throw new HttpException(400, `Address ${userAddress} already has a Katty passport!`);
        }
        
        throw new HttpException(500, `Transaction failed: ${txError.message}`);
      }
    } catch (error) {
      console.error('[DEBUG] Error minting passport:', error);
      throw new HttpException(500, `Failed to mint passport: ${error.message}`);
    }
  }
  
  /**
   * Create passport metadata with randomized Katty images and descriptions
   * @returns Passport metadata as an HTTP URL
   */
  private async createPassportMetadata(): Promise<string> {
    try {
      // Generate a unique token ID for this passport
      const tokenId = Date.now() + Math.floor(Math.random() * 1000);
      
      console.log(`[DEBUG] Creating Katty metadata for token ID: ${tokenId}`);
      
      // Return HTTP URL that will serve the metadata
      const metadataUrl = `${BACKEND_URL}/api/submissions/passport/metadata/${tokenId}`;
      
      console.log(`[DEBUG] Katty metadata URL: ${metadataUrl}`);
      
      return metadataUrl;
      
    } catch (error) {
      console.log(`[DEBUG] Error creating Katty metadata URL: ${error.message}`);
      
      // Fallback to a simple metadata URL
      const fallbackTokenId = Date.now();
      return `${BACKEND_URL}/api/submissions/passport/metadata/${fallbackTokenId}`;
    }
  }

  /**
   * Generate passport metadata object for a given token ID
   * @param tokenId The token ID to generate metadata for
   * @returns Passport metadata object
   */
  public generatePassportMetadata(tokenId: string): any {
    try {
      // Use token ID to seed randomness for consistent results
      const seed = parseInt(tokenId) || 1;
      const randomIndex = seed % 5;
      
      // 5 different Katty images
      const images = [
        "katypass-ok.jpg",
        "katypass-vlog.jpg", 
        "katypass-glass.jpg",
        "katypass-shock.jpg",
        "katypass-slept.jpg"
      ];
      
      // 5 different simple English cat-style descriptions
      const descriptions = [
        "Purr-fect access pass! 😸 This kitty grants you entry to the Planty world. Keep it safe, meow!",
        "Meow! 😺 Your special Katty passport for the Planty kingdom! Don't lose it or no more tree planting submissions!",
        "Purrr... 😻 Welcome to the tree planting family! Katty personally approves your access, nya~",
        "Miau! 🙀 You got exclusive access from Katty! Now you can submit tree planting photos freely, meow meow!",
        "Zzz... meow! 😴 Oh, someone wants Planty access? Okay okay, Katty gives permission! Guard this well~"
      ];
      
      const selectedImage = images[randomIndex];
      const selectedDescription = descriptions[randomIndex];
      const kattyStyle = selectedImage.replace('.jpg', '').replace('katypass-', '');
      
      console.log(`[DEBUG] Generated Katty metadata for token ${tokenId}: image=${selectedImage}, style=${kattyStyle}`);
      
      // Create proper NFT metadata JSON
      const metadata = {
        name: "Katty",
        description: selectedDescription,
        image: `https://jus.cat/${selectedImage}`,
        external_url: "https://planty.id",
        attributes: [
          {
            trait_type: "Type", 
            value: "Access Passport"
          },
          {
            trait_type: "Project",
            value: "Planty"
          },
          {
            trait_type: "Network",
            value: "VeChain"
          },
          {
            trait_type: "Version",
            value: "2.0"
          },
          {
            trait_type: "Katty Style",
            value: kattyStyle
          }
        ]
      };
      
      return metadata;
      
    } catch (error) {
      console.log(`[DEBUG] Error generating Katty metadata for token ${tokenId}: ${error.message}`);
      
      // Fallback to simple Katty metadata
      return {
        name: "Katty",
        description: "Purr-fect access pass! 😸 This kitty grants you entry to the Planty world. Keep it safe, meow!",
        image: "https://jus.cat/katypass-ok.jpg",
        external_url: "https://planty.id",
        attributes: [
          {
            trait_type: "Type", 
            value: "Access Passport"
          },
          {
            trait_type: "Project",
            value: "Planty"
          }
        ]
      };
    }
  }

  /**
   * Trigger a new cycle on the JusCat contract
   * @returns True if successful
   */
  public async triggerCycle(): Promise<boolean> {
    try {
      logger.info('Triggering new cycle...');
      
      return await tryWithFallbackRPC(async () => {
        const tx = await jusCatContract.transact.triggerCycle();
        const result = await tx.wait();
        
        if (result.reverted) {
          throw new Error('Transaction reverted');
        }
        
        logger.info('New cycle triggered successfully');
        return true;
      });
    } catch (error) {
      logger.error(`Error triggering cycle: ${error.message}`);
      throw new HttpException(500, `Failed to trigger cycle: ${error.message}`);
    }
  }
  
  /**
   * Set rewards amount for the next cycle
   * @param amount The amount of rewards to set
   * @returns True if successful
   */
  public async setRewardsAmount(amount: string): Promise<boolean> {
    try {
      logger.info(`Setting rewards amount to ${amount}...`);
      
      return await tryWithFallbackRPC(async () => {
        const tx = await jusCatContract.transact.setRewardsAmount(unitsUtils.parseUnits(amount, 'ether').toString());
        const result = await tx.wait();
        
        if (result.reverted) {
          throw new Error('Transaction reverted');
        }
        
        logger.info(`Rewards amount set to ${amount} successfully`);
        return true;
      });
    } catch (error) {
      logger.error(`Error setting rewards amount: ${error.message}`);
      throw new HttpException(500, `Failed to set rewards amount: ${error.message}`);
    }
  }
  
  /**
   * Withdraw rewards from a specific cycle
   * @param cycle The cycle number to withdraw from
   * @returns True if successful
   */
  public async withdrawRewards(cycle: number): Promise<boolean> {
    try {
      logger.info(`Withdrawing rewards from cycle ${cycle}...`);
      
      return await tryWithFallbackRPC(async () => {
        const tx = await jusCatContract.transact.withdrawRewards(cycle);
        const result = await tx.wait();
        
        if (result.reverted) {
          throw new Error('Transaction reverted');
        }
        
        logger.info(`Rewards withdrawn from cycle ${cycle} successfully`);
        return true;
      });
    } catch (error) {
      logger.error(`Error withdrawing rewards: ${error.message}`);
      throw new HttpException(500, `Failed to withdraw rewards: ${error.message}`);
    }
  }
  
  /**
   * Set maximum submissions per cycle
   * @param maxSubmissions The maximum number of submissions allowed per cycle
   * @returns True if successful
   */
  public async setMaxSubmissionsPerCycle(maxSubmissions: number): Promise<boolean> {
    try {
      logger.info(`Setting max submissions per cycle to ${maxSubmissions}...`);
      
      return await tryWithFallbackRPC(async () => {
        const tx = await jusCatContract.transact.setMaxSubmissionsPerCycle(maxSubmissions);
        const result = await tx.wait();
        
        if (result.reverted) {
          throw new Error('Transaction reverted');
        }
        
        logger.info(`Max submissions per cycle set to ${maxSubmissions} successfully`);
        return true;
      });
    } catch (error) {
      logger.error(`Error setting max submissions per cycle: ${error.message}`);
      throw new HttpException(500, `Failed to set max submissions per cycle: ${error.message}`);
    }
  }
  
  /**
   * Set passport requirement for submissions
   * @param required Whether passport is required
   * @returns True if successful
   */
  public async setPassportRequired(required: boolean): Promise<boolean> {
    try {
      logger.info(`Setting passport requirement to ${required}...`);
      
      return await tryWithFallbackRPC(async () => {
        const tx = await jusCatContract.transact.setPassportRequired(required);
        const result = await tx.wait();
        
        if (result.reverted) {
          throw new Error('Transaction reverted');
        }
        
        logger.info(`Passport requirement set to ${required} successfully`);
        return true;
      });
    } catch (error) {
      logger.error(`Error setting passport requirement: ${error.message}`);
      throw new HttpException(500, `Failed to set passport requirement: ${error.message}`);
    }
  }
  
  /**
   * Get contract statistics for admin dashboard
   * @returns Contract statistics object
   */
  public async getContractStats(): Promise<any> {
    try {
      logger.info('Getting contract statistics...');
      
      return await tryWithFallbackRPC(async () => {
        // Get current cycle
        const currentCycle = (await jusCatContract.read.getCurrentCycle())[0];
        
        // Get next cycle block
        const nextCycleBlock = (await jusCatContract.read.getNextCycleBlock())[0];
        
        // Get max submissions per cycle
        const maxSubmissions = (await jusCatContract.read.maxSubmissionsPerCycle())[0];
        
        // Get total submissions for current cycle
        const totalSubmissions = (await jusCatContract.read.totalSubmissions(currentCycle))[0];
        
        // Get rewards left for current cycle
        const rewardsLeft = (await jusCatContract.read.rewardsLeft(currentCycle))[0];
        
        // Get passport requirement status
        const passportRequired = (await jusCatContract.read.passportRequired())[0];
        
        // Get total passport holders count (from contract, more accurate)
        const totalPassports = await this.getTotalPassports();
        
        const stats = {
          currentCycle: Number(currentCycle),
          nextCycleBlock: Number(nextCycleBlock),
          maxSubmissions: Number(maxSubmissions),
          totalSubmissions: Number(totalSubmissions),
          rewardsLeft: unitsUtils.formatUnits(rewardsLeft.toString(), 'ether'),
          passportRequired: Boolean(passportRequired),
          totalPassports: totalPassports
        };
        
        logger.info('Contract statistics retrieved successfully');
        return stats;
      });
    } catch (error) {
      logger.error(`Error getting contract stats: ${error.message}`);
      throw new HttpException(500, `Failed to get contract stats: ${error.message}`);
    }
  }

  /**
   * Get the current block number from the blockchain
   * @returns The current block number
   */
  public async getCurrentBlockNumber(): Promise<number> {
    try {
      logger.info('Getting current block number...');
      
      return await tryWithFallbackRPC(async () => {
        // Get the best block using the proper SDK method
        const bestBlock = await thor.blocks.getBestBlockCompressed();
        
        if (!bestBlock) {
          throw new Error('Could not get current block');
        }
        
        const blockNum = bestBlock.number;
        
        logger.info(`Current block number: ${blockNum}`);
        return Number(blockNum);
      });
    } catch (error) {
      logger.error(`Error getting current block number: ${error.message}`);
      throw new HttpException(500, `Failed to get current block number: ${error.message}`);
    }
  }

  /**
   * Get total number of passports minted from the JusCatPassport contract
   * @returns Total passport count
   */
  public async getTotalPassports(): Promise<number> {
    try {
      logger.info('Getting total passport count...');
      
      // If passport contract isn't set, return 0
      if (!config.PASSPORT_ADDRESS || !jusCatPassportContract) {
        logger.warn('Passport contract not configured');
        return 0;
      }
      
      return await tryWithFallbackRPC(async () => {
        // Call totalSupply() on the passport contract
        const totalSupply = (await jusCatPassportContract.read.totalSupply())[0];
        
        logger.info(`Total passports minted: ${totalSupply}`);
        return Number(totalSupply);
      });
    } catch (error) {
      logger.error(`Error getting total passport count: ${error.message}`);
      // Don't throw an exception here, just return 0 or the cache size
      return this.passportHolders.size;
    }
  }
}
