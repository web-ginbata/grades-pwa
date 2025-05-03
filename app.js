let studentEmail = null;

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
});

function handleCredentialResponse(response) {
  const token = response.credential;
  const payload = JSON.parse(atob(token.split('.')[1]));
  studentEmail = payload.email;

  document.getElementById("login-section").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("student-name").textContent = payload.name;

  fetchGrades();
}

function fetchGrades() {
  fetch(`https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?email=${studentEmail}`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#grades-table tbody');
      tbody.innerHTML = '';
      data.grades.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.course}</td>
          <td>${row.grade}</td>
          <td><input data-row="${index}" value="${row.comment || ''}" onchange="postComment(event)" /></td>
        `;
        tbody.appendChild(tr);
      });
    });
}

function postComment(event) {
  const input = event.target;
  const index = input.dataset.row;
  const comment = input.value;
  fetch(`https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`, {
    method: 'POST',
    body: JSON.stringify({ email: studentEmail, row: index, comment }),
    headers: { 'Content-Type': 'application/json' }
  });
}
