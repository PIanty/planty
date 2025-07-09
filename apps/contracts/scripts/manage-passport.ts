import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';
import { getABI } from '../utils/abi';

// Default URI untuk passport
const DEFAULT_URI = 'ipfs://QmYgUomRnqoTvbQCzpxtmgUEY8r5rLdUGZkxoyzsVmVMYy';

async function mintPassport(addressTo: string, uri: string = DEFAULT_URI) {
    const [deployer] = await ethers.getSigners();
    console.log(`Running with wallet ${deployer.address}...`);

    const PASSPORT_ADDRESS = config.PASSPORT_ADDRESS;

    if (!PASSPORT_ADDRESS) {
        console.error('JusCatPassport address not found in config! Please deploy passport first.');
        return;
    }

    console.log(`Minting passport to ${addressTo} on ${network.name}...`);
    
    // Connect to JusCatPassport contract
    const passportAbi = await getABI('JusCatPassport');
    const passportContract = new ethers.Contract(PASSPORT_ADDRESS, passportAbi, deployer);

    try {
        // Check if address already has passport
        const hasPassport = await passportContract.hasPassport(addressTo);
        if (hasPassport) {
            console.log(`Address ${addressTo} already has a passport.`);
            return;
        }

        // Mint passport
        console.log(`Minting passport to ${addressTo} with URI: ${uri}`);
        const tx = await passportContract.mintPassport(addressTo, uri);
        await tx.wait();
        console.log(`Successfully minted passport to ${addressTo}!`);

        // Verify
        const hasPassportNow = await passportContract.hasPassport(addressTo);
        console.log(`Address ${addressTo} now has passport: ${hasPassportNow}`);
        
    } catch (error) {
        console.error('Error minting passport:', error);
    }
}

async function enablePassportRequirement(enable: boolean) {
    const [deployer] = await ethers.getSigners();
    console.log(`Running with wallet ${deployer.address}...`);

    const JUSCAT_ADDRESS = config.CONTRACT_ADDRESS;
    const PASSPORT_ADDRESS = config.PASSPORT_ADDRESS;

    if (!JUSCAT_ADDRESS) {
        console.error('JusCat contract address not found in config!');
        return;
    }

    if (!PASSPORT_ADDRESS) {
        console.error('JusCatPassport address not found in config! Please deploy passport first.');
        return;
    }

    console.log(`${enable ? 'Enabling' : 'Disabling'} passport requirement on JusCat...`);
    
    // Connect to JusCat contract
    const jusCatAbi = await getABI('JusCat');
    const jusCatContract = new ethers.Contract(JUSCAT_ADDRESS, jusCatAbi, deployer);

    try {
        // Check current status
        const currentStatus = await jusCatContract.passportRequired();
        console.log(`Current passport requirement status: ${currentStatus}`);
        
        if (currentStatus === enable) {
            console.log(`Passport requirement is already ${enable ? 'enabled' : 'disabled'}.`);
            return;
        }

        // Set passport requirement
        console.log(`Setting passport requirement to: ${enable}`);
        const tx = await jusCatContract.setPassportRequired(enable);
        await tx.wait();
        console.log(`Successfully ${enable ? 'enabled' : 'disabled'} passport requirement!`);
        
    } catch (error) {
        console.error('Error updating passport requirement:', error);
    }
}

async function checkPassportStatus(address: string) {
    const [deployer] = await ethers.getSigners();
    console.log(`Running with wallet ${deployer.address}...`);

    const PASSPORT_ADDRESS = config.PASSPORT_ADDRESS;
    const JUSCAT_ADDRESS = config.CONTRACT_ADDRESS;

    if (!PASSPORT_ADDRESS || !JUSCAT_ADDRESS) {
        console.error('Contract addresses not found in config!');
        return;
    }

    console.log(`Checking passport status for address: ${address}`);
    
    // Connect to passport contract
    const passportAbi = await getABI('JusCatPassport');
    const passportContract = new ethers.Contract(PASSPORT_ADDRESS, passportAbi, deployer);
    
    // Connect to JusCat contract
    const jusCatAbi = await getABI('JusCat');
    const jusCatContract = new ethers.Contract(JUSCAT_ADDRESS, jusCatAbi, deployer);

    try {
        // Check if address has passport
        const hasPassport = await passportContract.hasPassport(address);
        console.log(`Address ${address} has passport: ${hasPassport}`);
        
        // Check if passport is required
        const passportRequired = await jusCatContract.passportRequired();
        console.log(`Passport requirement is: ${passportRequired ? 'enabled' : 'disabled'}`);
        
        // Check if user can submit based on passport status
        const canSubmit = !passportRequired || hasPassport;
        console.log(`Address ${address} can submit: ${canSubmit}`);
        
        // Check submissions count for current cycle
        const currentCycle = await jusCatContract.getCurrentCycle();
        const submissionsCount = await jusCatContract.submissions(currentCycle, address);
        console.log(`Submissions count for cycle ${currentCycle}: ${submissionsCount}`);
        
    } catch (error) {
        console.error('Error checking passport status:', error);
    }
}

// Main function that parses command line arguments
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (!command) {
        console.log(`
Usage:
  npx hardhat run scripts/manage-passport.ts -- mint <address> [uri]
  npx hardhat run scripts/manage-passport.ts -- enable
  npx hardhat run scripts/manage-passport.ts -- disable
  npx hardhat run scripts/manage-passport.ts -- check <address>
        `);
        return;
    }
    
    switch (command) {
        case 'mint':
            const addressToMint = args[1];
            const uri = args[2] || DEFAULT_URI;
            if (!addressToMint) {
                console.error('Address is required for mint command');
                return;
            }
            await mintPassport(addressToMint, uri);
            break;
            
        case 'enable':
            await enablePassportRequirement(true);
            break;
            
        case 'disable':
            await enablePassportRequirement(false);
            break;
            
        case 'check':
            const addressToCheck = args[1];
            if (!addressToCheck) {
                console.error('Address is required for check command');
                return;
            }
            await checkPassportStatus(addressToCheck);
            break;
            
        default:
            console.error(`Unknown command: ${command}`);
            break;
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
} 