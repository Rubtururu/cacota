const contractAddress = '0x99874Ea86dD899CaCE932Af1B41ea406103f0708'; // Cambia esto por la dirección real
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStakedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"},{"internalType":"uint256","name":"nextDistributionIn","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3;
let contract;
let intervalCountdown;

window.addEventListener('load', async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(contractABI, contractAddress);
  } else {
    alert("Por favor instala MetaMask o un wallet compatible.");
  }
});

async function connectWallet() {
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      alert("No hay cuentas disponibles.");
      return;
    }
    document.getElementById('walletAddress').textContent = accounts[0];
    await loadAllStats();
    await loadUserStats();
  } catch (error) {
    alert("Error conectando la wallet");
    console.error(error);
  }
}

async function loadAllStats() {
  try {
    const stats = await contract.methods.getAllStats().call();

    // stats es un objeto con propiedades _totalStaked, _totalTreasury, _dailyDividend, _activeStakers
    document.getElementById('totalStaked').textContent = Number(web3.utils.fromWei(stats._totalStaked)).toFixed(4);
    document.getElementById('totalTreasury').textContent = Number(web3.utils.fromWei(stats._totalTreasury)).toFixed(4);
    document.getElementById('dailyDividend').textContent = Number(web3.utils.fromWei(stats._dailyDividend)).toFixed(4);
    document.getElementById('activeStakers').textContent = stats._activeStakers;
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

function formatTime(seconds) {
  if (seconds <= 0) return "00:00:00";
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

async function loadUserStats() {
  try {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      // No wallet connected
      return;
    }
    const userAddr = accounts[0];

    const result = await contract.methods.getUserStats(userAddr).call();

    const stakedAmount = Number(web3.utils.fromWei(result.stakedAmount)).toFixed(4);
    const pendingRewards = Number(web3.utils.fromWei(result.pendingRewards)).toFixed(4);
    const dailyEstimate = Number(web3.utils.fromWei(result.dailyEstimate)).toFixed(4);

    // userShare es un uint con 18 decimales, convertimos a porcentaje:
    // porcentaje = (userShare / 1e18) * 100
    const userSharePercent = (parseFloat(result.userShare) / 1e16).toFixed(2); // Dividir por 1e16 da % con 2 decimales

    let nextDistSeconds = parseInt(result.nextDistributionIn);
    if (isNaN(nextDistSeconds)) nextDistSeconds = 0;

    document.getElementById('userStaked').textContent = stakedAmount;
    document.getElementById('userPendingRewards').textContent = pendingRewards;
    document.getElementById('userDailyEstimate').textContent = dailyEstimate;
    document.getElementById('userShare').textContent = `${userSharePercent} %`;

    // Limpia interval previo
    if (intervalCountdown) clearInterval(intervalCountdown);

    // Actualiza la cuenta regresiva cada segundo
    function updateCountdown() {
      if (nextDistSeconds <= 0) {
        document.getElementById('userNextDistribution').textContent = "Reparto listo";
        clearInterval(intervalCountdown);
        return;
      }
      document.getElementById('userNextDistribution').textContent = formatTime(nextDistSeconds);
      nextDistSeconds--;
    }

    updateCountdown();
    intervalCountdown = setInterval(updateCountdown, 1000);

  } catch (error) {
    console.error("Error loading user stats:", error);
  }
}

// Función para stake (apostar)
async function stake() {
  try {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      alert("Conecta primero tu wallet.");
      return;
    }
    const amountInput = document.getElementById('stakeAmount').value;
    if (!amountInput || isNaN(amountInput) || parseFloat(amountInput) <= 0) {
      alert("Introduce un valor válido para apostar.");
      return;
    }

    const valueWei = web3.utils.toWei(amountInput, 'ether');
    await contract.methods.stake().send({ from: accounts[0], value: valueWei });
    alert("Stake realizado con éxito.");
    await loadAllStats();
    await loadUserStats();
  } catch (error) {
    alert("Error en el stake: " + (error.message || error));
    console.error(error);
  }
}

// Función para retirar todo el stake
async function withdrawStake() {
  try {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      alert("Conecta primero tu wallet.");
      return;
    }

    await contract.methods.withdrawStake().send({ from: accounts[0] });
    alert("Stake retirado con éxito.");
    await loadAllStats();
    await loadUserStats();
  } catch (error) {
    alert("Error en withdrawStake: " + (error.message || error));
    console.error(error);
  }
}

// Función para retirar parte del stake
async function withdrawPartialStake() {
  try {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      alert("Conecta primero tu wallet.");
      return;
    }
    const amountInput = document.getElementById('withdrawPartialAmount').value;
    if (!amountInput || isNaN(amountInput) || parseFloat(amountInput) <= 0) {
      alert("Introduce un valor válido para retirar.");
      return;
    }
    const valueWei = web3.utils.toWei(amountInput, 'ether');
    await contract.methods.withdrawPartialStake(valueWei).send({ from: accounts[0] });
    alert("Retiro parcial realizado con éxito.");
    await loadAllStats();
    await loadUserStats();
  } catch (error) {
    alert("Error en withdrawPartialStake: " + (error.message || error));
    console.error(error);
  }
}

// Función para reclamar recompensas
async function withdrawRewards() {
  try {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      alert("Conecta primero tu wallet.");
      return;
    }

    await contract.methods.withdrawRewards().send({ from: accounts[0] });
    alert("Recompensas reclamadas con éxito.");
    await loadAllStats();
    await loadUserStats();
  } catch (error) {
    alert("Error en withdrawRewards: " + (error.message || error));
    console.error(error);
  }
}
