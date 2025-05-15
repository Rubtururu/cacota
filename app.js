// app.js adaptado al contrato real que me diste

const contractAddress = "0x56371bb33b99326f9ff267befc1cbad7849173ee";

const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3;
let contract;
let userAddress;

const connectWalletBtn = document.getElementById("connectWallet");
const stakeBtn = document.getElementById("stakeButton");
const withdrawStakeBtn = document.getElementById("withdrawStakeButton");
const withdrawRewardsBtn = document.getElementById("withdrawRewardsButton");
const stakeAmountInput = document.getElementById("stakeAmount");

const totalStakedEl = document.getElementById("totalStaked");
const totalTreasuryEl = document.getElementById("totalTreasury");
const totalDailyDividendEl = document.getElementById("totalDailyDividend");
const totalUsersEl = document.getElementById("totalUsers");

const userShareEl = document.getElementById("userShare");
const userStakedEl = document.getElementById("userStaked");
const pendingRewardsEl = document.getElementById("pendingRewards");
const dailyEstimateEl = document.getElementById("dailyEstimate");
const nextDistributionEl = document.getElementById("nextDistribution");

// Chart.js setup
let chart;
const ctx = document.getElementById('bnbChart').getContext('2d');

function initChart() {
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Dividendos Diarios (BNB)',
        data: [],
        fill: true,
        backgroundColor: 'rgba(136, 192, 208, 0.3)',
        borderColor: 'rgba(136, 192, 208, 1)',
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
      }]
    },
    options: {
      responsive: true,
      interaction: { mode: 'nearest', intersect: false },
      scales: {
        x: { title: { display: true, text: 'Fecha' } },
        y: { title: { display: true, text: 'BNB' }, beginAtZero: true }
      },
      plugins: { legend: { display: true, position: 'top' }, tooltip: { enabled: true } }
    }
  });
}

function updateChart() {
  // Datos simulados últimos 7 días
  const labels = [];
  const data = [];
  for(let i=6; i>=0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString());
    data.push((Math.random() * 0.1 + 0.01).toFixed(4));
  }
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

function formatBNB(value) {
  if (!value) return "0.0000";
  return Number(web3.utils.fromWei(value.toString(), 'ether')).toFixed(4);
}

function formatPercent(value) {
  if (!value) return "0.0000";
  return (Number(value) * 100).toFixed(4);
}

function showError(error) {
  console.error(error);
  alert("Error: " + (error.message || error));
}

async function connectWallet() {
  if(window.ethereum){
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      userAddress = accounts[0];
      connectWalletBtn.textContent = "Wallet Conectada";
      connectWalletBtn.disabled = true;
      contract = new web3.eth.Contract(contractABI, contractAddress);
      refreshAllData();
    } catch(e) {
      showError(e);
    }
  } else {
    alert("Necesitas instalar MetaMask para usar esta dApp.");
  }
}

async function refreshAllData() {
  if(!contract) return;
  try {
    // Global
    const totalStaked = await contract.methods.totalStaked().call();
    const totalTreasury = await contract.methods.totalTreasury().call();
    const totalDailyDividend = await contract.methods.getTotalDailyDividend().call();
    const stakers = await contract.methods.stakers().call();

    totalStakedEl.textContent = formatBNB(totalStaked);
    totalTreasuryEl.textContent = formatBNB(totalTreasury);
    totalDailyDividendEl.textContent = formatBNB(totalDailyDividend);
    totalUsersEl.textContent = stakers.length;

    if(userAddress){
      // User
      const userShare = await contract.methods.getUserShare(userAddress).call();
      // Nota: El contrato no expone directamente cuánto BNB stakeó el usuario, se muestra N/A
      const pendingRewards = await contract.methods.getPendingRewards(userAddress).call();
      const dailyEstimate = await contract.methods.getUserDailyDividendEstimate(userAddress).call();
      const timeUntilNextDistribution = await contract.methods.getTimeUntilNextDistribution(userAddress).call();

      userShareEl.textContent = (Number(userShare) / 1e18 * 100).toFixed(4) + " %";
      userStakedEl.textContent = "N/A";
      pendingRewardsEl.textContent = formatBNB(pendingRewards);
      dailyEstimateEl.textContent = formatBNB(dailyEstimate);

      startNextDistributionCountdown(timeUntilNextDistribution);
    }
  } catch(err) {
    showError(err);
  }
}

let timerInterval;

function startNextDistributionCountdown(seconds) {
  clearInterval(timerInterval);
  let remaining = Number(seconds);
  if(remaining <= 0) {
    nextDistributionEl.textContent = "Distribución en proceso...";
    return;
  }
  function tick() {
    if(remaining <= 0) {
      nextDistributionEl.textContent = "Distribución disponible!";
      clearInterval(timerInterval);
      refreshAllData();
      return;
    }
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    nextDistributionEl.textContent = `${mins}m ${secs}s`;
    remaining--;
  }
  tick();
  timerInterval = setInterval(tick, 1000);
}

async function stake() {
  if(!contract || !userAddress) return alert("Conéctate primero.");
  let amount = stakeAmountInput.value;
  if(!amount || isNaN(amount) || Number(amount) <= 0) return alert("Ingresa un monto válido.");
  const valueWei = web3.utils.toWei(amount, 'ether');

  try {
    await contract.methods.stake().send({ from: userAddress, value: valueWei });
    alert("Stake realizado con éxito!");
    stakeAmountInput.value = "";
    refreshAllData();
  } catch(err) {
    showError(err);
  }
}
async function withdrawStake() {
if(!contract || !userAddress) return alert("Conéctate primero.");
try {
await contract.methods.withdrawStake().send({ from: userAddress });
alert("Stake retirado con éxito!");
refreshAllData();
} catch(err) {
showError(err);
}
}

async function withdrawRewards() {
if(!contract || !userAddress) return alert("Conéctate primero.");
try {
await contract.methods.withdrawRewards().send({ from: userAddress });
alert("Recompensas retiradas con éxito!");
refreshAllData();
} catch(err) {
showError(err);
}
}

function setupEventListeners() {
stakeBtn.onclick = stake;
withdrawStakeBtn.onclick = withdrawStake;
withdrawRewardsBtn.onclick = withdrawRewards;
connectWalletBtn.onclick = connectWallet;
}

async function main() {
if(window.ethereum){
web3 = new Web3(window.ethereum);
setupEventListeners();
initChart();
updateChart();
setInterval(refreshAllData, 30000); // Refrescar cada 30 segundos
} else {
alert("Necesitas instalar MetaMask para usar esta dApp.");
}
}

main();
