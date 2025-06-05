import { ThirdwebSDK } from "https://unpkg.com/@thirdweb-dev/sdk@4.0.0/dist/browser/index.js";
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.8.1/+esm";

// Contract info
const contractAddress = "0x71F0327ec1054cDaF92e418BAbE569c795Da2921";

// Initialize when DOM is ready
window.addEventListener("DOMContentLoaded", async () => {
  try {
    // Enable wallet
    if (!window.ethereum) {
      alert("Please install MetaMask to continue.");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const sdk = ThirdwebSDK.fromSigner(signer, "ethereum");
    const contract = await sdk.getContract(contractAddress, "token-drop");

    // Update Stage Info
    const active = await contract.claimConditions.getActive();
    const all = await contract.claimConditions.getAll();

    document.getElementById("stageLabel").textContent = active.metadata.name;
    document.getElementById("priceLabel").textContent = `${ethers.formatEther(active.price)} ETH`;

    const nextIndex = all.findIndex(c => c.metadata.name === active.metadata.name) + 1;
    const next = all[nextIndex];
    document.getElementById("nextPriceLabel").textContent = next
      ? `${ethers.formatEther(next.price)} ETH`
      : "Final Stage";

    // Click Listener
    document.getElementById("buyPGCButton").addEventListener("click", async () => {
      try {
        const ethInput = document.getElementById("ethAmountInput").value;
        const ethAmount = parseFloat(ethInput);
        if (isNaN(ethAmount) || ethAmount <= 0) {
          alert("Please enter a valid ETH amount.");
          return;
        }

        // Fetch price and calculate quantity
        const currentStage = await contract.claimConditions.getActive();
        const pricePerTokenETH = parseFloat(ethers.formatEther(currentStage.price));
        const quantity = Math.floor(ethAmount / pricePerTokenETH);

        const tx = await contract.erc20.claim(quantity);
        alert("Success! TX: " + tx.receipt.transactionHash);
      } catch (err) {
        console.error("Buy error:", err);
        alert("Transaction failed.");
      }
    });

  } catch (err) {
    console.error("Initialization failed:", err);
    alert("Could not initialize contract.");
  }
});

