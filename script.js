//const API_BASE = "http://127.0.0.1:5000";  // Change to your backend domain if deployed
const API_BASE = "http://my-flask-env.eba-nhczj93m.us-west-2.elasticbeanstalk.com"

const employeeForm = document.getElementById("employee-form");
const employeeList = document.getElementById("employee-list");
const uploadForm = document.getElementById("upload-form");
const uploadResult = document.getElementById("upload-result");

// Load all employees on page load
window.onload = () => {
  loadEmployees();
};

// Fetch and display employees
async function loadEmployees() {
  try {
    const res = await fetch(`${API_BASE}/employees`);
    const employees = await res.json();

    employeeList.innerHTML = "";

    employees.forEach(emp => {
      const li = document.createElement("li");

      // === Employee Picture ===
      if (emp.picture_url) {
        const img = document.createElement("img");
        img.src = emp.picture_url;
        img.alt = emp.name;
        li.appendChild(img);
      }

      // === Employee Info ===
      const infoDiv = document.createElement("div");
      infoDiv.className = "employee-info";

      const fields = [
        ["Name:", emp.name],
        ["Position:", emp.position],
        ["Email:", emp.email],
        ["ID:", emp.id_number],
        ["Hire date:", emp.hire_date],
        ["Hours:", emp.hours_worked],
        ["Salary:", `$${emp.salary}`]
      ];

      fields.forEach(([label, value]) => {
        const labelDiv = document.createElement("div");
        labelDiv.textContent = label;
        const valueDiv = document.createElement("div");
        valueDiv.textContent = value;
        infoDiv.appendChild(labelDiv);
        infoDiv.appendChild(valueDiv);
      });

      li.appendChild(infoDiv);

      // === Actions (Edit/Delete) ===
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "employee-actions";

      // Edit Button
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.className = "edit-btn";
      editBtn.addEventListener("click", () => {
        document.getElementById("name").value = emp.name;
        document.getElementById("position").value = emp.position;
        document.getElementById("email").value = emp.email;
        document.getElementById("id_number").value = emp.id_number;
        document.getElementById("hire_date").value = emp.hire_date;
        document.getElementById("hours_worked").value = emp.hours_worked;
        document.getElementById("salary").value = emp.salary || 0;

        employeeForm.dataset.editingId = emp.id;
        document.querySelector("button[type='submit']").textContent = "Update Employee";
      });

      // Delete Button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "delete-btn";
      deleteBtn.addEventListener("click", async () => {
        if (confirm(`Are you sure you want to delete ${emp.name}?`)) {
          await deleteEmployee(emp.id);
        }
      });

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);
      li.appendChild(actionsDiv);

      // Add to list
      employeeList.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading employees:", err);
  }
}

async function deleteEmployee(id) {
  try {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: "DELETE"
    });

    if (res.ok) {
      loadEmployees(); // Refresh list
    } else {
      const error = await res.json();
      alert(`Failed to delete employee: ${error.error || res.statusText}`);
    }
  } catch (err) {
    console.error("Error deleting employee:", err);
    alert("Could not delete employee.");
  }
}

// Handle new employee form submission (with image support)
employeeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const editingId = employeeForm.dataset.editingId;
  const fileInput = document.getElementById("picture");
  const file = fileInput ? fileInput.files[0] : null;

  let body;
  let headers = {};

  if (file) {
    body = new FormData();
    body.append("name", document.getElementById("name").value);
    body.append("position", document.getElementById("position").value);
    body.append("email", document.getElementById("email").value);
    body.append("id_number", document.getElementById("id_number").value);
    body.append("hire_date", document.getElementById("hire_date").value);
    body.append("hours_worked", document.getElementById("hours_worked").value);
    body.append("salary", document.getElementById("salary").value);
    body.append("picture", file);
  } else {
    body = JSON.stringify({
      name: document.getElementById("name").value,
      position: document.getElementById("position").value,
      email: document.getElementById("email").value,
      id_number: document.getElementById("id_number").value,
      hire_date: document.getElementById("hire_date").value,
      hours_worked: parseInt(document.getElementById("hours_worked").value),
      salary: parseFloat(document.getElementById("salary").value) || 0
    });
    headers["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(`${API_BASE}/employees${editingId ? "/" + editingId : ""}`, {
      method: editingId ? "PUT" : "POST",
      headers,
      body
    });

    if (!res.ok) {
      const error = await res.json();
      alert(`Error: ${error.error || res.statusText}`);
      return;
    }

    employeeForm.reset();
    delete employeeForm.dataset.editingId;
    document.querySelector("button[type='submit']").textContent = "Add Employee";
    loadEmployees();
  } catch (err) {
    console.error("Error saving employee:", err);
    alert("Failed to save employee.");
  }
});

// Handle file upload form
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById("file");
  const file = fileInput.files[0];
  if (!file) return alert("Please select a file to upload.");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    uploadResult.textContent = `File uploaded to: ${data.file_url}`;
  } catch (err) {
    console.error("Error uploading file:", err);
    uploadResult.textContent = "Upload failed.";
  }
});