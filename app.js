let studentEmail = null;
const API_URL = 'https://script.google.com/macros/s/AKfycbzLs8twfCyO5ADDVK4ucB0pgNZXvGjJwEoPLYFhPkoPJ6I6p7dHkgKn28nnVdTDMQwRCw/exec';
const CLIENT_ID = '75854195776-6ir2qmqbvlpb4k3rgid269toino26nf4.apps.googleusercontent.com';

let userEmail = '';

// Initialize Google Identity Services

window.onload = function () {
  //alert("Function google.accounts.id.initialize called");
  google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: handleCredentialResponse
  });
  //alert("After handleCredentialResponse");

  google.accounts.id.renderButton(
    document.getElementById('loginDiv'),
    { theme: 'outline', size: 'large' }
  );

  google.accounts.id.prompt(); // Auto prompt
};

function handleCredentialResponse(response) {
  // Decode the JWT token to extract user info
  //alert("Function handleCredentialResponse called");
  const user = parseJwt(response.credential);
  userEmail = user.email;

  // Hide login, show app
  document.getElementById('loginDiv').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  // Fetch grades
  fetch(`${API_URL}?email=${encodeURIComponent(userEmail)}`)
    .then(res => res.json())
    .then(data => {
      renderGrades(data.grades);
    })
    .catch(err => {
      alert('Error fetching grades.');
      console.error(err);
    });
}

function renderGrades(grades) {
  const app = document.getElementById('app');
  app.innerHTML = '<h2>Your Grades</h2>';

  grades.forEach((item, index) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <strong>${item.course}</strong>: ${item.grade}<br>
      Comment: <input type="text" id="comment-${index}" value="${item.comment || ''}">
      <button onclick="submitComment(${index})">Submit</button>
      <hr>
    `;
    app.appendChild(div);
  });
}

function submitComment(index) {
  const commentInput = document.getElementById(`comment-${index}`);
  const comment = commentInput.value;

  fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ email: userEmail, row: index, comment }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
    })
    .catch(err => {
      alert('Error submitting comment.');
      console.error(err);
    });
}

// JWT decoder for email
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
  );
  return JSON.parse(jsonPayload);
}
