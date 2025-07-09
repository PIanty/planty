import { ethers } from 'hardhat';
import { config } from '@repo/config-contract';

async function setCurrentCycleRewards() {
    const [deployer] = await ethers.getSigners();
    console.log(`Running with wallet ${deployer.address}...`);

    // Contract address
    const JUSCAT_ADDRESS = config.CONTRACT_ADDRESS;
    
    console.log(`Setting 40000 tokens as rewards for current cycle on JusCat at ${JUSCAT_ADDRESS}`);

    try {
        // Get JusCat contract instance
        const jusCat = await ethers.getContractAt('JusCat', JUSCAT_ADDRESS);
        
        // 1. Check current cycle
        const currentCycle = await jusCat.getCurrentCycle();
        console.log(`Current cycle: ${currentCycle}`);

        // 2. Get next cycle
        const nextCycle = await jusCat.nextCycle();
        console.log(`Next cycle: ${nextCycle}`);
        
        // 3. Set rewards amount to 5000 tokens for current cycle
        console.log('Setting rewards amount to 40000 tokens...');
        const rewardAmount = ethers.parseEther('40000'); // 5000 tokens
        const setRewardsTx = await jusCat.setRewardsAmount(rewardAmount);
        console.log('Transaction sent:', setRewardsTx.hash);
        
        const setRewardsReceipt = await setRewardsTx.wait();
        if (setRewardsReceipt && setRewardsReceipt.status === 1) {
            console.log('Successfully set rewards amount!');
            
            // 4. Check rewards for current cycle
            const rewards = await jusCat.rewards(currentCycle);
            console.log(`Rewards for current cycle (${currentCycle}): ${ethers.formatEther(rewards)} tokens`);
            
            const rewardsLeft = await jusCat.rewardsLeft(currentCycle);
            console.log(`Rewards left for current cycle (${currentCycle}): ${ethers.formatEther(rewardsLeft)} tokens`);
            
            // 5. Check rewards for next cycle
            const rewardsNext = await jusCat.rewards(nextCycle);
            console.log(`Rewards for next cycle (${nextCycle}): ${ethers.formatEther(rewardsNext)} tokens`);
            
            const rewardsLeftNext = await jusCat.rewardsLeft(nextCycle);
            console.log(`Rewards left for next cycle (${nextCycle}): ${ethers.formatEther(rewardsLeftNext)} tokens`);
        } else {
            console.log('Failed to set rewards amount');
        }

        // 6. Trigger a new cycle to ensure changes take effect
        console.log('\nTriggering new cycle to apply changes...');
        try {
            const triggerTx = await jusCat.triggerCycle();
            console.log('Trigger transaction sent:', triggerTx.hash);
            
            const triggerReceipt = await triggerTx.wait();
            if (triggerReceipt && triggerReceipt.status === 1) {
                console.log('Successfully triggered new cycle!');
                
                // Check updated cycle info
                const updatedCycle = await jusCat.getCurrentCycle();
                console.log(`Updated current cycle: ${updatedCycle}`);
                
                const updatedRewards = await jusCat.rewards(updatedCycle);
                console.log(`Rewards for updated cycle (${updatedCycle}): ${ethers.formatEther(updatedRewards)} tokens`);
                
                const updatedRewardsLeft = await jusCat.rewardsLeft(updatedCycle);
                console.log(`Rewards left for updated cycle (${updatedCycle}): ${ethers.formatEther(updatedRewardsLeft)} tokens`);
            }
        } catch (error: any) {
            console.log('Note: Failed to trigger new cycle, but rewards should be set correctly:', error.message);
        }
    } catch (error) {
        console.error('Error setting rewards:', error);
    }
}

setCurrentCycleRewards()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    }); 