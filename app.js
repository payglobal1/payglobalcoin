const sdk = new thirdweb.ThirdwebSDK("ethereum");
const contractAddress = "0x71F0327ec1054cDaF92e418BAbE569c795Da2921";
let contract;

async function init() {
  try {
    contract = await sdk.getContract(contractAddress, "token-drop");
    console.log("✅ Contract loaded:", contractAddress);

    // Load active claim condition
    const active = await contract.claimConditions.getActive();

    // Update UI
    document.getElementById("stageLabel").textContent = active.metadata.name || "N/A";
    document.getElementById("priceLabel").textContent = `${parseFloat(ethers.formatEther(active.price))} ETH`;

    // Handle input change
    document.getElementById("ethAmountInput").addEventListener("input", () => {
      const eth = parseFloat(document.getElementById("ethAmountInput").value);
      const tokenPrice = parseFloat(ethers.formatEther(active.price));
      const amount = !isNaN(eth) ? Math.floor(eth / tokenPrice) : 0;
      document.getElementById("pgcReceiveAmount").textContent = amount;
    });

    // Buy button logic
    document.getElementById("buyPGCButton").addEventListener("click", async () => {
      const ethInput = parseFloat(document.getElementById("ethAmountInput").value);
      if (isNaN(ethInput) || ethInput <= 0) return alert("❗ Enter valid ETH amount.");

      const tokenPrice = parseFloat(ethers.formatEther(active.price));
      const quantity = Math.floor(ethInput / tokenPrice);
      const receiver = await window.ethereum.request({ method: 'eth_requestAccounts' }).then(a => a[0]);
      const totalPrice = ethers.parseEther((quantity * tokenPrice).toString());

      try {
        const tx = await contract.call("claim", [
          receiver,
          quantity,
          active.currencyAddress,
          active.price,
          {
            proof: active.merkleRoot ? ["0"] : [],
            currency: active.currencyAddress,
            pricePerToken: active.price,
            quantityLimitPerWallet: active.maxClaimablePerWallet || 0,
          },
          "0x", // extra data
          totalPrice
        ]);

        alert("✅ Success! Tx Hash: " + tx.receipt.transactionHash);
      } catch (err) {
        console.error("❌ Claim failed:", err);
        alert("❌ Transaction failed.");
      }
    });
  } catch (err) {
    console.error("⛔ Error initializing contract:", err);
    alert("⛔ Contract not ready yet.");
  }
}

init();
