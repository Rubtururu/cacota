// app.js

// Dirección del contrato y ABI (simplificada, añadir ABI real)
const contractAddress = "0x56371bB33b99326F9fF267bEfc1CBaD7849173EE"; 
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

// Initialize Chart with empty data
function initChart() {
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [], // fechas
      datasets: [{
        label: 'Dividendos Diarios (BNB)',
        data: [],
        fill: true,
        backgroundColor: 'rgba(255, 206, 86, 0.3)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'nearest',
        intersect: false
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Fecha'
          }
        },
        y: {
          title: {
            display: true,
            text: 'BNB'
          },
          beginAtZero: true
        }
      },
      plugins: {
        legend: { display: true, position: 'top' },
        tooltip: { enabled: true }
      }
    }
  });
}

// Función para actualizar datos en la gráfica (simulada)
function updateChart() {
  // Ejemplo: Últimos 7 días con valores aleatorios o fijos, reemplaza con datos reales si tienes
  const labels = [];
  const data = [];
  for(let i=6; i>=0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString());
    // Datos simulados - reemplaza con lógica real si deseas
    data.push((Math.random() * 0.1 + 0.02).toFixed(4));
  }
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

// Formatea número BigNumber o string a BNB con 4 decimales
function formatBNB(value) {
  return Number(web3.utils.fromWei(value.toString(), 'ether')).toFixed(4);
}

// Formatea porcentaje con 4 decimales
function formatPercent(value) {
  return (Number(value) * 100).toFixed(4);
}

// Mostrar error en consola y alert (puedes mejorar)
function showError(error) {
  console.error(error);
  alert("Error: " + (error.message || error));
}

// Conectar wallet
async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      userAddress = accounts[0];
      connectWalletBtn.textContent = `Conectado: ${userAddress.slice(0,6)}...${userAddress.slice(-4)}`;
      contract = new web3.eth.Contract(contractABI, contractAddress);
      refreshAllData();
      setupEventListeners();
    } catch (err) {
      showError(err);
    }
  } else {
    alert("Por favor instala MetaMask o usa un navegador compatible con Web3.");
  }
}

// Refresca todas las estadísticas (globales y del usuario)
async function refreshAllData() {
  try {
    // Estadísticas globales
    const [totalStaked, totalTreasury, totalDailyDividend, stakers] = await Promise.all([
      contract.methods.totalStaked().call(),
      contract.methods.totalTreasury().call(),
      contract.methods.getTotalDailyDividend().call(),
      contract.methods.stakers().call(),
    ]);

    totalStakedEl.textContent = formatBNB(totalStaked) + " BNB";
    totalTreasuryEl.textContent = formatBNB(totalTreasury) + " BNB";
    totalDailyDividendEl.textContent = formatBNB(totalDailyDividend) + " BNB";
    totalUsersEl.textContent = stakers.length;

    // Estadísticas usuario
    if (!userAddress) return;

    const [userShare, pendingRewards, userDailyEstimate, nextDistribution] = await Promise.all([
      contract.methods.getUserShare(userAddress).call(),
      contract.methods.getPendingRewards(userAddress).call(),
      contract.methods.getUserDailyDividendEstimate(userAddress).call(),
      contract.methods.getTimeUntilNextDistribution(userAddress).call(),
    ]);

    userShareEl.textContent = formatPercent(userShare) + " %";
    userStakedEl.textContent = formatBNB(BigInt(totalStaked) * BigInt(userShare) / BigInt(1e18)) + " BNB";
    pendingRewardsEl.textContent = formatBNB(pendingRewards) + " BNB";
    dailyEstimateEl.textContent = formatBNB(userDailyEstimate) + " BNB";

    // Temporizador para próxima distribución (en segundos)
    updateNextDistributionTimer(nextDistribution);

  } catch (error) {
    showError(error);
  }
}

// Actualiza el temporizador para la próxima distribución cada segundo
let timerInterval;
function updateNextDistributionTimer(seconds) {
  clearInterval(timerInterval);
  if (seconds == 0) {
    nextDistributionEl.textContent = "Disponible ahora";
    return;
  }

  let remaining = Number(seconds);

  function update() {
    if (remaining <= 0) {
      nextDistributionEl.textContent = "Disponible ahora";
      clearInterval(timerInterval);
      refreshAllData(); // refresca datos al llegar a 0
      return;
    }
    const hrs = Math.floor(remaining / 3600);
    const mins = Math.floor((remaining % 3600) / 60);
    const secs = remaining % 60;
    nextDistributionEl.textContent = `${hrs}h ${mins}m ${secs}s`;
    remaining--;
  }
  update();
  timerInterval = setInterval(update, 1000);
}

// Stake (depositar BNB)
async function stake() {
  if (!userAddress) {
    alert("Conecta tu wallet primero.");
    return;
  }
  let amount = stakeAmountInput.value;
  if (!amount || amount <= 0) {
    alert("Ingresa una cantidad válida para hacer stake.");
    return;
  }
  try {
    const valueWei = web3.utils.toWei(amount.toString(), "ether");
    await contract.methods.stake().send({ from: userAddress, value: valueWei });
    alert(`Has hecho stake de ${amount} BNB correctamente.`);
    stakeAmountInput.value = "";
    refreshAllData();
  } catch (error) {
    showError(error);
  }
}

// Retirar stake
async function withdrawStake() {
  if (!userAddress) {
    alert("Conecta tu wallet primero.");
    return;
  }
  try {
    await contract.methods.withdrawStake().send({ from: userAddress });
    alert("Stake retirado correctamente.");
    refreshAllData();
  } catch (error) {
    showError(error);
  }
}

// Retirar recompensas
async function withdrawRewards() {
  if (!userAddress) {
    alert("Conecta tu wallet primero.");
    return;
  }
  try {
    await contract.methods.withdrawRewards().send({ from: userAddress });
    alert("Recompensas retiradas correctamente.");
    refreshAllData();
  } catch (error) {
    showError(error);
  }
}

// Event listeners para botones
function setupEventListeners() {
  stakeBtn.addEventListener("click", stake);
  withdrawStakeBtn.addEventListener("click", withdrawStake);
  withdrawRewardsBtn.addEventListener("click", withdrawRewards);
}

// Detectar cambio de cuenta en MetaMask
if(window.ethereum) {
  window.ethereum.on('accountsChanged', function (accounts) {
    if(accounts.length > 0) {
      userAddress = accounts[0];
      connectWalletBtn.textContent = `Conectado: ${userAddress.slice(0,6)}...${userAddress.slice(-4)}`;
      refreshAllData();
    } else {
      userAddress = null;
      connectWalletBtn.textContent = "Conectar Wallet";
    }
  });
}

// Inicialización al cargar la página
window.addEventListener("load", async () => {
  if(window.ethereum) {
    web3 = new Web3(window.ethereum);
    connectWalletBtn.addEventListener("click", connectWallet);
    initChart();
    updateChart();
  } else {
    alert("Por favor instala MetaMask o usa un navegador compatible con Web3.");
  }
});
