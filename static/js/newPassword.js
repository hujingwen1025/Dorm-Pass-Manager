document.addEventListener('DOMContentLoaded', () => {
document.getElementById('submitNewPassword').onclick = async function(event) {
    event.preventDefault();
    
    const token = document.getElementById('token').value;
    const newPassword = document.getElementById('password').value;
    const rpPassword = document.getElementById('rppassword').value;

    if (newPassword != rpPassword) {
        alert('The two passwords entered do not match');
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
            alert('Password reset successfully');
            window.location.href = '/';
        } else {
            alert(`Error: ${result.errorinfo}`);
        }
    }
}})
