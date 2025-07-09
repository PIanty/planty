import { ethers } from 'hardhat';
import { config } from '@repo/config-contract';

async function checkFundsAndTriggerCycle() {
    const [deployer] = await ethers.getSigners();
    console.log(`Running with wallet ${deployer.address}...`);

    // Alamat kontrak JusCat yang di-deploy
    const JUSCAT_ADDRESS = config.CONTRACT_ADDRESS;
    const APP_ID = config.APP_ID;
    const X2EARN_REWARDS_POOL = config.X2EARN_REWARDS_POOL;
    
    console.log(`Checking available funds and triggering cycle for JusCat at ${JUSCAT_ADDRESS}`);

    try {
        // Interaksi dengan kontrak JusCat
        const jusCat = await ethers.getContractAt('JusCat', JUSCAT_ADDRESS);
        
        // Interaksi dengan kontrak X2EarnRewardsPool
        const x2EarnRewardsPool = await ethers.getContractAt('IX2EarnRewardsPool', X2EARN_REWARDS_POOL);
        
        try {
            // Cek available funds pada rewards pool
            console.log(`Checking available funds for APP_ID: ${APP_ID}`);
            const availableFunds = await x2EarnRewardsPool.availableFunds(APP_ID);
            console.log(`Available funds: ${ethers.formatEther(availableFunds)} tokens`);
            
            if (availableFunds <= 0) {
                console.log('No funds available in rewards pool. Need to deposit funds first.');
            }
        } catch (error) {
            console.error('Error checking available funds:', error);
        }
        
        // Coba trigger cycle tanpa set rewards amount
        console.log('Triggering cycle without setting rewards amount...');
        try {
            const triggerCycleTx = await jusCat.triggerCycle();
            console.log('Transaction sent:', triggerCycleTx.hash);
            
            const receipt = await triggerCycleTx.wait();
            if (receipt && receipt.status === 1) {
                console.log('Successfully triggered cycle!');
                
                // Get current cycle
                const currentCycle = await jusCat.getCurrentCycle();
                console.log(`Current cycle: ${currentCycle}`);
                
                // Get next cycle block
                const nextCycleBlock = await jusCat.getNextCycleBlock();
                console.log(`Next cycle block: ${nextCycleBlock}`);
            } else {
                console.log('Failed to trigger cycle');
            }
        } catch (error) {
            console.error('Error triggering cycle:', error);
        }
        
    } catch (error) {
        console.error('Error in script:', error);
    }
}

checkFundsAndTriggerCycle()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    }); 