import { ethers } from 'ethers';
import BookNFTABI from '../contracts/BookNFT.json' assert { type: 'json' };

class NFTService {
  constructor() {
    // Mantle Network configuration
    this.networkConfig = {
      mantle: {
        chainId: 5001, // Mantle Testnet
        rpcUrl: 'https://rpc.testnet.mantle.xyz',
        explorer: 'https://explorer.testnet.mantle.xyz',
        currency: 'MNT'
      },
      mantleMainnet: {
        chainId: 5000, // Mantle Mainnet
        rpcUrl: 'https://rpc.mantle.xyz',
        explorer: 'https://explorer.mantle.xyz',
        currency: 'MNT'
      }
    };
    
    // Contract configuration
    this.contractAddress = process.env.NFT_CONTRACT_ADDRESS;
    this.network = process.env.NFT_NETWORK || 'mantle'; // mantle or mantleMainnet
    
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(this.networkConfig[this.network].rpcUrl);
  }

  /**
   * Connect to user's wallet
   */
  async connectWallet() {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Request account access
        await provider.send("eth_requestAccounts", []);
        
        // Get signer
        const signer = await provider.getSigner();
        
        // Check if we're on the correct network
        const network = await provider.getNetwork();
        const expectedChainId = this.networkConfig[this.network].chainId;
        
        if (network.chainId !== BigInt(expectedChainId)) {
          await this.switchNetwork();
        }
        
        return { provider, signer };
      } else {
        throw new Error('MetaMask or other wallet not found');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  /**
   * Switch to Mantle Network
   */
  async switchNetwork() {
    try {
      const params = {
        chainId: `0x${this.networkConfig[this.network].chainId.toString(16)}`,
        chainName: this.network === 'mantle' ? 'Mantle Testnet' : 'Mantle',
        nativeCurrency: {
          name: 'Mantle',
          symbol: 'MNT',
          decimals: 18
        },
        rpcUrls: [this.networkConfig[this.network].rpcUrl],
        blockExplorerUrls: [this.networkConfig[this.network].explorer]
      };

      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [params]
      });
    } catch (error) {
      console.error('Error switching network:', error);
      throw error;
    }
  }

  /**
   * Create NFT metadata
   */
  createNFTMetadata(book) {
    return {
      name: book.title,
      description: book.description,
      image: book.cover,
      external_url: `${process.env.FRONTEND_URL}/book/${book.id}`,
      attributes: [
        {
          trait_type: "Author",
          value: book.author?.name || "Unknown"
        },
        {
          trait_type: "Total Chapters",
          value: book.totalChapters
        },
        {
          trait_type: "Status",
          value: book.isComplete ? "Complete" : "Ongoing"
        },
        {
          trait_type: "Genre",
          value: book.genres?.map(g => g.genre.name).join(", ") || "General"
        },
        {
          trait_type: "Mint Price",
          value: `${book.nftPrice} MNT`
        },
        {
          trait_type: "Max Supply",
          value: book.maxSupply || "Unlimited"
        },
        {
          trait_type: "Current Supply",
          value: book.currentSupply
        }
      ],
      properties: {
        files: [
          {
            type: "image/jpeg",
            uri: book.cover
          }
        ],
        category: "image",
        bookId: book.id,
        authorId: book.authorId
      }
    };
  }

  /**
   * Upload metadata to IPFS
   */
  async uploadMetadataToIPFS(metadata) {
    try {
      // You can use Pinata, NFT.Storage, or any IPFS service
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PINATA_JWT_TOKEN}`
        },
        body: JSON.stringify(metadata)
      });

      const result = await response.json();
      return `ipfs://${result.IpfsHash}`;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  }

  /**
   * Mint NFT for a book
   */
  async mintNFT(book, userAddress) {
    try {
      // Connect to wallet
      const { signer } = await this.connectWallet();
      
      // Create contract instance
      const contract = new ethers.Contract(this.contractAddress, BookNFTABI.abi, signer);
      
      // Create metadata
      const metadata = this.createNFTMetadata(book);
      
      // Upload metadata to IPFS
      const tokenURI = await this.uploadMetadataToIPFS(metadata);
      
      // Prepare book metadata for contract
      const bookMetadata = {
        title: book.title,
        author: book.author?.name || "Unknown",
        description: book.description,
        coverImage: book.cover,
        totalChapters: book.totalChapters,
        isComplete: book.isComplete,
        mintPrice: ethers.parseEther(book.nftPrice.toString()),
        maxSupply: book.maxSupply || 0,
        currentSupply: book.currentSupply
      };
      
      // Convert book ID to uint256 (you might want to use a different mapping)
      const bookId = ethers.keccak256(ethers.toUtf8Bytes(book.id));
      
      // Estimate gas
      const gasEstimate = await contract.mintBookNFT.estimateGas(
        bookId,
        bookMetadata,
        tokenURI,
        userAddress,
        { value: ethers.parseEther(book.nftPrice.toString()) }
      );
      
      // Mint NFT
      const tx = await contract.mintBookNFT(
        bookId,
        bookMetadata,
        tokenURI,
        userAddress,
        {
          value: ethers.parseEther(book.nftPrice.toString()),
          gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
        }
      );
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Get token ID from event
      const mintEvent = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === 'BookNFTMinted';
        } catch {
          return false;
        }
      });
      
      let tokenId;
      if (mintEvent) {
        const parsed = contract.interface.parseLog(mintEvent);
        tokenId = parsed.args.tokenId.toString();
      }
      
      return {
        success: true,
        transactionHash: receipt.hash,
        tokenId: tokenId,
        tokenURI: tokenURI,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice.toString()
      };
      
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  /**
   * Get NFT ownership information
   */
  async getNFTOwnership(tokenId) {
    try {
      const contract = new ethers.Contract(this.contractAddress, BookNFTABI.abi, this.provider);
      
      const owner = await contract.ownerOf(tokenId);
      const tokenURI = await contract.tokenURI(tokenId);
      const bookId = await contract.getBookId(tokenId);
      
      return {
        tokenId: tokenId.toString(),
        owner: owner,
        tokenURI: tokenURI,
        bookId: bookId.toString()
      };
    } catch (error) {
      console.error('Error getting NFT ownership:', error);
      throw error;
    }
  }

  /**
   * Get all NFTs for a book
   */
  async getBookNFTs(bookId) {
    try {
      const contract = new ethers.Contract(this.contractAddress, BookNFTABI.abi, this.provider);
      
      const tokenIds = await contract.getBookTokenIds(bookId);
      const metadata = await contract.getBookMetadata(bookId);
      
      return {
        tokenIds: tokenIds.map(id => id.toString()),
        metadata: {
          title: metadata.title,
          author: metadata.author,
          description: metadata.description,
          coverImage: metadata.coverImage,
          totalChapters: metadata.totalChapters.toString(),
          isComplete: metadata.isComplete,
          mintPrice: ethers.formatEther(metadata.mintPrice),
          maxSupply: metadata.maxSupply.toString(),
          currentSupply: metadata.currentSupply.toString()
        }
      };
    } catch (error) {
      console.error('Error getting book NFTs:', error);
      throw error;
    }
  }

  /**
   * Transfer NFT
   */
  async transferNFT(tokenId, fromAddress, toAddress) {
    try {
      const { signer } = await this.connectWallet();
      const contract = new ethers.Contract(this.contractAddress, BookNFTABI.abi, signer);
      
      const tx = await contract.transferFrom(fromAddress, toAddress, tokenId);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error transferring NFT:', error);
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { status: 'pending' };
      }
      
      return {
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice.toString()
      };
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw error;
    }
  }

  /**
   * Get MNT balance
   */
  async getBalance(address) {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }
}

export default new NFTService();
