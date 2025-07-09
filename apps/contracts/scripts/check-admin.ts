import { ethers } from 'hardhat';
import { config } from '@repo/config-contract';

async function checkAdmin() {
    const [deployer] = await ethers.getSigners();
    console.log(`Running with wallet ${deployer.address}...`);

    // Alamat kontrak JusCat yang di-deploy
    const JUSCAT_ADDRESS = config.CONTRACT_ADDRESS;
    
    console.log(`Checking admin role for JusCat contract at ${JUSCAT_ADDRESS}`);

    try {
        // Interaksi dengan kontrak JusCat
        const jusCat = await ethers.getContractAt('JusCat', JUSCAT_ADDRESS);
        
        // Mendapatkan DEFAULT_ADMIN_ROLE
        const adminRole = await jusCat.DEFAULT_ADMIN_ROLE();
        console.log(`DEFAULT_ADMIN_ROLE: ${adminRole}`);
        
        // Memeriksa apakah deployer memiliki role admin
        const hasAdminRole = await jusCat.hasRole(adminRole, deployer.address);
        console.log(`Deployer (${deployer.address}) has admin role: ${hasAdminRole}`);
        
        // Memeriksa akun yang memiliki role admin (admin pertama)
        console.log(`Checking admin status for current contract`);
        
        // Cek available funds pada rewards pool
        try {
            const appId = config.APP_ID;
            console.log(`APP_ID: ${appId}`);
            
            const availableFunds = await jusCat.x2EarnRewardsPoolContract();
            console.log(`X2EarnRewardsPool contract address: ${availableFunds}`);
            
            // Dapatkan alamat x2EarnRewardsPoolContract dari kontrak
            const rewardsPoolAddress = await jusCat.x2EarnRewardsPoolContract();
            console.log(`X2EarnRewardsPoolContract address: ${rewardsPoolAddress}`);
            
            // Bandingkan dengan alamat di konfigurasi
            console.log(`X2EarnRewardsPool address in config: ${config.X2EARN_REWARDS_POOL}`);
            
        } catch (error) {
            console.error('Error checking rewards pool:', error);
        }
        
    } catch (error) {
        console.error('Error checking admin:', error);
    }
}

checkAdmin()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    }); 