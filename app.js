// app.js
let contract;
let userAccount;
const contractAddress = "0x5f42DC4DBf6Ad557966CCd8a61f658B8e6b16CF5"; // Testnet BSC

const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStakedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"},{"internalType":"uint256","name":"nextDistributionIn","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

window.addEventListener("DOMContentLoaded", async () => {
  if (window.ethereum) {
    try {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      userAccount = accounts[0];
      contract = new web3.eth.Contract(abi, contractAddress);

      refreshAll();
      setInterval(refreshCountdown, 1000);

      document.getElementById("stakeButton").onclick = stakeBNB;
      document.getElementById("withdrawButton").onclick = withdrawStake;
      document.getElementById("claimButton").onclick = claimRewards;
    } catch (err) {
      console.error("Error al conectar con MetaMask:", err);
    }
  } else {
    alert("Por favor, instala MetaMask para usar esta dApp.");
  }
});

function formatBNB(value, decimals = 8) {
  return (parseFloat(Web3.utils.fromWei(value, "ether"))).toFixed(decimals);
}

async function refreshAll() {
  try {
    const stats = await contract.methods.getAllStats().call();
    const userStats = await contract.methods.getUserStats(userAccount).call();

    document.getElementById("totalStaked").innerText = `${formatBNB(stats[0])} BNB`;
    document.getElementById("totalTreasury").innerText = `${formatBNB(stats[1])} BNB`;
    document.getElementById("dailyDividend").innerText = `${formatBNB(stats[2])} BNB`;
    document.getElementById("activeStakers").innerText = stats[3];

    document.getElementById("userStaked").innerText = `${formatBNB(userStats[0])} BNB`;
    document.getElementById("pendingRewards").innerText = `${formatBNB(userStats[1])} BNB`;
    document.getElementById("dailyEstimate").innerText = `${formatBNB(userStats[2])} BNB`;
    document.getElementById("userShare").innerText = `${(parseFloat(userStats[3]) / 1e16).toFixed(4)} %`;
    updateCountdown(userStats[4]);

    renderChart(formatBNB(stats[1]));
  } catch (err) {
    console.error("Error al cargar estadísticas:", err);
  }
}

function updateCountdown(seconds) {
  const el = document.getElementById("nextDistribution");
  if (seconds <= 0) {
    el.innerText = "Distribución en curso...";
    return;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  el.innerText = `${h}h ${m}m ${s}s`;
}

function refreshCountdown() {
  const el = document.getElementById("nextDistribution");
  const text = el.innerText;
  if (text.includes("Distribución")) return;

  const parts = text.split(/h|m|s/).map(p => parseInt(p)).filter(n => !isNaN(n));
  let total = parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (total <= 1) return refreshAll();
  total--;
  updateCountdown(total);
}

async function stakeBNB() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount || isNaN(amount)) return alert("Cantidad inválida");
  try {
    await contract.methods.stake().send({
      from: userAccount,
      value: Web3.utils.toWei(amount, "ether"),
    });
    refreshAll();
  } catch (err) {
    console.error("Error al hacer stake:", err);
  }
}

async function withdrawStake() {
  try {
    await contract.methods.withdrawStake().send({ from: userAccount });
    refreshAll();
  } catch (err) {
    console.error("Error al retirar stake:", err);
  }
}

async function claimRewards() {
  try {
    await contract.methods.withdrawRewards().send({ from: userAccount });
    refreshAll();
  } catch (err) {
    console.error("Error al reclamar recompensas:", err);
  }
}

// === GRÁFICO DEL TESORO ===
let chart;
function renderChart(treasuryBNB) {
  const ctx = document.getElementById("treasuryChart").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Pool Tesoro"],
      datasets: [{
        label: "BNB en Tesoro",
        data: [parseFloat(treasuryBNB)],
        backgroundColor: "#00bcd4",
        borderWidth: 1,
      }],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
