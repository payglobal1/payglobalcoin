let contract;
let sdk;

window.addEventListener("DOMContentLoaded", async () => {
  try {
    // Check for MetaMask
    if (!window.ethereum) {
      alert("Please install MetaMask to continue.");
      return;
    }

    // Fetch ETH price from CoinGecko
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await response.json();
    const ethusd = data.ethereum.usd;

    // Initialize Thirdweb SDK
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    sdk = await thirdweb.ThirdwebSDK.fromSigner(signer, "ethereum");

    // Connect to Token Drop contract
    contract = await sdk.getContract("0x71F0327ec1054cDaF92e418BAbE569c795Da2921", "token-drop");

    // Get claim condition info
    const active = await contract.claimConditions.getActive();
    const all = await contract.claimConditions.getAll();

    document.getElementById("stageLabel").textContent = active.metadata.name;
    document.getElementById("priceLabel").textContent = `${ethers.formatEther(active.price)} ETH`;

    const nextIndex = all.findIndex(c => c.metadata.name === active.metadata.name) + 1;
    const next = all[nextIndex];
    document.getElementById("nextPriceLabel").textContent = next
      ? `${ethers.formatEther(next.price)} ETH`
      : "Final Stage";

    // Live token calculation (optional)
    const ethInput = document.getElementById("ethAmountInput");
    const receiveOutput = document.getElementById("pgcReceiveAmount");
    if (ethInput && receiveOutput) {
      ethInput.addEventListener("input", () => {
        const eth = parseFloat(ethInput.value);
        const price = parseFloat(ethers.formatEther(active.price));
        const qty = Math.floor(eth / price);
        receiveOutput.textContent = isNaN(qty) ? "0" : qty.toLocaleString();
      });
    }

    // Enable buy button after contract is ready
    const buyBtn = document.getElementById("buyPGCButton");
    if (buyBtn) {
      buyBtn.addEventListener("click", buyTokensETH);
    }

  } catch (err) {
    console.error("Initialization error:", err);
    alert("Error initializing contract.");
  }
});

async function buyTokensETH() {
  try {
    if (!contract) {
      alert("⛔ Contract not ready yet.");
      return;
    }

    const ethInput = document.getElementById("ethAmountInput").value;
    const ethAmount = parseFloat(ethInput);
    if (isNaN(ethAmount) || ethAmount <= 0) {
      alert("Please enter a valid ETH amount.");
      return;
    }

    const active = await contract.claimConditions.getActive();
    const pricePerToken = parseFloat(ethers.formatEther(active.price));
    const quantity = Math.floor(ethAmount / pricePerToken);

    const tx = await contract.erc20.claim(quantity);
    alert("✅ Success! Tx Hash: " + tx.receipt.transactionHash);
  } catch (err) {
    console.error("Buy error:", err);
    alert("❌ Transaction failed.");
  }
}
