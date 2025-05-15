// Dirección del contrato y ABI
const contractAddress = '0x56371bB33b99326F9fF267bEfc1CBaD7849173EE'; // reemplazar si cambia
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3;
let contract;
let currentAccount;

// Formatea BNB
function formatBNB(value) {
  return parseFloat(web3.utils.fromWei(value, 'ether')).toFixed(4) + " BNB";
}

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    currentAccount = accounts[0];
    contract = new web3.eth.Contract(contractABI, contractAddress);
    loadStats();
  } else {
    alert("MetaMask no está instalado");
  }
}

async function loadStats() {
  const [totalStaked, totalTreasury, totalDailyDiv] = await Promise.all([
    contract.methods.totalStaked().call(),
    contract.methods.totalTreasury().call(),
    contract.methods.getTotalDailyDividend().call()
  ]);

  document.getElementById("totalStaked").innerText = formatBNB(totalStaked);
  document.getElementById("totalTreasury").innerText = formatBNB(totalTreasury);
  document.getElementById("dailyDividend").innerText = formatBNB(totalDailyDiv);

  if (currentAccount) {
    const [
      stake, rewards, estimate, countdown
    ] = await Promise.all([
      contract.methods.users(currentAccount).call(),
      contract.methods.getPendingRewards(currentAccount).call(),
      contract.methods.getUserDailyDividendEstimate(currentAccount).call(),
      contract.methods.getTimeUntilNextDistribution(currentAccount).call()
    ]);

    document.getElementById("myStake").innerText = formatBNB(stake.stakedAmount);
    document.getElementById("myRewards").innerText = formatBNB(rewards);
    document.getElementById("nextPayout").innerText = formatCountdown(countdown);
  }

  updateChart(parseFloat(web3.utils.fromWei(totalTreasury, 'ether')));
}

function formatCountdown(seconds) {
  if (seconds <= 0) return "Disponible";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs}h ${mins}m ${secs}s`;
}

// Funciones del contrato

async function stakeBNB() {
  const amount = prompt("Cantidad a hacer stake (en BNB):");
  if (!amount || isNaN(amount)) return;

  const value = web3.utils.toWei(amount, 'ether');
  await contract.methods.stake().send({
    from: currentAccount,
    value: value
  });

  loadStats();
}

async function withdrawStake() {
  await contract.methods.withdrawStake().send({ from: currentAccount });
  loadStats();
}

async function claimRewards() {
  await contract.methods.withdrawRewards().send({ from: currentAccount });
  loadStats();
}

// Eventos
document.getElementById("connectWallet").addEventListener("click", connectWallet);
document.getElementById("stakeBtn").addEventListener("click", stakeBNB);
document.getElementById("withdrawBtn").addEventListener("click", withdrawStake);
document.getElementById("claimBtn").addEventListener("click", claimRewards);

// Gráfico de dividendos
let dividendChart;
function updateChart(currentValue) {
  const now = new Date().toLocaleTimeString();
  if (!dividendChart) {
    const ctx = document.getElementById("dividendChart").getContext("2d");
    dividendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [now],
        datasets: [{
          label: "Treasury Pool (BNB)",
          data: [currentValue],
          fill: false,
          borderColor: 'rgba(34,197,94,1)',
          tension: 0.3
        }]
      },
      options: {
        animation: {
          duration: 500
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  } else {
    if (dividendChart.data.labels.length > 20) {
      dividendChart.data.labels.shift();
      dividendChart.data.datasets[0].data.shift();
    }
    dividendChart.data.labels.push(now);
    dividendChart.data.datasets[0].data.push(currentValue);
    dividendChart.update();
  }
}
