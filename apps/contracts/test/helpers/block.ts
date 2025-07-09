import { ethers } from 'hardhat';
import { JusCat } from '../../typechain-types';

export const advanceBlock = async () => {
    await ethers.provider.send('evm_mine', []);
};

export const advanceTimeAndBlock = async (time: number) => {
    await advanceTime(time);
    await advanceBlock();
};

export const advanceTime = async (time: number) => {
    await ethers.provider.send('evm_increaseTime', [time]);
};

export const advanceBlockTo = async (blockNumber: number) => {
    for (let i = (await ethers.provider.getBlockNumber()) + 1; i <= blockNumber; i++) {
        await advanceBlock();
    }
};

export const waitForNextCycle = async (mugshot: JusCat) => {
    await advanceBlockTo(Number(await mugshot.getNextCycleBlock()));
};
