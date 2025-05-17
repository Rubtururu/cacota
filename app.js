const contractAddress = "0x99874Ea86dD899CaCE932Af1B41ea406103f0708"; // testnet
const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStakedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"},{"internalType":"uint256","name":"nextDistributionIn","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3, contract, user;

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    user = accounts[0];
    contract = new web3.eth.Contract(abi, contractAddress);
    document.getElementById("connectButton").innerText = "Connected: " + user.slice(0, 6) + "..." + user.slice(-4);
    loadStats();
  } else {
    alert("Install MetaMask to use this dApp.");
  }
}

async function loadStats() {
  const global = await contract.methods.getAllStats().call();
  const userStats = await contract.methods.getUserStats(user).call();

  document.getElementById("globalStats").innerHTML = `
    <p><strong>Total Staked:</strong> ${web3.utils.fromWei(global[0])} BNB</p>
    <p><strong>Total Treasury:</strong> ${web3.utils.fromWei(global[1])} BNB</p>
    <p><strong>Daily Dividend Pool:</strong> ${web3.utils.fromWei(global[2])} BNB</p>
    <p><strong>Active Stakers:</strong> ${global[3]}</p>
  `;

  document.getElementById("userStats").innerHTML = `
    <p><strong>Your Stake:</strong> ${web3.utils.fromWei(userStats[0])} BNB</p>
    <p><strong>Pending Rewards:</strong> ${web3.utils.fromWei(userStats[1])} BNB</p>
    <p><strong>Daily Estimate:</strong> ${web3.utils.fromWei(userStats[2])} BNB</p>
    <p><strong>Your Share (%):</strong> ${(userStats[3] / 1e16).toFixed(2)}%</p>
    <p><strong>Time Until Next Distribution:</strong> ${(userStats[4] / 3600).toFixed(2)} hrs</p>
  `;
}

async function stake() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount || isNaN(amount)) return alert("Enter a valid BNB amount");

  await contract.methods.stake().send({
    from: user,
    value: web3.utils.toWei(amount, "ether"),
  });

  loadStats();
}

async function withdrawPartial() {
  const amount = document.getElementById("withdrawPartialAmount").value;
  if (!amount || isNaN(amount)) return alert("Enter a valid amount");

  await contract.methods.withdrawPartialStake(web3.utils.toWei(amount, "ether")).send({ from: user });
  loadStats();
}

async function withdrawAll() {
  await contract.methods.withdrawStake().send({ from: user });
  loadStats();
}

async function claimRewards() {
  await contract.methods.withdrawRewards().send({ from: user });
  loadStats();
}

document.getElementById("connectButton").addEventListener("click", connectWallet);
