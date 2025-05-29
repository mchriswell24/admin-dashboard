// Firebase config (replace with your Firebase project settings)
const firebaseConfig = {
  apiKey: "AIzaSyArdOInTXbTnUKPrXU3GtKq3-6Hz-8yinc",
  authDomain: "admin-crud-98ba1.firebaseapp.com",
  projectId: "admin-crud-98ba1",
  storageBucket: "admin-crud-98ba1.firebasestorage.app",
  messagingSenderId: "214834543731",
  appId: "1:214834543731:web:8a732ee1f756be7956fe06",
  measurementId: "G-T5QY6C1FKQ"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function loadEmployees() {
  const tableBody = document.querySelector("#employeeTable tbody");
  tableBody.innerHTML = "";

  const departments = {};
  // Fetch Departments
  const deptSnapshot = await db.collection("Departments").get();
  deptSnapshot.forEach(doc => {
    departments[doc.id] = doc.data().DeptDescription;
  });

  // Fetch Employees
  const empSnapshot = await db.collection("Employees").get();
  empSnapshot.forEach(doc => {
    const emp = doc.data();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${emp.Eid}</td>
      <td>${emp.Name}</td>
      <td>${emp.Position}</td>
      <td>${departments[emp.DeptCode] || emp.DeptCode}</td>
      <td>${emp.Salary ? `₱${emp.Salary.toLocaleString()}` : "N/A"}</td>
      <td>
        <button class="edit-btn" onclick="editEmployee('${doc.id}')">Edit</button>
        <button class="delete-btn" onclick="deleteEmployee('${doc.id}')">Delete</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}
async function deleteEmployee(docId) {
  if (confirm("Are you sure you want to delete this employee?")) {
    await db.collection("Employees").doc(docId).delete();
    loadEmployees();
  }
}

function editEmployee(docId) {
  alert("Edit feature coming soon for ID: " + docId);
}

// Search filter
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("searchInput").addEventListener("input", function () {
    const filter = this.value.toLowerCase();
    const rows = document.querySelectorAll("#employeeTable tbody tr");
    rows.forEach(row => {
      const name = row.cells[1].textContent.toLowerCase();
      row.style.display = name.includes(filter) ? "" : "none";
    });
  });

  loadEmployees();
});

function openAddModal() {
  document.getElementById("addModal").style.display = "block";
}

function closeAddModal() {
  document.getElementById("addModal").style.display = "none";
  document.getElementById("addForm").reset();
}

document.getElementById("addForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  data.Eid = Number(data.Eid);
  data.Salary = Number(data.Salary);
  data.Age = Number(data.Age);

  try {
    await db.collection("Employees").add(data);
    closeAddModal();
    loadEmployees();
  } catch (err) {
    alert("Error adding employee: " + err.message);
  }
});

function openEditModal(docId, empData) {
  const form = document.getElementById("editForm");
  form.docId.value = docId;
  form.Eid.value = empData.Eid;
  form.Name.value = empData.Name;
  form.Position.value = empData.Position;
  form.Salary.value = empData.Salary;
  form.Age.value = empData.Age;
  form.Address.value = empData.Address;
  form.DeptCode.value = empData.DeptCode;

  document.getElementById("editModal").style.display = "block";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
  document.getElementById("editForm").reset();
}

function editEmployee(docId) {
  db.collection("Employees").doc(docId).get().then(doc => {
    if (doc.exists) {
      openEditModal(doc.id, doc.data());
    } else {
      alert("Employee not found.");
    }
  });
}

document.getElementById("editForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  const docId = data.docId;
  delete data.docId;

  data.Eid = Number(data.Eid);
  data.Salary = Number(data.Salary);
  data.Age = Number(data.Age);

  try {
    await db.collection("Employees").doc(docId).update(data);
    closeEditModal();
    loadEmployees();
  } catch (err) {
    alert("Error updating employee: " + err.message);
  }
});
