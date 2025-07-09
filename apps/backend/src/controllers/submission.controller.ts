import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { OpenaiService } from '@/services/openai.service';
import { Submission } from '@/interfaces/submission.interface';
import { HttpException } from '@/exceptions/HttpException';
import { ContractsService } from '@/services/contracts.service';
import { JusbaseService } from '@/services/jusbase.service';
import { logger } from '@/utils/logger';
import { ADMIN_ADDRESS } from '@config';

// Collection of cat-themed success messages about tree planting
const successMessages = [
  "Purr-fect! 😸 This kitty approves your tree planting effort!",
  "Meow-velous! 🐱 Your eco-friendly planting makes this cat purr with joy!",
  "Paw-some planting! 😻 This cat is impressed by your green thumb!",
  "Meow! 🐱 This cat thinks your tree planting deserves extra treats!",
  "Feline good about your environmental contribution! 😸 This kitty approves!",
  "Purr-fectly planted tree! 😻 This cat is impressed by your dedication!",
  "Meow-gical! 🐱 Your tree planting makes this kitty very happy!",
  "Paw-sitively delightful planting! 😸 This cat is giving you a high-five!",
  "Cat-tastic! 😻 Your tree planting habits are making a difference!",
  "Meow-nificent! 🐱 This kitty loves your eco-friendly efforts!",
  "Whisker-lickin' good! 🐾 This cat is thrilled with your green initiative!",
  "Tree-mendous! 😸 This kitty is doing a happy dance for your planting!",
  "Meow-wow! 🐱 Your tree planting is the cat's pajamas!",
  "Fur-real amazing! 😻 This cat is purring extra loud for your environmental work!",
  "Claw-some! 🐾 Your planting habits are the cat's whiskers!",
  "Meow-mentous! 😸 This kitty is proud of your tree planting skills!",
  "Purr-haps the best planting ever! 🐱 This cat is impressed!",
  "Tabby-tastic! 😻 Your eco-friendly planting makes this cat smile!",
  "Meow-gnificent! 🐾 This kitty is delighted by your green efforts!",
  "Fur-tunate planet! 😸 This cat is happy with your tree planting!",
  "Purr-oud of you! 🐱 This kitty thinks your planting skills are top notch!",
  "Meow-mazing! 😻 Your tree planting is a treat for this cat!",
  "Paw-lease keep up the good work! 🐾 This cat loves your green choices!",
  "Feline fantastic! 😸 Your eco-friendly planting is a hit with this kitty!",
  "Meow-ment of glory! 🐱 This cat is celebrating your environmental contribution!"
];

// Collection of cat-themed error messages for invalid submissions
const errorMessages = [
  "Meow? 🙀 This kitty can't find a tree planting here!",
  "Purr-plexing! 😿 This cat needs to see a proper tree planting!",
  "Hiss! 🙀 This doesn't look like tree planting to this picky cat!",
  "Meow-ch! 😾 This cat was expecting a clear view of tree planting!",
  "Fur-get it! 🙀 This kitty can't approve without seeing proper tree planting!",
  "Cat-astrophe! 😿 Where's the tree? This kitty is confused!",
  "Paw-sitively not tree planting! 🙀 This cat needs to see proof of your green effort!",
  "Meow-stake! 😾 This doesn't look like valid tree planting to this cat!",
  "Hiss-appointment! 🙀 This cat was hoping for a clear tree planting photo!"
];

// Get a random message
const getRandomSuccessMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * successMessages.length);
  return successMessages[randomIndex];
};

const getRandomErrorMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * errorMessages.length);
  return errorMessages[randomIndex];
};

export class SubmissionController {
  public openai = Container.get(OpenaiService);
  public contracts = Container.get(ContractsService);
  public jusbase = Container.get(JusbaseService);

  public submitReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body: Omit<Submission, 'timestamp'> = req.body;

      const submissionRequest: Submission = {
        ...body,
        timestamp: Date.now(),
      };
      
      // Check for duplicate images first
      try {
        const isDuplicate = await this.jusbase.isImageHashDuplicate(body.imageHash);
        if (isDuplicate) {
          logger.warn(`Duplicate image detected from ${body.address.substring(0, 10)}... with hash ${body.imageHash.substring(0, 20)}...`);
          res.status(409).json({
            error: true,
            errorType: 'duplicate_image',
            catMessage: "Meow-nope! 😼 This kitty has seen this image before! Please submit a different one."
          });
          return;
        }
      } catch (error) {
        logger.error(`Error checking duplicate image: ${error.message}`);
        // Continue processing if duplicate check fails
      }
      
      // Submission validation with smart contract
      await this.contracts.validateSubmission(submissionRequest);

      const validationResult = await this.openai.validateImage(body.image);

      if (validationResult == undefined || !('validityFactor' in (validationResult as object))) {
        throw new HttpException(500, 'Meow? 😾 The cat couldn\'t figure out what\'s in this image!');
      }

      const validityFactor = validationResult['validityFactor'];
      let reward = 0;

      if (validityFactor > 0.5) {
        try {
          // registerSubmission will throw error if it fails, no need to check boolean return
          await this.contracts.registerSubmission(submissionRequest);
          // Assume reward value from contract service (could be made more explicit)
          reward = 3; // Default reward amount sesuai dengan yang ditampilkan di frontend
        } catch (error) {
          next(error);
          return;
        }
      }

      // Store image and submission history
      try {
        logger.info(`Processing submission for address: ${body.address.substring(0, 10)}...`);
        
        // Upload image to Supabase storage
        const imageUrl = await this.jusbase.uploadImage(body.image, body.address);
        logger.info(`Image uploaded with URL: ${imageUrl.substring(0, 30)}...`);
        
        // Store submission history
        await this.jusbase.storeSubmissionHistory(
          body.address,
          imageUrl,
          body.imageHash,
          reward,
          validityFactor
        );
        
        logger.info(`Submission history stored successfully`);
      } catch (error) {
        // Check if it's a duplicate error after we already did validation
        if (error.message && error.message.includes('Duplicate image hash detected')) {
          res.status(409).json({
            error: true,
            errorType: 'duplicate_image',
            catMessage: "Meow-nope! 😼 This kitty has seen this image before! Please submit a different one."
          });
          return;
        }
        
        // Log the error but continue - don't block the user experience
        logger.error(`Failed to store submission: ${error.message}`);
      }

      res.status(200).json({ 
        validation: validationResult,
        catMessage: validityFactor > 0.5 
          ? getRandomSuccessMessage()
          : getRandomErrorMessage()
      });
    } catch (error) {
      next(error);
      return;
    }
  };

  public getSubmissionHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { address } = req.params;
      
      if (!address) {
        throw new HttpException(400, 'Meow? 🙀 This kitty needs a wallet address!');
      }

      logger.info(`Getting submission history for: ${address.substring(0, 10)}...`);
      
      const history = await this.jusbase.getSubmissionHistory(address);
      
      logger.info(`Retrieved ${history?.length || 0} history items for ${address.substring(0, 10)}...`);
      
      res.status(200).json({ history });
    } catch (error) {
      logger.error(`Error getting submission history: ${error.message}`);
      next(error);
      return;
    }
  };

  public checkPassportStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { address } = req.params;
      
      if (!address) {
        throw new HttpException(400, 'Meow? 🙀 This kitty needs a wallet address to check passport!');
      }

      logger.info(`Checking passport status for: ${address.substring(0, 10)}...`);
      
      const passportStatus = await this.contracts.checkPassport(address);
      
      // Add cat-themed messages
      const catMessage = passportStatus.hasPassport
        ? "Purr-fect! 😸 Your Katty passport is valid and this kitty recognizes you!"
        : "Meow? 😿 This kitty doesn't recognize you! You need a Katty passport to submit tree planting photos.";
      
      res.status(200).json({ 
        ...passportStatus, 
        catMessage 
      });
    } catch (error) {
      logger.error(`Error checking passport status: ${error.message}`);
      next(error);
      return;
    }
  };

  // Admin endpoint to mint passport for a user
  public mintPassport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { adminAddress, userAddress } = req.body;
      
      // Validate inputs
      if (!adminAddress || !userAddress) {
        throw new HttpException(400, 'Meow? 🙀 This kitty needs both admin and user addresses!');
      }

      // Validate the request is from an admin
      if (adminAddress.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
        throw new HttpException(403, 'Hiss! 😾 Only the head kitty can mint passports!');
      }

      logger.info(`Admin ${adminAddress.substring(0, 10)}... minting passport for: ${userAddress.substring(0, 10)}...`);
      
      // Call contract service to mint passport
      const result = await this.contracts.mintPassport(userAddress);
      
      if (result) {
        res.status(200).json({ 
          success: true, 
          message: `Katty passport successfully minted for ${userAddress}`,
          catMessage: `Meow-velous! 😸 This kitty has granted a shiny new Katty passport to ${userAddress.substring(0, 6)}...!`
        });
      } else {
        throw new HttpException(500, 'Meow-ch! 😿 The Katty passport minting machine is broken!');
      }
    } catch (error) {
      logger.error(`Error minting passport: ${error.message}`);
      next(error);
      return;
    }
  };

  public getPassportMetadata = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tokenId } = req.params;
      
      if (!tokenId) {
        throw new HttpException(400, 'Token ID is required');
      }

      logger.info(`Serving passport metadata for token ID: ${tokenId}`);
      
      const metadata = this.contracts.generatePassportMetadata(tokenId);
      
      res.status(200).json(metadata);
    } catch (error) {
      logger.error(`Error serving passport metadata: ${error.message}`);
      next(error);
      return;
    }
  };

  // Admin endpoint to trigger a new cycle
  public triggerCycle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { adminAddress } = req.body;
      
      if (!adminAddress) {
        throw new HttpException(400, 'Meow? 🙀 This kitty needs an admin address!');
      }

      // Validate the request is from an admin
      if (adminAddress.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
        throw new HttpException(403, 'Hiss! 😾 Only the head kitty can trigger new cycles!');
      }

      logger.info(`Admin ${adminAddress.substring(0, 10)}... triggering new cycle...`);
      
      const result = await this.contracts.triggerCycle();
      
      if (result) {
        res.status(200).json({ 
          success: true, 
          catMessage: "Meow-velous! 😸 A fresh new cycle has begun! Time for more tree planting submissions!"
        });
      } else {
        throw new HttpException(500, 'Meow-ch! 😿 The cycle trigger machine is broken!');
      }
    } catch (error) {
      logger.error(`Error triggering cycle: ${error.message}`);
      next(error);
      return;
    }
  };

  // Admin endpoint to set rewards for next cycle
  public setRewards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { adminAddress, amount } = req.body;
      
      if (!adminAddress || !amount) {
        throw new HttpException(400, 'Meow? 🙀 This kitty needs admin address and reward amount!');
      }

      // Validate the request is from an admin
      if (adminAddress.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
        throw new HttpException(403, 'Hiss! 😾 Only the head kitty can set rewards!');
      }

      logger.info(`Admin ${adminAddress.substring(0, 10)}... setting rewards to ${amount}...`);
      
      const result = await this.contracts.setRewardsAmount(amount);
      
      if (result) {
        res.status(200).json({ 
          success: true, 
          catMessage: `Purr-fect! 😸 ${amount} tokens have been allocated for the next cycle! Kitties will be well rewarded!`
        });
      } else {
        throw new HttpException(500, 'Meow-ch! 😿 The reward setting machine is broken!');
      }
    } catch (error) {
      logger.error(`Error setting rewards: ${error.message}`);
      next(error);
      return;
    }
  };

  // Admin endpoint to withdraw rewards from a specific cycle
  public withdrawRewards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { adminAddress, cycle } = req.body;
      
      if (!adminAddress || !cycle) {
        throw new HttpException(400, 'Meow? 🙀 This kitty needs admin address and cycle number!');
      }

      // Validate the request is from an admin
      if (adminAddress.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
        throw new HttpException(403, 'Hiss! 😾 Only the head kitty can withdraw rewards!');
      }

      logger.info(`Admin ${adminAddress.substring(0, 10)}... withdrawing rewards from cycle ${cycle}...`);
      
      const result = await this.contracts.withdrawRewards(cycle);
      
      if (result) {
        res.status(200).json({ 
          success: true, 
          catMessage: `Meow-ney retrieved! 😸 Remaining rewards from cycle ${cycle} have been withdrawn successfully!`
        });
      } else {
        throw new HttpException(500, 'Meow-ch! 😿 The withdrawal machine is broken!');
      }
    } catch (error) {
      logger.error(`Error withdrawing rewards: ${error.message}`);
      next(error);
      return;
    }
  };

  // Admin endpoint to set maximum submissions per cycle
  public setMaxSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { adminAddress, maxSubmissions } = req.body;
      
      if (!adminAddress || !maxSubmissions) {
        throw new HttpException(400, 'Meow? 🙀 This kitty needs admin address and max submissions!');
      }

      // Validate the request is from an admin
      if (adminAddress.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
        throw new HttpException(403, 'Hiss! 😾 Only the head kitty can set submission limits!');
      }

      logger.info(`Admin ${adminAddress.substring(0, 10)}... setting max submissions to ${maxSubmissions}...`);
      
      const result = await this.contracts.setMaxSubmissionsPerCycle(maxSubmissions);
      
      if (result) {
        res.status(200).json({ 
          success: true, 
          catMessage: `Paw-some! 😸 Kitties can now submit up to ${maxSubmissions} times per cycle!`
        });
      } else {
        throw new HttpException(500, 'Meow-ch! 😿 The submission limit machine is broken!');
      }
    } catch (error) {
      logger.error(`Error setting max submissions: ${error.message}`);
      next(error);
      return;
    }
  };

  // Admin endpoint to set passport requirement
  public setPassportRequired = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { adminAddress, required } = req.body;
      
      if (!adminAddress || typeof required !== 'boolean') {
        throw new HttpException(400, 'Meow? 🙀 This kitty needs admin address and passport requirement (true/false)!');
      }

      // Validate the request is from an admin
      if (adminAddress.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
        throw new HttpException(403, 'Hiss! 😾 Only the head kitty can change passport requirements!');
      }

      logger.info(`Admin ${adminAddress.substring(0, 10)}... setting passport required to ${required}...`);
      
      const result = await this.contracts.setPassportRequired(required);
      
      if (result) {
        res.status(200).json({ 
          success: true, 
          catMessage: required 
            ? "Meow! 😸 Passport is now required! Only Katty holders can submit receipts!" 
            : "Purr-fect! 😸 Passport is now optional! All kitties can submit freely!"
        });
      } else {
        throw new HttpException(500, 'Meow-ch! 😿 The passport requirement machine is broken!');
      }
    } catch (error) {
      logger.error(`Error setting passport requirement: ${error.message}`);
      next(error);
      return;
    }
  };

  // Admin endpoint to get contract statistics
  public getContractStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('Getting contract statistics...');
      
      const stats = await this.contracts.getContractStats();
      
      res.status(200).json(stats);
    } catch (error) {
      logger.error(`Error getting contract stats: ${error.message}`);
      next(error);
      return;
    }
  };

  // Get current block number
  public getCurrentBlock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('Getting current block number...');
      
      const blockNum = await this.contracts.getCurrentBlockNumber();
      
      res.status(200).json({ blockNum });
    } catch (error) {
      logger.error(`Error getting current block number: ${error.message}`);
      next(error);
      return;
    }
  };

  // Get total passport count
  public getTotalPassports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('Getting total passport count...');
      
      const totalPassports = await this.contracts.getTotalPassports();
      
      res.status(200).json({ 
        totalPassports,
        catMessage: `Meow! 😸 This kitty has issued ${totalPassports} Katty passports so far!`
      });
    } catch (error) {
      logger.error(`Error getting total passport count: ${error.message}`);
      next(error);
      return;
    }
  };
}
