import { JusCat, B3TR_Mock, X2EarnRewardsPoolMock } from '../../typechain-types';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

export const receiveAllocations = async (
    mugshot: JusCat,
    token: B3TR_Mock,
    account: SignerWithAddress,
    admin: SignerWithAddress,
    amount: string,
    x2EarnRewardsPool: X2EarnRewardsPoolMock,
    appId: string,
) => {
    await token.connect(account).mint(admin, ethers.parseEther(amount));

    await token.connect(admin).approve(await x2EarnRewardsPool.getAddress(), ethers.parseEther(amount));
    await x2EarnRewardsPool.connect(admin).deposit(ethers.parseEther(amount), appId);

    await mugshot.connect(admin).setRewardsAmount(ethers.parseEther(amount));
};
