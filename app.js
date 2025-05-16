const contractAddress = '0x99874ea86dd899cace932af1b41ea406103f0708';

const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStakedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"},{"internalType":"uint256","name":"nextDistributionIn","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3;
let contract;
let userAccount;

window.addEventListener("load", async () => {
  if (typeof window.ethereum !== "undefined") {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    userAccount = accounts[0];
    contract = new web3.eth.Contract(abi, contractAddress);
    updateData();
    setInterval(updateData, 10000);
  } else {
    alert("Instala MetaMask para usar la dApp");
  }
});

async function updateData() {
  try {
    const [totalStaked, totalTreasury, totalDividend, activeStakers] =
      await contract.methods.getAllStats().call();

    const [staked, rewards, daily, share, nextTime] =
      await contract.methods.getUserStats(userAccount).call();

    document.getElementById("totalStaked").textContent = web3.utils.fromWei(totalStaked);
    document.getElementById("totalTreasury").textContent = web3.utils.fromWei(totalTreasury);
    document.getElementById("totalDividend").textContent = web3.utils.fromWei(totalDividend);
    document.getElementById("activeStakers").textContent = activeStakers;

    document.getElementById("userStake").textContent = web3.utils.fromWei(staked);
    document.getElementById("pendingRewards").textContent = web3.utils.fromWei(rewards);
    document.getElementById("dailyEstimate").textContent = web3.utils.fromWei(daily);
    document.getElementById("userShare").textContent = (share / 1e16).toFixed(2); // % directo
    document.getElementById("timeToNext").textContent = formatCountdown(nextTime);
  } catch (err) {
    console.error("Error cargando datos:", err);
  }
}

function formatCountdown(seconds) {
  if (seconds <= 0) return "¡Listo!";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

async function stake() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount || isNaN(amount)) return alert("Cantidad inválida");
  try {
    await contract.methods.stake().send({
      from: userAccount,
      value: web3.utils.toWei(amount)
    });
    updateData();
  } catch (err) {
    console.error("Error al hacer stake:", err);
  }
}

async function withdrawStake() {
  try {
    await contract.methods.withdrawStake().send({ from: userAccount });
    updateData();
  } catch (err) {
    console.error("Error al retirar todo:", err);
  }
}

async function withdrawPartial() {
  const amount = prompt("¿Cuánto deseas retirar?");
  if (!amount || isNaN(amount)) return;
  try {
    await contract.methods.withdrawPartialStake(web3.utils.toWei(amount)).send({ from: userAccount });
    updateData();
  } catch (err) {
    console.error("Error al retirar parcial:", err);
  }
}

async function claimRewards() {
  try {
    await contract.methods.withdrawRewards().send({ from: userAccount });
    updateData();
  } catch (err) {
    console.error("Error al reclamar recompensas:", err);
  }
}
