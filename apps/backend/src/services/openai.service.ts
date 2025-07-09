import { HttpException } from '@/exceptions/HttpException';
import { openAIHelper } from '@/server';
import { isBase64Image } from '@/utils/data';
import { Service } from 'typedi';

@Service()
export class OpenaiService {
  public async validateImage(image: string): Promise<unknown> {
    if (!isBase64Image(image)) throw new HttpException(400, 'Invalid image format');

    const prompt = `
    Analyze the image provided. The image MUST satisfy ALL of the following strict criteria:
    
    PLANTY VERIFICATION CRITERIA
    
    SUBMISSION OBJECTIVE  
    Submit a clear and authentic photo from your own point of view (POV), showing you watering a newly planted tree. This image is required to verify real-life environmental action and to qualify for Planty rewards.
    
    MUST-HAVE CHECKLIST (ALL REQUIRED):
    
    1. FOCUS ON ONE TREE  
    - The tree must be newly planted and growing in soil.  
    - Potted plants are not allowed (unless part of official reforestation).  
    - No grass, bushes, decorative, or wild plants.
    
    2. SHOW FLOWING WATER  
    - Water must be clearly visible as it flows onto the base of the tree.  
    - A still image of water without visible motion will be rejected.
    
    3. POV WITH YOUR HAND VISIBLE  
    - The photo must be from your perspective.  
    - Your hand or watering tool must be visible in action.  
    - No other people should appear in the frame. If multiple people are watering, the submission will be rejected.
    
    4. GOOD LIGHTING ONLY  
    - The photo must be taken during daylight with natural lighting.  
    - No dark, blurry, grainy, or nighttime images.
    
    5. TREE MUST BE CLEAR & BIG ENOUGH  
    - The tree must be large enough to show its trunk, leaves, and structure.  
    - No tiny seedlings or small plants.  
    - The tree must be fully visible — not cropped or zoomed in.
    
    6. REAL ENVIRONMENT  
    - The tree must be in natural soil.  
    - The ground must be clearly visible in the image.
    
    7. NO FILTERS OR AI  
    - No digital effects, filters, or AI-generated content.  
    - The image must be a real, unedited photo of a recent activity.
    - The image must be taken in the day time.
    - No stock image, if the images looks like a stock image, it will be rejected.
    
    INSTANT DISQUALIFICATION:
    
    - Grass, bushes, decorative, or wild plants.  
    - Multiple people watering at once.  
    - Nighttime, blurry, or unclear images.  
    - Tree too small or not fully visible.  
    - Cropped or zoomed-in photos with no clear water flow.  
    - AI-generated or digitally manipulated visuals.
    
    TIPS FOR BEST SHOT  
    Stand above the newly planted tree. Hold your watering container. Capture the moment when water flows out, with the tree centered in bright daylight. Simple. Natural. Real.
    
    Only clear, rule-compliant submissions will be rewarded. Stay real 🌱
    
    You must respond only with the following JSON object, as if you are a REST API endpoint:
    
    {
      "validityFactor": {validityFactorNumber}, // 0–1 scale, where 1 means fully valid and 0 means totally invalid.
      "descriptionOfAnalysis": "{analysis}" // Write your analysis in a playful, cat-themed style — like a cat is judging the image. Use phrases like “This kitty sees...” or “Meow! I notice...” Make it fun, cute, and informative. If the image is invalid, explain why in a slightly disappointed but adorable cat tone.
    }
    `;
    

    
    const gptResponse = await openAIHelper.askChatGPTAboutImage({
      base64Image: image,
      prompt,
    });

    const responseJSONStr = openAIHelper.getResponseJSONString(gptResponse);

    return openAIHelper.parseChatGPTJSONString(responseJSONStr);
  }
}
