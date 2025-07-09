import { MAX_SUBMISSIONS_PER_CYCLE, getAndDeployContracts, receiveAllocations, waitForNextCycle } from './helpers';
import { describe } from 'mocha';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('juscat', () => {
    describe('Contract parameters', () => {
        it('Should have max submissions per cycle set correctly', async () => {
            const { jusCat } = await getAndDeployContracts();

            expect(await jusCat.maxSubmissionsPerCycle()).to.equal(MAX_SUBMISSIONS_PER_CYCLE);
        });
    });

    describe('Allocations', () => {
        it('Should track allocations for a cycle correctly', async () => {
            const { jusCat, token, x2EarnRewardsPool, appId, owner, admin } = await getAndDeployContracts();

            // Simulate receiving tokens from X Allocations Round
            await token.connect(owner).mint(admin, ethers.parseEther('6700'));

            // Allowance
            await token.connect(admin).approve(await x2EarnRewardsPool.getAddress(), ethers.parseEther('6700'));
            await x2EarnRewardsPool.connect(admin).deposit(ethers.parseEther('6700'), appId);

            // Set rewards for the current cycle
            await jusCat.connect(admin).setRewardsAmount(await token.balanceOf(admin.address));

            await waitForNextCycle(jusCat); // Assure cycle can be triggered

            await jusCat.connect(admin).triggerCycle();

            expect(await jusCat.getCurrentCycle()).to.equal(1);
        });

        it('Should track allocations for multiple cycles correctly', async () => {
            const { jusCat, token, x2EarnRewardsPool, appId, owner, admin } = await getAndDeployContracts();

            await receiveAllocations(jusCat, token, owner, admin, '6700', x2EarnRewardsPool, appId);

            await waitForNextCycle(jusCat);

            await jusCat.connect(admin).triggerCycle();

            expect(await jusCat.getCurrentCycle()).to.equal(1);

            await receiveAllocations(jusCat, token, owner, admin, '6700', x2EarnRewardsPool, appId);

            await waitForNextCycle(jusCat);

            await jusCat.connect(admin).triggerCycle();

            expect(await jusCat.getCurrentCycle()).to.equal(2);
        });
    });

    describe('Rewards', () => {
        it('Should track valid submissions correctly', async () => {
            const { jusCat, owner, admin, account3, token, x2EarnRewardsPool, appId } = await getAndDeployContracts();

            await receiveAllocations(jusCat, token, owner, admin, '6700', x2EarnRewardsPool, appId);

            await waitForNextCycle(jusCat);

            await jusCat.connect(admin).triggerCycle();

            await jusCat.connect(admin).registerValidSubmission(owner.address, ethers.parseEther('1'));

            await jusCat.connect(admin).registerValidSubmission(account3.address, ethers.parseEther('1'));

            await jusCat.connect(admin).registerValidSubmission(owner.address, ethers.parseEther('1'));

            expect(await jusCat.submissions(await jusCat.getCurrentCycle(), owner.address)).to.equal(2);

            expect(await jusCat.submissions(await jusCat.getCurrentCycle(), account3.address)).to.equal(1);

            expect(await jusCat.submissions(2, owner.address)).to.equal(0); // No submissions for next cycle
        });

        it('Should be able to receive expected rewards', async () => {
            const { jusCat, token, owner, account3, account4, admin, x2EarnRewardsPool, appId } = await getAndDeployContracts();

            await receiveAllocations(jusCat, token, owner, admin, '6700', x2EarnRewardsPool, appId);

            await waitForNextCycle(jusCat);

            await jusCat.connect(admin).triggerCycle();

            expect(await token.balanceOf(account4.address)).to.equal(ethers.parseEther('0'));
            expect(await token.balanceOf(account3.address)).to.equal(ethers.parseEther('0'));

            await jusCat.connect(admin).registerValidSubmission(account4.address, ethers.parseEther('1'));

            await jusCat.connect(admin).registerValidSubmission(account3.address, ethers.parseEther('1'));

            await jusCat.connect(admin).registerValidSubmission(account4.address, ethers.parseEther('1'));

            expect(await token.balanceOf(account4.address)).to.equal(
                ethers.parseEther('2'), // Received 2 tokens
            );

            expect(await token.balanceOf(account3.address)).to.equal(
                ethers.parseEther('1'), // Received 1 token
            );
        });

        it('Should calculate correctly rewards left', async () => {
            const { jusCat, token, owner, account3, admin, account4, otherAccounts, x2EarnRewardsPool, appId } = await getAndDeployContracts();

            await receiveAllocations(jusCat, token, owner, admin, '50', x2EarnRewardsPool, appId); // Receive 50 tokens

            await waitForNextCycle(jusCat);

            await jusCat.connect(admin).triggerCycle();

            expect(await jusCat.rewardsLeft(1)).to.equal(ethers.parseEther('50')); // 50 tokens are for users

            await jusCat.connect(admin).registerValidSubmission(owner.address, ethers.parseEther('1'));

            await jusCat.connect(admin).registerValidSubmission(account3.address, ethers.parseEther('1'));
            await jusCat.connect(admin).registerValidSubmission(account3.address, ethers.parseEther('1'));

            await jusCat.connect(admin).registerValidSubmission(account4.address, ethers.parseEther('1'));
            await jusCat.connect(admin).registerValidSubmission(account4.address, ethers.parseEther('1'));

            await jusCat.connect(admin).registerValidSubmission(admin.address, ethers.parseEther('1'));
            await jusCat.connect(admin).registerValidSubmission(admin.address, ethers.parseEther('1'));

            await jusCat.connect(admin).registerValidSubmission(otherAccounts[0].address, ethers.parseEther('1'));

            expect(await jusCat.rewardsLeft(1)).to.equal(ethers.parseEther('42'));
        });
    });

    describe('Withdrawals', () => {
        it("Should be able to withdraw if user's did not claim all their rewards", async () => {
            const { jusCat, token, owner, admin, account3, x2EarnRewardsPool, appId } = await getAndDeployContracts();

            await receiveAllocations(jusCat, token, owner, admin, '6700', x2EarnRewardsPool, appId);

            await waitForNextCycle(jusCat);

            await jusCat.connect(admin).triggerCycle();

            await jusCat.connect(admin).registerValidSubmission(owner.address, ethers.parseEther('1'));

            await jusCat.connect(admin).registerValidSubmission(account3.address, ethers.parseEther('1'));

            await jusCat.connect(admin).registerValidSubmission(owner.address, ethers.parseEther('1'));

            await waitForNextCycle(jusCat);

            await receiveAllocations(jusCat, token, owner, admin, '6700', x2EarnRewardsPool, appId);

            await waitForNextCycle(jusCat);

            await jusCat.connect(admin).triggerCycle();

            const initialBalance = await token.balanceOf(admin.address); // 6700 * 20% = 1340

            const rewardsLeftFirstCycle = await jusCat.rewardsLeft(1); // 5345 tokens because 15 were claimed in the first cycle

            await jusCat.connect(admin).withdrawRewards(1);

            expect(await token.balanceOf(admin.address)).to.equal(
                initialBalance + rewardsLeftFirstCycle, // 1340 + 5345 = 6685
            );
        });
    });
});
