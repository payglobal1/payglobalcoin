let contract;

(async () => {
  try {
    const sdk = new thirdweb.ThirdwebSDK("ethereum");
    contract = await sdk.getContract("0x71F0327ec1054cDaF92e418BAbE569c795Da2921");
    console.log("✅ Contract Ready");
  } catch (err) {
    console.error("Initialization error:", err);
    alert("⚠️ Initialization failed.");
  }
})();

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
    const receiver = await window.ethereum.request({ method: 'eth_requestAccounts' }).then(a => a[0]);
    const totalPrice = ethers.parseEther((quantity * pricePerToken).toString());

    const tx = await contract.call("claim", [
      receiver,
      quantity,
      active.currencyAddress,
      active.price,
      {
        proof: [],
        currency: active.currencyAddress,
        pricePerToken: active.price,
        quantityLimitPerWallet: active.maxClaimablePerWallet || 0,
      },
      "0x",
      totalPrice,
    ]);

    alert("✅ Success! Tx Hash: " + tx.receipt.transactionHash);
  } catch (err) {
    console.error("Buy error:", err);
    alert("❌ Transaction failed.");
  }
}
