function getParameterByName(name) {
    return new URLSearchParams(window.location.search).get(name);
}

document.addEventListener('DOMContentLoaded', () => {
    const studentName = getParameterByName('studentName')
    const studentInfo = getParameterByName('studentInfo')
    const studentTravelInfo = getParameterByName('studentTravelInfo')
    const studentImage = getParameterByName('studentImage')

    document.getElementById('studentName').textContent = studentName;
    document.getElementById('studentInfo').textContent = studentInfo;
    document.getElementById('studentTravelInfo').textContent = studentTravelInfo;

    if (studentImage != null) {
        document.getElementById('studentImage').src = studentImage;
    }
})