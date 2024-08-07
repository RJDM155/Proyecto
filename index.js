var resp;
localStorage.setItem("user", "st3682@utr.edu.mx");
localStorage.setItem("password", "12344");


function main() {
    var user = document.getElementById("txtUser").value;
    var password = document.getElementById("txtPassword").value;

    if (resp !== undefined) {
        sendDataToServer(user, password);
    } else {
        alert("Please answer the captcha");
    }
}

function answer(response) {
    resp = response;
}

function sendDataToServer(user, password) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:3001/submit", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                window.location.href = "tabla.html";
            } else {
                console.error('Error:', xhr.responseText);
            }
        }
    };

    var data = JSON.stringify({
        "user": user,
        "password": password,
        "g-recaptcha-response": resp
    });
    xhr.send(data);
}
