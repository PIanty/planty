import { ethers } from 'hardhat';
import { config } from '@repo/config-contract';

async function triggerNewCycle() {
    const [deployer] = await ethers.getSigners();
    console.log(`Running with wallet ${deployer.address}...`);

    // Alamat kontrak JusCat
    const JUSCAT_ADDRESS = config.CONTRACT_ADDRESS;
    
    console.log(`Triggering new cycle for JusCat at ${JUSCAT_ADDRESS}`);

    try {
        // Interaksi dengan kontrak JusCat
        const jusCat = await ethers.getContractAt('JusCat', JUSCAT_ADDRESS);
        
        // 1. Cek cycle saat ini
        const currentCycleBefore = await jusCat.getCurrentCycle();
        console.log(`Current cycle before trigger: ${currentCycleBefore}`);
        
        // 2. Trigger cycle baru
        console.log('Triggering new cycle...');
        const tx = await jusCat.triggerCycle();
        console.log('Transaction sent:', tx.hash);
        
        const receipt = await tx.wait();
        if (receipt && receipt.status === 1) {
            console.log('Successfully triggered new cycle!');
            
            // 3. Cek cycle setelah trigger
            const currentCycleAfter = await jusCat.getCurrentCycle();
            console.log(`Current cycle after trigger: ${currentCycleAfter}`);
            
            // 4. Cek rewards untuk cycle saat ini (yang baru)
            const rewards = await jusCat.rewards(currentCycleAfter);
            console.log(`Rewards for current cycle (${currentCycleAfter}): ${ethers.formatEther(rewards)} tokens`);
            
            // 5. Cek rewards yang tersisa untuk cycle saat ini (yang baru)
            const rewardsLeft = await jusCat.rewardsLeft(currentCycleAfter);
            console.log(`Rewards left for current cycle (${currentCycleAfter}): ${ethers.formatEther(rewardsLeft)} tokens`);
            
            // 6. Cek next cycle block
            const nextCycleBlock = await jusCat.getNextCycleBlock();
            console.log(`Next cycle block: ${nextCycleBlock}`);
        } else {
            console.log('Failed to trigger new cycle');
        }
    } catch (error) {
        console.error('Error triggering new cycle:', error);
    }
}

triggerNewCycle()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    }); 