import { ethers } from 'hardhat';
import { config } from '@repo/config-contract';

async function grantAdminRole() {
    const [deployer] = await ethers.getSigners();
    console.log(`Running with wallet ${deployer.address}...`);

    // Alamat backend (ganti dengan alamat backend sebenarnya)
    const BACKEND_ADDRESS = process.env.BACKEND_ADDRESS || "0x43b9A364a593316facCEB21bc905E2D877F5bC7c";
    
    // Alamat kontrak JusCat
    const JUSCAT_ADDRESS = config.CONTRACT_ADDRESS;
    
    console.log(`Granting admin role to backend address ${BACKEND_ADDRESS} on JusCat contract at ${JUSCAT_ADDRESS}`);

    try {
        // Interaksi dengan kontrak JusCat
        const jusCat = await ethers.getContractAt('JusCat', JUSCAT_ADDRESS);
        
        // Mendapatkan DEFAULT_ADMIN_ROLE
        const adminRole = await jusCat.DEFAULT_ADMIN_ROLE();
        console.log(`DEFAULT_ADMIN_ROLE: ${adminRole}`);
        
        // Cek apakah alamat backend sudah memiliki admin role
        const hasAdminRole = await jusCat.hasRole(adminRole, BACKEND_ADDRESS);
        console.log(`Backend address (${BACKEND_ADDRESS}) has admin role: ${hasAdminRole}`);
        
        if (!hasAdminRole) {
            // Berikan admin role ke alamat backend
            console.log(`Granting admin role to ${BACKEND_ADDRESS}...`);
            const grantRoleTx = await jusCat.grantRole(adminRole, BACKEND_ADDRESS);
            console.log('Transaction sent:', grantRoleTx.hash);
            
            const receipt = await grantRoleTx.wait();
            if (receipt && receipt.status === 1) {
                console.log(`Successfully granted admin role to ${BACKEND_ADDRESS}!`);
                
                // Verifikasi bahwa alamat backend sekarang memiliki admin role
                const hasRoleNow = await jusCat.hasRole(adminRole, BACKEND_ADDRESS);
                console.log(`Backend address (${BACKEND_ADDRESS}) now has admin role: ${hasRoleNow}`);
            } else {
                console.log('Failed to grant admin role');
            }
        } else {
            console.log(`Backend address (${BACKEND_ADDRESS}) already has admin role, no action needed.`);
        }
    } catch (error) {
        console.error('Error granting admin role:', error);
    }
}

grantAdminRole()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    }); 