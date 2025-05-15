let web3;
let contract;
let account;

const contractAddress = "0x56371bB33b99326F9fF267bEfc1CBaD7849173EE";
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

// Cargar Web3 si no está definido
window.addEventListener("load", async () => {
  if (typeof Web3 === "undefined") {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/web3@1.10.0/dist/web3.min.js";
    script.onload = initApp;
    document.head.appendChild(script);
  } else {
    initApp();
  }
});

async function initApp() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    account = accounts[0];

    contract = new web3.eth.Contract(contractABI, contractAddress);

    document.getElementById("stakeBtn").addEventListener("click", stakeBNB);
    document.getElementById("withdrawStakeBtn").addEventListener("click", withdrawStake);
    document.getElementById("withdrawRewardsBtn").addEventListener("click", withdrawRewards);

    loadStats();
    setInterval(loadStats, 10000);
  } else {
    alert("Por favor, instala MetaMask para usar esta dApp.");
  }
}

async function stakeBNB() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0)
    return alert("Cantidad inválida");

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
  try {
    const [
      totalStaked,
      totalTreasury,
      user,
      pendingRewards,
      estimate,
      timeUntil,
    ] = await Promise.all([
      contract.methods.totalStaked().call(),
      contract.methods.totalTreasury().call(),
      contract.methods.users(account).call(),
      contract.methods.getPendingRewards(account).call(),
      contract.methods.getUserDailyDividendEstimate(account).call(),
      contract.methods.getTimeUntilNextDistribution(account).call(),
    ]);

    document.getElementById("totalStaked").innerText = toBNB(totalStaked) + " BNB";
    document.getElementById("totalTreasury").innerText = toBNB(totalTreasury) + " BNB";
    document.getElementById("userStaked").innerText = toBNB(user.stakedAmount) + " BNB";
    document.getElementById("pendingRewards").innerText = toBNB(pendingRewards) + " BNB";
    document.getElementById("dailyEstimate").innerText = toBNB(estimate) + " BNB";
    document.getElementById("nextDistribution").innerText = formatTime(timeUntil);

    updateCharts(toBNB(totalTreasury), toBNB(estimate));
  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
  }
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

// === Gráficas con Chart.js ===

let treasuryChart, dividendChart;
let labels = [], treasuryData = [], dividendData = [];

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
        label: "Tesoro (BNB)",
        data: treasuryData,
        borderColor: "#ffd700",
        backgroundColor: "rgba(255, 215, 0, 0.2)",
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } }
    }
  });

  const ctx2 = document.getElementById("dividendChart").getContext("2d");
  dividendChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Dividendos estimados (BNB)",
        data: dividendData,
        borderColor: "#00ffff",
        backgroundColor: "rgba(0, 255, 255, 0.2)",
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } }
    }
  });
}
