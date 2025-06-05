import { ThirdwebSDK } from "https://unpkg.com/@thirdweb-dev/sdk@4.0.1/dist/browser.mjs";
import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.8.1/ethers.min.js";

async function main() {
  try {
    // STEP 1: MetaMask და Signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const sdk = ThirdwebSDK.fromSigner(signer, "ethereum");

    // STEP 2: Token Drop კონტრაქტი
    const contract = await sdk.getContract(
      "0x71F0327ec1054cDaF92e418BAbE569c795Da2921",
      "token-drop"
    );

    // STEP 3: Stage დეტალების განახლება
    async function updateStageInfo() {
      const active = await contract.claimConditions.getActive();
      const all = await contract.claimConditions.getAll();

      document.getElementById("stageLabel").textContent = active.metadata.name;
      document.getElementById("priceLabel").textContent = `${ethers.formatEther(active.price)} ETH`;

      const next = all[all.findIndex(x => x.metadata.name === active.metadata.name) + 1];
      document.getElementById("nextPriceLabel").textContent = next
        ? `${ethers.formatEther(next.price)} ETH`
        : "Final Stage";
    }

    // STEP 4: ყიდვის ღილაკი
    document.getElementById("buyPGCButton").addEventListener("click", async () => {
      try {
        const quantity = parseInt(document.getElementById("tokenAmountInput").value);
        const tx = await contract.erc20.claim(quantity);
        alert("Transaction sent! Tx: " + tx.receipt.transactionHash);
      } catch (err) {
        console.error("Buy error:", err);
        alert("Transaction failed!");
      }
    });

    // STEP 5: გამოთვალე სტეიჯი
    await updateStageInfo();
  } catch (e) {
    console.error("Initialization error:", e);
    alert("Initialization failed! Please check MetaMask.");
  }
}

main();
