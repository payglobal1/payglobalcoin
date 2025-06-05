const contractAddress = "0x71F0327ec1054cDaF92e418BAbE569c795Da2921";
let contract;

window.addEventListener("DOMContentLoaded", async () => {
  try {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const sdk = await thirdweb.ThirdwebSDK.fromSigner(signer, "ethereum");
    contract = await sdk.getContract(contractAddress, "token-drop");

    const active = await contract.claimConditions.getActive();
    const all = await contract.claimConditions.getAll();

    document.getElementById("stageLabel").textContent = active.metadata.name;
    document.getElementById("priceLabel").textContent = `${ethers.formatEther(active.price)} ETH`;

    const nextIndex = all.findIndex(c => c.metadata.name === active.metadata.name) + 1;
    const next = all[nextIndex];
    document.getElementById("nextPriceLabel").textContent = next
      ? `${ethers.formatEther(next.price)} ETH`
      : "Final Stage";
  } catch (err) {
    console.error("Initialization error:", err);
  }
});

document.getElementById("buyPGCButton").addEventListener("click", async () => {
  try {
    if (!contract) {
      alert("Contract not ready yet.");
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
    alert("Success! Tx Hash: " + tx.receipt.transactionHash);
  } catch (err) {
    console.error("Buy error:", err);
    alert("Transaction failed.");
  }
});
