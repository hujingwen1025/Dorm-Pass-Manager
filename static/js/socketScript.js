function createAlertPopup(closetimeout, type = null, title, body, alertid = '') {
    let alertContainer = document.getElementById('alertContainer');

    let alertElement = document.createElement('div');
    alertElement.setAttribute('id', alertid);
    alertElement.classList.add('alert');
    dlog(type);
    if (type != null && type != undefined && type != '') {
        alertElement.classList.add(type);
    }

    let closeButton = document.createElement('span');
    closeButton.classList.add('closebtn');
    closeButton.setAttribute('onclick', "this.parentElement.remove()");
    closeButton.innerHTML = '&times;';

    let titleText = document.createElement('strong');
    titleText.textContent = title;

    let bodyText = document.createElement('p');
    bodyText.innerHTML = body;

    alertElement.appendChild(closeButton);
    alertElement.appendChild(titleText);
    alertElement.appendChild(bodyText);

    alertContainer.appendChild(alertElement);

    if (closetimeout != null) {
        let closeTimout = setTimeout(function () { alertElement.remove() }, closetimeout);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const socket = io.connect();
    socket.on("connect", () => {
        console.log("Socket connected successfully");
    });
    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });
    socket.on("error", (error) => {
        console.error("Socket error:", error);
    });

    socket.on("command", (cmd) => {
        console.log(cmd)
        switch (cmd.command) {
            case "signout":
                document.cookie.split(";").forEach((c) => {
                    document.cookie = c
                        .replace(/^ +/, "")
                        .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
                });

                if ('caches' in window) {
                    caches.keys().then(function(names) {
                        for (let name of names) caches.delete(name);
                    });
                }

                localStorage.clear();
                sessionStorage.clear();

                window.location = "/";
                break;
            case "alert":
                createAlertPopup(cmd.payload.closetimeout, cmd.payload.type, cmd.payload.title, cmd.payload.body, cmd.payload.alertid);
                break;
            case "reload":
                window.location.reload();
                break;
            case "redirect":
                window.location.href = cmd.payload.url;
                break;
            default:
                console.warn("Unknown command received:", cmd);
        }
    });
});
