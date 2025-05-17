// app.js

const CONTRACT_ADDRESS = "0x99874Ea86dD899CaCE932Af1B41ea406103f0708"; // Reemplaza si es necesario
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStakedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"},{"internalType":"uint256","name":"nextDistributionIn","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3;
let contract;
let userAddress;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    document.getElementById("connectButton").addEventListener("click", connectWallet);
  } else {
    alert("Por favor, instala MetaMask para usar esta dApp.");
  }
});

async function connectWallet() {
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    userAddress = accounts[0];
    document.getElementById("connectButton").innerText = "Connected";

    await loadAllStats();
  } catch (error) {
    console.error("Wallet connection failed:", error);
  }
}

async function loadAllStats() {
  try {
    // === GLOBAL STATS ===
    const [totalStaked, totalTreasury, totalDailyDividend, activeStakers] =
      await contract.methods.getAllStats().call();

    document.getElementById("totalStaked").innerText = web3.utils.fromWei(totalStaked) + " BNB";
    document.getElementById("totalTreasury").innerText = web3.utils.fromWei(totalTreasury) + " BNB";
    document.getElementById("totalDailyDividend").innerText = web3.utils.fromWei(totalDailyDividend) + " BNB";
    document.getElementById("activeStakers").innerText = activeStakers;

    // === USER STATS ===
    const [
      stakedAmount,
      pendingRewards,
      dailyEstimate,
      userShare,
      nextDistributionIn
    ] = await contract.methods.getUserStats(userAddress).call();

    document.getElementById("userStaked").innerText = web3.utils.fromWei(stakedAmount) + " BNB";
    document.getElementById("pendingRewards").innerText = web3.utils.fromWei(pendingRewards) + " BNB";
    document.getElementById("dailyEstimate").innerText = web3.utils.fromWei(dailyEstimate) + " BNB";

    const sharePercent = (parseFloat(userShare) / 1e16).toFixed(4); // 1e18 to %
    document.getElementById("userShare").innerText = sharePercent + " %";

    const seconds = parseInt(nextDistributionIn);
    document.getElementById("timeUntilNext").innerText = formatTime(seconds);

  } catch (err) {
    console.error("Error loading stats:", err);
  }
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

// === ACTIONS ===

async function stake() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount || amount <= 0) return alert("Enter valid amount");

  try {
    await contract.methods.stake().send({
      from: userAddress,
      value: web3.utils.toWei(amount)
    });
    alert("Staked successfully!");
    loadAllStats();
  } catch (err) {
    console.error("Stake failed:", err);
  }
}

async function withdrawPartial() {
  const amount = document.getElementById("withdrawPartialAmount").value;
  if (!amount || amount <= 0) return alert("Enter valid amount");

  try {
    await contract.methods.withdrawPartialStake(web3.utils.toWei(amount)).send({
      from: userAddress
    });
    alert("Partial withdrawal successful!");
    loadAllStats();
  } catch (err) {
    console.error("Withdraw partial failed:", err);
  }
}

async function withdrawAll() {
  try {
    await contract.methods.withdrawStake().send({ from: userAddress });
    alert("All stake withdrawn!");
    loadAllStats();
  } catch (err) {
    console.error("Withdraw all failed:", err);
  }
}

async function claimRewards() {
  try {
    await contract.methods.withdrawRewards().send({ from: userAddress });
    alert("Rewards claimed!");
    loadAllStats();
  } catch (err) {
    console.error("Claim rewards failed:", err);
  }
}
