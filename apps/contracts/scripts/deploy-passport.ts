import { ethers, network } from 'hardhat';
import { updateConfig, config } from '@repo/config-contract';
import { getABI } from '../utils/abi';

async function main() {
  console.log('🚀 Deploying Katty Passport Contract...');
  
  const deployer = (await ethers.getSigners())[0];
  console.log(`Deploying on ${network.name} with wallet ${deployer.address}...`);
  
  // Deploy the JusCatPassport contract
  const passportContractFactory = await ethers.getContractFactory('JusCatPassport');
  const passportContract = await passportContractFactory.deploy();
  await passportContract.waitForDeployment();
  
  const passportAddress = await passportContract.getAddress();
  console.log(`📋 Katty Passport contract deployed at: ${passportAddress}`);
  
  // Get the ABIs for config update
  const jusCatAbi = await getABI('JusCat');
  const passportAbi = await getABI('JusCatPassport');
  
  // Update config with the new passport address
  updateConfig({
    ...config,
    PASSPORT_ADDRESS: passportAddress
  }, jusCatAbi, passportAbi);
  
  console.log('✅ Config updated with new Katty Passport address');
  console.log(`🏠 Contract Address: ${passportAddress}`);
  console.log('🎉 Deployment complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }); 