// app.js

const contractAddress = "0x99874Ea86dD899CaCE932Af1B41ea406103f0708"; // Dirección del contrato en testnet BSC
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStakedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"},{"internalType":"uint256","name":"nextDistributionIn","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3;
let contract;
let userAddress;
let stakingChart;

async function connectWallet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      userAddress = accounts[0];
      contract = new web3.eth.Contract(contractABI, contractAddress);
      document.getElementById("walletAddress").innerText = "Conectado: " + userAddress;
      await loadStats();
    } catch (error) {
      alert("Error al conectar MetaMask: " + error.message);
    }
  } else {
    alert("Por favor instala MetaMask para continuar.");
  }
}

async function loadStats() {
  if (!contract) return;

  try {
    const totalStakedWei = await contract.methods.totalStaked().call();
    const totalTreasuryWei = await contract.methods.totalTreasury().call();
    const userPendingRewardsWei = await contract.methods.getPendingRewards(userAddress).call();
    const userDailyDivWei = await contract.methods.getUserDailyDividendEstimate(userAddress).call();
    const timeUntilNextDist = await contract.methods.getTimeUntilNextDistribution(userAddress).call();
    const totalDailyDivWei = await contract.methods.getTotalDailyDividend().call();

    const totalStaked = web3.utils.fromWei(totalStakedWei);
    const totalTreasury = web3.utils.fromWei(totalTreasuryWei);
    const userPendingRewards = web3.utils.fromWei(userPendingRewardsWei);
    const userDailyDiv = web3.utils.fromWei(userDailyDivWei);
    const totalDailyDiv = web3.utils.fromWei(totalDailyDivWei);

    document.getElementById("totalStaked").innerText = parseFloat(totalStaked).toFixed(4) + " BNB";
    document.getElementById("totalTreasury").innerText = parseFloat(totalTreasury).toFixed(4) + " BNB";
    document.getElementById("userPendingRewards").innerText = parseFloat(userPendingRewards).toFixed(6) + " BNB";
    document.getElementById("userDailyDividend").innerText = parseFloat(userDailyDiv).toFixed(6) + " BNB";
    document.getElementById("totalDailyDividend").innerText = parseFloat(totalDailyDiv).toFixed(4) + " BNB";

    // Tiempo restante en formato hh:mm:ss
    const hours = Math.floor(timeUntilNextDist / 3600);
    const minutes = Math.floor((timeUntilNextDist % 3600) / 60);
    const seconds = timeUntilNextDist % 60;
    document.getElementById("timeUntilNextDistribution").innerText = 
      `${hours.toString().padStart(2,"0")}:${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`;

    // Actualizar gráfica
    updateChart(totalStaked, totalTreasury, totalDailyDiv);

  } catch (e) {
    console.error("Error cargando estadísticas:", e);
  }
}

function updateChart(totalStaked, totalTreasury, totalDailyDiv) {
  const ctx = document.getElementById("stakingChart").getContext("2d");
  if (!stakingChart) {
    stakingChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Total Staked", "Treasury", "Daily Dividend Pool"],
        datasets: [{
          data: [totalStaked, totalTreasury, totalDailyDiv],
          backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });
  } else {
    stakingChart.data.datasets[0].data = [totalStaked, totalTreasury, totalDailyDiv];
    stakingChart.update();
  }
}

// Funciones para botones

async function stake() {
  const amountInput = document.getElementById("stakeAmount");
  let amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) {
    alert("Ingresa una cantidad válida para stakear.");
    return;
  }
  const amountWei = web3.utils.toWei(amount.toString());
  try {
    await contract.methods.stake().send({ from: userAddress, value: amountWei });
    alert("Stake realizado con éxito.");
    amountInput.value = "";
    await loadStats();
  } catch (e) {
    alert("Error al stakear: " + e.message);
    console.error(e);
  }
}

async function withdrawPartial() {
  const amountInput = document.getElementById("withdrawAmount");
  let amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) {
    alert("Ingresa una cantidad válida para retirar.");
    return;
  }
  const amountWei = web3.utils.toWei(amount.toString());
  try {
    await contract.methods.withdrawPartialStake(amountWei).send({ from: userAddress });
    alert("Retiro parcial realizado con éxito.");
    amountInput.value = "";
    await loadStats();
  } catch (e) {
    alert("Error al retirar parcialmente: " + e.message);
    console.error(e);
  }
}

async function withdrawAll() {
  try {
    await contract.methods.withdrawStake().send({ from: userAddress });
    alert("Retiro total realizado con éxito.");
    await loadStats();
  } catch (e) {
    alert("Error al retirar stake: " + e.message);
    console.error(e);
  }
}

async function claimRewards() {
  try {
    await contract.methods.withdrawRewards().send({ from: userAddress });
    alert("Recompensas reclamadas con éxito.");
    await loadStats();
  } catch (e) {
    alert("Error al reclamar recompensas: " + e.message);
    console.error(e);
  }
}

function setupButtons() {
  document.getElementById("btnStake").addEventListener("click", stake);
  document.getElementById("btnWithdrawPartial").addEventListener("click", withdrawPartial);
  document.getElementById("btnWithdraw").addEventListener("click", withdrawAll);
  document.getElementById("btnClaimRewards").addEventListener("click", claimRewards);
}

window.addEventListener("load", async () => {
  setupButtons();
  await connectWallet();

  // Actualizar cada 30 segundos
  setInterval(loadStats, 30000);
});
