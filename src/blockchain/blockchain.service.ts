import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import ABI from './HealthToken.abi.json';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private contract: ethers.Contract;
  private enabled = false;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const rpcUrl = this.config.get<string>('ALCHEMY_RPC_URL');
    const privateKey = this.config.get<string>('BACKEND_PRIVATE_KEY');
    const contractAddress = this.config.get<string>('CONTRACT_ADDRESS');

    if (!rpcUrl || !privateKey || !contractAddress) {
      this.logger.warn('Blockchain env vars not set — blockchain features disabled');
      return;
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    this.contract = new ethers.Contract(contractAddress, ABI, signer);
    this.enabled = true;
    this.logger.log('BlockchainService initialized');
  }

  async rewardUser(walletAddress: string, tokenAmount: number): Promise<string | null> {
    if (!this.enabled) return null;
    try {
      const tx = await this.contract.rewardUser(
        walletAddress,
        ethers.parseUnits(tokenAmount.toString(), 18),
      );
      await tx.wait();
      this.logger.log(`Rewarded ${tokenAmount} HPT to ${walletAddress} — tx: ${tx.hash}`);
      return tx.hash as string;
    } catch (err) {
      this.logger.error(`rewardUser failed: ${err.message}`);
      return null;
    }
  }

  async deductFromUser(walletAddress: string, tokenAmount: number): Promise<string | null> {
    if (!this.enabled) return null;
    try {
      const tx = await this.contract.deductFromUser(
        walletAddress,
        ethers.parseUnits(tokenAmount.toString(), 18),
      );
      await tx.wait();
      this.logger.log(`Deducted ${tokenAmount} HPT from ${walletAddress} — tx: ${tx.hash}`);
      return tx.hash as string;
    } catch (err) {
      this.logger.error(`deductFromUser failed: ${err.message}`);
      return null;
    }
  }

  async getBalance(walletAddress: string): Promise<string> {
    if (!this.enabled) return '0';
    try {
      const balance = await this.contract.balanceOf(walletAddress);
      return ethers.formatUnits(balance, 18);
    } catch (err) {
      this.logger.error(`getBalance failed: ${err.message}`);
      return '0';
    }
  }
}
