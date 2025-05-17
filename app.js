const CONTRACT_ADDRESS = "0x99874Ea86dD899CaCE932Af1B41ea406103f0708"; // Pon tu address
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStakedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"},{"internalType":"uint256","name":"nextDistributionIn","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3;
let contract;
let account;

// Conectar wallet
async function connectWallet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      account = accounts[0];
      contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      document.getElementById("walletAddress").innerText = account;
      document.getElementById("connectBtn").disabled = true;

      await loadAllStats();
      await loadUserStats();

      // Actualizar stats cada 30 seg para datos en vivo
      setInterval(() => {
        loadAllStats();
        loadUserStats();
      }, 30000);
    } catch (error) {
      alert("Error conectando wallet: " + error.message);
    }
  } else {
    alert("Instala MetaMask u otro wallet compatible");
  }
}

// Cargar estadísticas globales
async function loadAllStats() {
  try {
    const stats = await contract.methods.getAllStats().call();
    // Extraer propiedades (puede venir como objeto con keys o array-like)
    const totalStaked = stats._totalStaked || stats[0];
    const totalTreasury = stats._totalTreasury || stats[1];
    const dailyDividend = stats._dailyDividend || stats[2];
    const activeStakers = stats._activeStakers || stats[3];

    document.getElementById("totalStaked").innerText = web3.utils.fromWei(totalStaked, "ether") + " BNB";
    document.getElementById("totalTreasury").innerText = web3.utils.fromWei(totalTreasury, "ether") + " BNB";
    document.getElementById("dailyDividend").innerText = web3.utils.fromWei(dailyDividend, "ether") + " BNB";
    document.getElementById("activeStakers").innerText = activeStakers;
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

// Cargar estadísticas del usuario
async function loadUserStats() {
  if (!account) return;
  try {
    const userStats = await contract.methods.getUserStats(account).call();
    const stakedAmount = userStats.stakedAmount || userStats[0];
    const pendingRewards = userStats.pendingRewards || userStats[1];
    const dailyEstimate = userStats.dailyEstimate || userStats[2];
    const userShare = userStats.userShare || userStats[3];
    const nextDistributionIn = userStats.nextDistributionIn || userStats[4];

    document.getElementById("userStaked").innerText = web3.utils.fromWei(stakedAmount, "ether") + " BNB";
    document.getElementById("pendingRewards").innerText = web3.utils.fromWei(pendingRewards, "ether") + " BNB";
    document.getElementById("dailyEstimate").innerText = web3.utils.fromWei(dailyEstimate, "ether") + " BNB";
    document.getElementById("userShare").innerText = (userShare / 1e16).toFixed(2) + " %";
    document.getElementById("nextDistribution").innerText = formatSeconds(nextDistributionIn);
  } catch (error) {
    console.error("Error loading user stats:", error);
  }
}

// Stake (depositar BNB)
async function stake() {
  const input = document.getElementById("stakeAmount").value;
  if (!input || isNaN(input) || Number(input) <= 0) {
    alert("Introduce una cantidad válida para stakear");
    return;
  }
  const amountWei = web3.utils.toWei(input, "ether");
  try {
    await contract.methods.stake().send({ from: account, value: amountWei });
    alert("Stake exitoso!");
    document.getElementById("stakeAmount").value = "";
    await loadAllStats();
    await loadUserStats();
  } catch (error) {
    alert("Stake fallido: " + error.message);
  }
}

// Retirar todo el stake
async function withdrawStake() {
  try {
    await contract.methods.withdrawStake().send({ from: account });
    alert("Stake retirado exitosamente!");
    await loadAllStats();
    await loadUserStats();
  } catch (error) {
    alert("Error retirando stake: " + error.message);
  }
}

// Retirar stake parcial
async function withdrawPartial() {
  const input = document.getElementById("withdrawAmount").value;
  if (!input || isNaN(input) || Number(input) <= 0) {
    alert("Introduce una cantidad válida para retirar");
    return;
  }
  const amountWei = web3.utils.toWei(input, "ether");
  try {
    await contract.methods.withdrawPartialStake(amountWei).send({ from: account });
    alert("Retiro parcial exitoso!");
    document.getElementById("withdrawAmount").value = "";
    await loadAllStats();
    await loadUserStats();
  } catch (error) {
    alert("Error en retiro parcial: " + error.message);
  }
}

// Reclamar recompensas
async function withdrawRewards() {
  try {
    await contract.methods.withdrawRewards().send({ from: account });
    alert("Recompensas reclamadas!");
    await loadAllStats();
    await loadUserStats();
  } catch (error) {
    alert("Error reclamando recompensas: " + error.message);
  }
}

// Formatear segundos a hh:mm:ss
function formatSeconds(seconds) {
  seconds = Number(seconds);
  if (seconds <= 0) return "Ahora";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// Evento botón conectar
document.getElementById("connectBtn").addEventListener("click", connectWallet);
// Evento botones acciones
document.getElementById("stakeBtn").addEventListener("click", stake);
document.getElementById("withdrawBtn").addEventListener("click", withdrawStake);
document.getElementById("withdrawPartialBtn").addEventListener("click", withdrawPartial);
document.getElementById("withdrawRewardsBtn").addEventListener("click", withdrawRewards);
