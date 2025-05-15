const contractAddress = "0x56371bB33b99326F9fF267bEfc1CBaD7849173EE"; // tu contrato
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3;
let contract;
let account;

// Inicializar Web3 y contrato
window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    account = accounts[0];

    contract = new web3.eth.Contract(contractABI, contractAddress);

    loadStats();
    setInterval(loadStats, 10000);
  } else {
    alert("Instala MetaMask para usar esta dApp");
  }
});

async function stakeBNB() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return alert("Invalid amount");

  const valueInWei = web3.utils.toWei(amount, "ether");

  try {
    await contract.methods.stake().send({ from: account, value: valueInWei });
    loadStats();
  } catch (e) {
    console.error(e);
    alert("Error al hacer stake");
  }
}

async function withdrawStake() {
  try {
    await contract.methods.withdrawStake().send({ from: account });
    loadStats();
  } catch (e) {
    console.error(e);
    alert("Error al retirar stake");
  }
}

async function withdrawRewards() {
  try {
    await contract.methods.withdrawRewards().send({ from: account });
    loadStats();
  } catch (e) {
    console.error(e);
    alert("Error al reclamar recompensas");
  }
}

async function loadStats() {
  const [
    totalStaked,
    totalTreasury,
    user,
    pendingRewards,
    estimate,
    activeUsers,
    nextTime
  ] = await Promise.all([
    contract.methods.totalStaked().call(),
    contract.methods.totalTreasury().call(),
    contract.methods.users(account).call(),
    contract.methods.getPendingRewards(account).call(),
    contract.methods.getUserDailyDividendEstimate(account).call(),
    contract.methods.stakers().call(), // cuenta activa = .length
    contract.methods.getTimeUntilNextDistribution(account).call()
  ]);

  document.getElementById("totalStaked").innerText = toBNB(totalStaked) + " BNB";
  document.getElementById("totalTreasury").innerText = toBNB(totalTreasury) + " BNB";
  document.getElementById("userStaked").innerText = toBNB(user.stakedAmount) + " BNB";
  document.getElementById("pendingRewards").innerText = toBNB(pendingRewards) + " BNB";
  document.getElementById("dailyEstimate").innerText = toBNB(estimate) + " BNB";
  document.getElementById("activeUsers").innerText = activeUsers.length;
  document.getElementById("nextDistribution").innerText = formatTime(nextTime);

  updateCharts(toBNB(totalTreasury), toBNB(totalTreasury * 0.03));
}

function toBNB(value) {
  return parseFloat(web3.utils.fromWei(value.toString(), "ether")).toFixed(4);
}

function formatTime(seconds) {
  const s = Number(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

// === Chart.js ===

let treasuryChart, dividendChart;
let treasuryData = [], dividendData = [], labels = [];

function updateCharts(treasury, dividend) {
  const now = new Date().toLocaleTimeString();
  if (labels.length > 20) {
    labels.shift();
    treasuryData.shift();
    dividendData.shift();
  }

  labels.push(now);
  treasuryData.push(treasury);
  dividendData.push(dividend);

  if (!treasuryChart) initCharts();
  treasuryChart.update();
  dividendChart.update();
}

function initCharts() {
  const ctx1 = document.getElementById("treasuryChart").getContext("2d");
  treasuryChart = new Chart(ctx1, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "BNB in Treasury Pool",
        data: treasuryData,
        borderColor: "#ffd700",
        backgroundColor: "rgba(255, 215, 0, 0.2)",
        fill: true,
        tension: 0.4,
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  const ctx2 = document.getElementById("dividendChart").getContext("2d");
  dividendChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "BNB in Dividend Pool (est.)",
        data: dividendData,
        borderColor: "#00ffff",
        backgroundColor: "rgba(0, 255, 255, 0.2)",
        fill: true,
        tension: 0.4,
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}
