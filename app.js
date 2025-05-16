const contractAddress = "0x99874Ea86dD899CaCE932Af1B41ea406103f0708";

const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStakedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"},{"internalType":"uint256","name":"nextDistributionIn","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3, contract, userAddress;

const connectBtn = document.getElementById("connectWallet");
const stakeInput = document.getElementById("stakeAmount");
const stakeBtn = document.getElementById("stakeButton");
const withdrawPartialBtn = document.getElementById("withdrawStakeButton");
const claimBtn = document.getElementById("withdrawRewardsButton");

const elTotalStaked = document.getElementById("totalStaked");
const elTotalTreasury = document.getElementById("totalTreasury");
const elDailyDividend = document.getElementById("totalDailyDividend");
const elActiveStakers = document.getElementById("totalUsers");

const elUserStaked = document.getElementById("userStaked");
const elPending = document.getElementById("pendingRewards");
const elEstimate = document.getElementById("dailyEstimate");
const elShare = document.getElementById("userShare");
const elNextDist = document.getElementById("nextDistribution");

// Chart.js placeholders
let chart, ctx = document.getElementById("bnbChart").getContext("2d");
function initChart() { /* opcional */ }
function updateChart() { /* opcional */ }

const fmtBNB = v => Number(web3.utils.fromWei(v.toString(), 'ether')).toFixed(4);
const fmtPct = v => (Number(v) / 1e16).toFixed(4);

async function connectWallet() {
  if (!window.ethereum) return alert("Instala MetaMask");
  web3 = new Web3(window.ethereum);
  const accs = await ethereum.request({ method: 'eth_requestAccounts' });
  userAddress = accs[0];
  connectBtn.textContent = userAddress.slice(0, 6) + "…" + userAddress.slice(-4);
  contract = new web3.eth.Contract(contractABI, contractAddress);
  refreshAll();
  initChart(); updateChart();
}

async function refreshAll() {
  try {
    // ✅ GLOBAL STATS usando métodos individuales
    const totSt = await contract.methods.totalStaked().call();
    const totT = await contract.methods.totalTreasury().call();
    const dailyD = await contract.methods.getTotalDailyDividend().call();

    let active = "-";
    try {
      active = await contract.methods.activeStakers().call();
    } catch (e) {
      console.warn("activeStakers() no disponible");
    }

    elTotalStaked.textContent = fmtBNB(totSt) + " BNB";
    elTotalTreasury.textContent = fmtBNB(totT) + " BNB";
    elDailyDividend.textContent = fmtBNB(dailyD) + " BNB";
    elActiveStakers.textContent = active;

    if (!userAddress) return;

    // ✅ USER STATS
    const us = await contract.methods.getUserStats(userAddress).call();
    elUserStaked.textContent = fmtBNB(us.stakedAmount) + " BNB";
    elPending.textContent = fmtBNB(us.pendingRewards) + " BNB";
    elEstimate.textContent = fmtBNB(us.dailyEstimate) + " BNB";
    elShare.textContent = fmtPct(us.userShare) + " %";
    elNextDist.textContent = formatCountdown(Number(us.nextDistributionIn));

  } catch (err) {
    console.error("Error obteniendo estadísticas:", err);
  }
}

function formatCountdown(sec) {
  if (sec <= 0) return "Disponible";
  const h = Math.floor(sec / 3600),
    m = Math.floor((sec % 3600) / 60),
    s = sec % 60;
  return `${h}h ${m}m ${s}s`;
}

async function doStake() {
  const amt = stakeInput.value;
  if (!amt || amt <= 0) return alert("Monto inválido");
  const val = web3.utils.toWei(amt, 'ether');
  await contract.methods.stake().send({ from: userAddress, value: val });
  refreshAll();
}

async function doPartialWithdraw() {
  const amt = prompt("¿Cuánto BNB retirar? (ej: 0.1)");
  if (!amt || amt <= 0) return;
  const w = web3.utils.toWei(amt, 'ether');
  await contract.methods.withdrawPartialStake(w).send({ from: userAddress });
  refreshAll();
}

async function doClaim() {
  await contract.methods.withdrawRewards().send({ from: userAddress });
  refreshAll();
}

// Eventos
connectBtn.onclick = connectWallet;
stakeBtn.onclick = doStake;
withdrawPartialBtn.onclick = doPartialWithdraw;
claimBtn.onclick = doClaim;

window.addEventListener("load", () => {
  if (window.ethereum) connectBtn.onclick = connectWallet;
  else alert("Instala MetaMask");
});
