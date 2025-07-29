document.addEventListener('DOMContentLoaded', () => {
document.getElementById('submitNewPassword').onclick = async function(event) {
    event.preventDefault();
    
    const token = document.getElementById('token').value;
    const newPassword = document.getElementById('password').value;
    const rpPassword = document.getElementById('rppassword').value;

    if (newPassword != rpPassword) {
        Swal.fire({
            icon: "error",
            title: "Passwords Do Not Match",
            text: "The two passwords entered do not match",
        });
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
            Swal.fire({
                icon: "success",
                title: "Passwords Has Been Reset",
                text: "You will be redirected back",
            });
            setTimeout(() => {window.location.href = '/';}, 5000);
        } else {
            Swal.fire({
                icon: "error",
                title: "Password Reset Error",
                text: result.errorinfo,
            });
        }
    }
}})
