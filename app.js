
const contractAddress = "0x5f42DC4DBf6Ad557966CCd8a61f658B8e6b16CF5";
const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStakedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"},{"internalType":"uint256","name":"nextDistributionIn","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}] // Inserta la ABI aquí

let web3;
let contract;
let account;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    account = accounts[0];
    contract = new web3.eth.Contract(abi, contractAddress);
    updateUI();
  }
});

async function updateUI() {
  const [
    totalStaked,
    totalTreasury,
    totalDailyDividend,
    stakers,
    pendingRewards,
    dailyEstimate,
    userStaked,
    share,
    nextDistribution
  ] = await Promise.all([
    contract.methods.totalStaked().call(),
    contract.methods.totalTreasury().call(),
    contract.methods.getTotalDailyDividend().call(),
    contract.methods.getNumberOfStakers().call(),
    contract.methods.getPendingRewards(account).call(),
    contract.methods.getUserDailyDividendEstimate(account).call(),
    contract.methods.getUserStakedAmount(account).call(),
    contract.methods.getUserShare(account).call(),
    contract.methods.getTimeUntilNextDistribution(account).call()
  ]);

  document.getElementById("total-staked").innerText = (totalStaked / 1e18).toFixed(4) + " BNB";
  document.getElementById("total-treasury").innerText = (totalTreasury / 1e18).toFixed(4) + " BNB";
  document.getElementById("total-daily-dividend").innerText = (totalDailyDividend / 1e18).toFixed(4) + " BNB";
  document.getElementById("stakers").innerText = stakers;

  document.getElementById("pending-rewards").innerText = (pendingRewards / 1e18).toFixed(8) + " BNB";
  document.getElementById("estimated-dividends").innerText = (dailyEstimate / 1e18).toFixed(8) + " BNB";
  document.getElementById("user-staked").innerText = (userStaked / 1e18).toFixed(4) + " BNB";
  document.getElementById("user-share").innerText = (share / 100).toFixed(4) + " %";

  const time = parseInt(nextDistribution);
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;
  document.getElementById("next-distribution").innerText = `${hours}h ${minutes}m ${seconds}s`;

  loadChart((totalDailyDividend / 1e18).toFixed(8));
}

function loadChart(latest) {
  const ctx = document.getElementById("dividendsChart").getContext("2d");
  const labels = ["2025-05-10", "2025-05-11", "2025-05-12", "2025-05-13", "2025-05-14", "2025-05-15", "2025-05-16"];
  const data = [0.00005, 0.00007, 0.00008, 0.00006, 0.0001, 0.00009, parseFloat(latest)];

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Dividendos (BNB)",
        data,
        borderColor: "rgba(0, 200, 255, 0.8)",
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

async function stake() {
  const amount = document.getElementById("stake-amount").value;
  await contract.methods.stake().send({ from: account, value: web3.utils.toWei(amount, "ether") });
  updateUI();
}

async function unstake() {
  await contract.methods.withdrawStake().send({ from: account });
  updateUI();
}

async function claim() {
  await contract.methods.claimRewards().send({ from: account });
  updateUI();
}
