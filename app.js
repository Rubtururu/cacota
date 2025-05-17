const contractAddress = '0x99874Ea86dD899CaCE932Af1B41ea406103f0708';
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStakedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"},{"internalType":"uint256","name":"nextDistributionIn","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3;
let contract;
let userAddress;

async function connectWallet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      userAddress = accounts[0];
      contract = new web3.eth.Contract(contractABI, contractAddress);

      document.getElementById('walletAddress').textContent = userAddress;
      await loadAllStats();
      await loadUserStats();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Error conectando wallet');
    }
  } else {
    alert('Por favor instala MetaMask');
  }
}

async function loadAllStats() {
  try {
    const stats = await contract.methods.getAllStats().call();

    document.getElementById('totalStaked').textContent = web3.utils.fromWei(stats._totalStaked, 'ether');
    document.getElementById('totalTreasury').textContent = web3.utils.fromWei(stats._totalTreasury, 'ether');
    document.getElementById('dailyDividend').textContent = web3.utils.fromWei(stats._dailyDividend, 'ether');
    document.getElementById('activeStakers').textContent = stats._activeStakers;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadUserStats() {
  try {
    const stats = await contract.methods.getUserStats(userAddress).call();

    const stakedBNB = web3.utils.fromWei(stats.stakedAmount, 'ether');
    const pendingRewardsBNB = web3.utils.fromWei(stats.pendingRewards, 'ether');
    const dailyEstimateBNB = web3.utils.fromWei(stats.dailyEstimate, 'ether');

    // Corregimos porcentaje de participación (userShare viene en formato 1e18)
    const userSharePercent = (parseFloat(stats.userShare) / 1e16).toFixed(2) + ' %';

    // Cuenta atrás en segundos, formateada a hh:mm:ss
    const nextDistSeconds = parseInt(stats.nextDistributionIn);
    const hours = Math.floor(nextDistSeconds / 3600);
    const minutes = Math.floor((nextDistSeconds % 3600) / 60);
    const seconds = nextDistSeconds % 60;
    const countdown = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;

    document.getElementById('userStaked').textContent = stakedBNB;
    document.getElementById('userPendingRewards').textContent = pendingRewardsBNB;
    document.getElementById('userDailyEstimate').textContent = dailyEstimateBNB;
    document.getElementById('userShare').textContent = userSharePercent;
    document.getElementById('userNextDistribution').textContent = countdown;

  } catch (error) {
    console.error('Error loading user stats:', error);
  }
}

async function stake() {
  const amount = document.getElementById('stakeAmount').value;
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    alert('Introduce una cantidad válida para apostar');
    return;
  }
  try {
    const value = web3.utils.toWei(amount, 'ether');
    await contract.methods.stake().send({ from: userAddress, value });
    alert('Stake realizado con éxito');
    await loadAllStats();
    await loadUserStats();
  } catch (error) {
    console.error('Stake failed:', error);
    alert('Error al hacer stake');
  }
}

async function withdrawStake() {
  try {
    await contract.methods.withdrawStake().send({ from: userAddress });
    alert('Stake retirado con éxito');
    await loadAllStats();
    await loadUserStats();
  } catch (error) {
    console.error('Withdraw stake failed:', error);
    alert('Error al retirar stake');
  }
}

async function withdrawPartialStake() {
  const amount = document.getElementById('withdrawAmount').value;
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    alert('Introduce una cantidad válida para retirar');
    return;
  }
  try {
    const value = web3.utils.toWei(amount, 'ether');
    await contract.methods.withdrawPartialStake(value).send({ from: userAddress });
    alert('Retiro parcial realizado con éxito');
    await loadAllStats();
    await loadUserStats();
  } catch (error) {
    console.error('Partial withdraw failed:', error);
    alert('Error al retirar parcialmente');
  }
}

async function withdrawRewards() {
  try {
    await contract.methods.withdrawRewards().send({ from: userAddress });
    alert('Recompensas retiradas con éxito');
    await loadAllStats();
    await loadUserStats();
  } catch (error) {
    console.error('Withdraw rewards failed:', error);
    alert('Error al retirar recompensas');
  }
}

// Si quieres, agrega eventos para refrescar estadísticas automáticamente cada X segundos
// o añade más funciones según tu necesidad
