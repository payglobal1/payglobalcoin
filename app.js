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

    const receiver = await window.ethereum.request({ method: 'eth_requestAccounts' }).then(accounts => accounts[0]);

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
      totalPrice
    ]);

    alert("✅ Success! Tx Hash: " + tx.receipt.transactionHash);
  } catch (err) {
    console.error("Buy error:", err);
    alert("❌ Transaction failed.");
  }
}
