// --- Konfigurasi Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyCyPi0BkSGOK03rgw7GrD2EbBi-TTBq5Cs",
    authDomain: "selsi-privatesale.firebaseapp.com",
    projectId: "selsi-privatesale",
    storageBucket: "selsi-privatesale.firebasestorage.app",
    messagingSenderId: "1009458074742",
    appId: "1:1009458074742:web:aaa84eff8151d3d22bbb57",
    measurementId: "G-PX0D4QPXY5",
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  // --- Wallet admin ---
  const CONTRACT_OWNER = "0x84daB97DF9d42c99e2da1cF4BcD45CE7BD8eB6DB";
  
  // --- Global ---
  let userAddress = null;
  
  // --- Connect Wallet ---
  async function connectWallet() {
    if (!window.ethereum) return alert("Install MetaMask dulu bro");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    userAddress = accounts[0];
  
    // Cek akses admin
    if (userAddress.toLowerCase() === CONTRACT_OWNER.toLowerCase()) {
      document.getElementById("dashboard").style.display = "block";
      await updateParticipantsTable();
    } else {
      alert("Wallet tidak punya akses admin");
    }
  
    document.getElementById("connectWalletBtn").textContent =
      userAddress.substring(0, 6) + "..." + userAddress.slice(-4);
  }
  
  // --- Tabel peserta ---
  async function updateParticipantsTable() {
    const tableBody = document.getElementById("participantsTable");
    tableBody.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";
  
    try {
      const snapshot = await db.collection("transactions").get();
      tableBody.innerHTML = "";
      let count = 1;
      snapshot.forEach((doc) => {
        const data = doc.data();
  
        // Format tanggal
        let ts = data.timestamp ? new Date(data.timestamp).toLocaleString() : "-";
  
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${count}</td>
          <td>${data.wallet || "-"}</td>
          <td>${data.usdt || 0}</td>
          <td>${data.selsi || 0}</td>
          <td>${data.solana || "-"}</td>
          <td>${data.email || "-"}</td>
        `;
        tableBody.appendChild(row);
        count++;
      });
  
      document.getElementById("totalParticipants").textContent = snapshot.size;
    } catch (err) {
      console.error(err);
      tableBody.innerHTML = "<tr><td colspan='7'>Error loading data</td></tr>";
    }
  }
  
  // --- Search table ---
  document.getElementById("searchInput").addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const rows = document.querySelectorAll("#participantsTable tr");
    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(searchTerm) ? "" : "none";
    });
  });
  
  // --- Event listener ---
  document.getElementById("connectWalletBtn").addEventListener("click", connectWallet);
  