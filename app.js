window.onload = async function () {
  const contractAddress = "0x71F0327ec1054cDaF92e418BAbE569c795Da2921";
  const chain = "ethereum";
  const sdk = new thirdweb.ThirdwebSDK(chain);

  if (!window.ethereum) {
    alert("Please install MetaMask.");
    return;
  }

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    sdk.updateSignerOrProvider(signer);

    const contract = await sdk.getContract(contractAddress, "token-drop");

    async function updateStageInfo() {
      const active = await contract.claimConditions.getActive();
      const all = await contract.claimConditions.getAll();

      document.getElementById("stageLabel").textContent = active.metadata.name;
      document.getElementById("priceLabel").textContent = `${ethers.formatEther(active.price)} ETH`;

      const nextIndex = all.findIndex(c => c.metadata.name === active.metadata.name) + 1;
      const next = all[nextIndex];
      document.getElementById("nextPriceLabel").textContent = next
        ? `${ethers.formatEther(next.price)} ETH`
        : "Final Stage";
    }

    document.getElementById("buyPGCButton").addEventListener("click", async () => {
      try {
        const quantityInput = document.getElementById("tokenAmountInput");
        const quantity = parseInt(quantityInput.value);
        if (!quantity || quantity <= 0) {
          alert("Please enter a valid token amount.");
          return;
        }

        const tx = await contract.erc20.claim(quantity);
        alert("Transaction sent! Hash: " + tx.receipt.transactionHash);
      } catch (err) {
        console.error("Transaction error:", err);
        alert("Transaction failed. See console for details.");
      }
    });

    updateStageInfo();
  } catch (err) {
    console.error("Initialization error:", err);
    alert("Failed to connect. Please check console.");
  }
};
