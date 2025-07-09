import { ethers } from 'hardhat';
import { config } from '@repo/config-contract';

async function setAsDistributor() {
    const [deployer] = await ethers.getSigners();
    console.log(`Running with wallet ${deployer.address}...`);

    // Alamat kontrak JusCat yang baru di-deploy
    const JUSCAT_ADDRESS = '0x6c10b95d04de398303e179bbdccdb51f1f36f09e';
    
    // APP_ID dari konfigurasi
    const APP_ID = config.APP_ID;

    // Alamat kontrak X2EarnApps
    const X2EARN_APPS_ADDRESS = config.X2EARN_APPS;

    console.log(`Setting JusCat contract (${JUSCAT_ADDRESS}) as reward distributor for APP_ID: ${APP_ID}`);
    console.log(`Using X2EarnApps contract at: ${X2EARN_APPS_ADDRESS}`);

    // Interaksi dengan kontrak X2EarnApps untuk mengatur JusCat sebagai distributor
    try {
        const x2EarnApps = await ethers.getContractAt('X2EarnAppsMock', X2EARN_APPS_ADDRESS);
        
        // Panggil fungsi addRewardDistributor
        console.log('Calling addRewardDistributor...');
        const tx = await x2EarnApps.addRewardDistributor(APP_ID, JUSCAT_ADDRESS);
        console.log('Transaction sent:', tx.hash);
        
        console.log('Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        
        if (receipt && receipt.status === 1) {
            console.log('Successfully set JusCat as reward distributor!');
        } else {
            console.log('Transaction failed');
        }
    } catch (error) {
        console.error('Error setting JusCat as reward distributor:', error);
    }
}

setAsDistributor()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    }); 