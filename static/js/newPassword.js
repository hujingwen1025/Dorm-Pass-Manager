document.addEventListener('DOMContentLoaded', () => {
    window.debug = false
function dlog(text) {
    if (window.debug) {
        console.log(text)
    }
}

    function createAlertPopup(closetimeout, type = null, title, body, alertid = '') {
        let alertContainer = document.getElementById('alertContainer')
    
        let alertElement = document.createElement('div');
        alertElement.setAttribute('id', alertid)
        alertElement.classList.add('alert')
        dlog(type)
        if (type != null && type != undefined && type != '') {
            alertElement.classList.add(type)
        }
    
        let closeButton = document.createElement('span');
        closeButton.classList.add('closebtn')
        closeButton.setAttribute('onclick', "this.parentElement.remove()")
        closeButton.innerHTML = '&times;'
    
        let titleText = document.createElement('strong')
        titleText.textContent = title
    
        let bodyText = document.createElement('p')
        bodyText.innerHTML = body
    
        alertElement.appendChild(closeButton)
        alertElement.appendChild(titleText)
        alertElement.appendChild(bodyText)
    
        alertContainer.appendChild(alertElement)
    
        if (closetimeout != null) {
            let closeTimout = setTimeout(function () {alertElement.remove()}, closetimeout);
        }
    }

document.getElementById('submitNewPassword').onclick = async function(event) {
    event.preventDefault();
    
    const token = document.getElementById('token').value;
    const newPassword = document.getElementById('password').value;
    const rpPassword = document.getElementById('rppassword').value;

    if (newPassword != rpPassword) {
        createAlertPopup(5000, null, 'Error While Changing Password', 'The two passwords entered do not match')
    } else {
        const response = await fetch('/api/resetNewPassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'token': token,
                'newPassword': newPassword,
            }),
        });
        
        const result = await response.json();
        
        if (result.status === 'ok') {
            createAlertPopup(5000, 'success', 'Password Changed', 'Password changed and saved successfully')
            setTimeout(function () {window.location.href = '/';}, 5000)
        } else {
            createAlertPopup(5000, null, 'Error While Changing Password', result.errorinfo)
        }
    }
}})
