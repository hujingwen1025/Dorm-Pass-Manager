window.debug = false;

function dlog(text) {
    if (window.debug) {
        console.log(text);
    }
}

async function createNewStudentPass(studentid, destinationid) {
    try {
        const response = await fetch("/api/newPass", {
            method: 'POST',
            body: JSON.stringify({
                "studentid": studentid,
                "destinationid": destinationid
            }),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Request ERROR - status: ${response.status}`);
        }

        const responseJson = await response.json();

        switch (responseJson.status) {
            case "error":
                createAlertPopup(5000, null, 'Error Creating Pass', responseJson.errorinfo);
                return 'error';
            case "ok":
                return responseJson.passid;
            default:
                return 'error';
        }

    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server');
        return 'error';
    }
}

async function updateStudentPass(params) {
    try {
        const response = await fetch("/api/updatePass", {
            method: 'POST',
            body: JSON.stringify(params),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Request ERROR - status: ${response.status}`);
        }

        const responseJson = await response.json();

        switch (responseJson.status) {
            case "error":
                createAlertPopup(5000, null, 'Error Updating Pass', responseJson.errorinfo);
                return 'error';
            case "ok":
                return responseJson;
            default:
                return 'error';
        }

    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server');
        return 'error';
    }
}

async function getStudents(filters) {
    try {
        const response = await fetch("/api/getStudents", {
            method: 'POST',
            body: JSON.stringify({
                "filter": filters
            }),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Request ERROR - status: ${response.status}`);
        }

        const responseJson = await response.json();

        switch (responseJson.status) {
            case "error":
                createAlertPopup(5000, null, 'Error Fetching Students', responseJson.errorinfo);
                return 'error';
            case "ok":
                return responseJson.students;
            default:
                return 'error';
        }

    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server');
        return 'error';
    }
}

async function searchStudents(filters) {
    try {
        const response = await fetch("/api/searchStudents", {
            method: 'POST',
            body: JSON.stringify({
                "searchFilter": filters
            }),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Request ERROR - status: ${response.status}`);
        }

        const responseJson = await response.json();

        switch (responseJson.status) {
            case "error":
                createAlertPopup(5000, null, 'Error Fetching Students', responseJson.errorinfo);
                return 'error';
            case "ok":
                return responseJson.students;
            default:
                return 'error';
        }

    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server');
        return 'error';
    }
}

async function searchFilters(filters) {
    try {
        const response = await fetch("/api/searchFilters", {
            method: 'POST',
            body: JSON.stringify({
                "filter": filters
            }),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Request ERROR - status: ${response.status}`);
        }

        const responseJson = await response.json();

        switch (responseJson.status) {
            case "error":
                createAlertPopup(5000, null, 'Error Fetching Students', responseJson.errorinfo);
                return 'error';
            case "ok":
                return responseJson.students;
            default:
                return 'error';
        }

    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server');
        return 'error';
    }
}

async function setStudentIndex(studentsJson) {
    const studentListSlot = document.getElementById("studentList")

    studentListSlot.innerHTML = ""

    var students = []
    var studentsJson = await studentsJson
    for (i = 0; i < Object.keys(studentsJson).length; i ++) {
        students[i] = studentsJson[i]
    }
    students.forEach(curstudent => {
        var studentli = document.createElement('li')

        studentListSlot.appendChild(studentli)
        studentli.classList.add('list-item')
        studentli.setAttribute('id', `stu-${curstudent[2]}`)

        var studentNameDiv = document.createElement('div')
        var studentInfoDiv = document.createElement('div')
        var studentActionButton = document.createElement('button')
        var studentCreatePassButton = document.createElement('button')
        var studentEditButton = document.createElement('button')
        
        studentli.appendChild(studentNameDiv);
        studentli.appendChild(studentInfoDiv);
        studentli.appendChild(studentActionButton);
        studentli.appendChild(studentCreatePassButton);
        studentli.appendChild(studentEditButton);

        studentNameDiv.classList.add('studentNameDiv')
        studentInfoDiv.classList.add('studentInfoDiv')
        studentActionButton.classList.add('studentActionButton')
        studentCreatePassButton.classList.add('studentActionButton')
        studentEditButton.classList.add('studentActionButton')

        studentNameDiv.innerHTML = curstudent[0]

        studentInfoDiv.innerHTML = curstudent[1]
        studentActionButton.innerHTML = 'Actions'
        studentCreatePassButton.innerHTML = 'Add Pass'
        studentEditButton.innerHTML = 'Edit'

        studentActionButton.setAttribute('id', `actions-${curstudent[0]}`)
        studentCreatePassButton.setAttribute('id', `addpass-${curstudent[0]}`)
        studentEditButton.setAttribute('id', `edit-${curstudent[0]}`)
                                                                                                                                                                                                                                    
        document.getElementById(`actions-${curstudent[0]}`).onclick = function(event){
            alert(event.target.parentNode.id);
        }

        document.getElementById(`addpass-${curstudent[0]}`).onclick = function(event){
            renderCreateNewPassPopup(curstudent[3])
        }

        document.getElementById(`edit-${curstudent[0]}`).onclick = function(event){
            window.location = `/managePanel?editStudent=${curstudent[2]}`
        }
    })
}

async function setStudents(studentList) {
    if (window.destinationLocationJson == null) {
        window.destinationLocationJson = await getLocationId(1)
    }
    if (window.floorLocationJson == null) {
        window.floorLocationJson = await getLocationId(2)
    }
    var studentsInformation = await studentList
    if (studentsInformation == 'error') {
        return 0
    }
    //window.opo = studentsInformation
    let studentsJson = {}
    for (l = 0; l < studentsInformation.length; l ++) {
        let studentInfo  = await getStudentInfo(studentsInformation[l][0])
        let floorName = window.floorLocationJson[studentInfo[2]]
        let studentGrade = studentInfo[1]
        let studentName = studentInfo[0]
        let passid = studentsInformation[l][0]
        let flagged = studentsInformation[l][8]

        if (studentInfo == 'error') {
            createAlertPopup(5000, null, 'Error', 'Error while getting student info')
            return 0
        }

        studentsJson[l] = [studentName, `Grade ${studentGrade} ${floorName}`, studentsInformation[l][1], passid, flagged]
    }
    setStudentIndex(studentsJson)
}

async function getLocationIdFromName(locationName) {
    try {
        const response = await fetch("/api/searchLocations", {
            method: 'POST',
            body: JSON.stringify({
                "searchFilters": {'strictname': locationName}
            }),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Request ERROR - status: ${response.status}`);
        }

        const responseJson = await response.json();

        switch (responseJson.status) {
            case "error":
                createAlertPopup(5000, null, 'Error Fetching Location Info', responseJson.errorinfo);
                return 'error';
            case "ok":
                return responseJson.locations[0][0];
            default:
                return 'error';
        }

    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server');
        return 'error';
    }
}

async function setLocationFilter(option, locationJson) {
    var optionSlot = document.getElementById(option)
    var locations = []
    var locationJson = await locationJson
    for (i = 0; i < Object.keys(locationJson).length; i ++) {
        locations[i] = locationJson[Object.keys(locationJson)[i]]
    }
    locations.forEach(curlocation => {
        const option = document.createElement('option');
        option.text = curlocation;
        optionSlot.appendChild(option);
    });
}

async function getUserLocation() {
    try {
        const response = await fetch("/api/getUserLocation", {
            method: 'POST',
            body: JSON.stringify({}),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Request ERROR - status: ${response.status}`);
        }

        const responseJson = await response.json();

        switch (responseJson.status) {
            case "error":
                createAlertPopup(5000, null, 'Error While Getting User Location', responseJson.errorinfo)
                return 'error'
            case "ok":
                return responseJson.location
            default:
                return null
        }
        
    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return null
    }
}

async function getStudentInfo(studentid) {
    try {
        const response = await fetch("/api/getStudentInfo", {
            method: 'POST',
            body: JSON.stringify({
                "studentid": studentid
            }),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Request ERROR - status: ${response.status}`);
        }

        const responseJson = await response.json();

        switch (responseJson.status) {
            case "error":
                createAlertPopup(5000, null, 'Error Fetching Student Info', responseJson.errorinfo);
                return 'error';
            case "ok":
                return responseJson.studentinfo;
            default:
                return 'error';
        }

    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server');
        return 'error';
    }
}

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

async function setUsernameTopbar(username) {
    const usernameTopbarDispaly = document.getElementById("usernameTopbar")
    usernameTopbarDispaly.textContent = username
}

async function getUserInfo() {
    try {
        const response = await fetch("/api/getUserInfo", {
            method: 'POST',
            body: JSON.stringify({}),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Request ERROR - status: ${response.status}`);
        }

        const responseJson = await response.json();

        switch (responseJson.status) {
            case "error":
                createAlertPopup(5000, null, 'Error While Getting User Info', responseJson.errorinfo)
                return 'error'
                break;
            case "ok":
                return responseJson.userinfo
                break;
            default:
                return None
        }
        
    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 0
    }
}

async function getLocationId(type) {
    try {
        const response = await fetch("/api/getLocationId", {
            method: 'POST',
            body: JSON.stringify({
                "type": type
            }),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Request ERROR - status: ${response.status}`);
        }

        const responseJson = await response.json();

        switch (responseJson.status) {
            case "error":
                createAlertPopup(5000, null, 'Error While Getting Location Info', responseJson.errorinfo)
                return 'error';
            case "ok":
                return responseJson.locationJson;
            default:
                return null;
        }
        
    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server');
        return 'error';
    }
}

async function setLocationSelector(locationJson) {
    const optionSlot = document.getElementById("locationSelector");
    var locations = [];
    var locationJson = await locationJson;
    for (i = 0; i < Object.keys(locationJson).length; i++) {
        locations[i] = locationJson[Object.keys(locationJson)[i]];
    }
    locations.forEach(curlocation => {
        const option = document.createElement('option');
        option.text = curlocation;
        optionSlot.appendChild(option);
    });
}

async function updateUserLocation(locationName) {
    try {
        const response = await fetch("/api/updateUserLocation", {
            method: 'POST',
            body: JSON.stringify({
                "location": locationName
            }),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error(`Request ERROR - status: ${response.status}`);
        }

        const responseJson = await response.json();

        switch (responseJson.status) {
            case "error":
                createAlertPopup(5000, null, 'Error Updating User Location', responseJson.errorinfo);
                return 'error';
            case "ok":
                return 'ok';
            default:
                return 'error';
        }
        
    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server');
        return 'error';
    }
}

async function doFloorSearch() {
    const filterFloor = document.getElementById('filterFloor')
    const filterLocation = document.getElementById('filterLocation')

    filterLocation.value = 'Current Location'
    setFilterDisplay(filterFloor.value)
    floorId = await getLocationIdFromName(filterFloor.value)

    var floorIds = await searchStudents({'floorid': floorId})

    setStudents(floorIds)
}

async function doLocationSearch() {
    const filterFloor = document.getElementById('filterFloor')
    const filterLocation = document.getElementById('filterLocation')

    filterFloor.value = 'Dorm Floor'
    locationId = await getLocationIdFromName(filterLocation.value)

    var destinationIds = await getStudents({'destination': locationId})

    var allIds = []

    for (i = 0; i < Object.keys(destinationIds).length; i ++) {
        var convertedStuInfo = await searchStudents({'studentid': destinationIds[i][0][1]})
        console.log(convertedStuInfo[0])
        allIds[Object.keys(allIds).length + i] = convertedStuInfo[0]
    }
    
    setStudents(allIds)
}

async function doNameSearch() {
    const searchTextBox = document.getElementById('filterSearchInput');
    const searchName = searchTextBox.value;

    if (searchName.trim() === '') {
        setStudentIndex({});
        return;
    }

    var foundStudents = await searchStudents({'name': searchName});

    if (foundStudents == 'error') {
        createAlertPopup(5000, null, 'Error', 'Error while searching for students');
        return;
    }

    setStudents(foundStudents);
}

async function doGradeSearch() {
    const filterGrade = document.getElementById('filterGrade');
    const grade = filterGrade.value;

    if (grade.trim() === '') {
        setStudentIndex({});
        return;
    }

    var foundStudents = await searchStudents({'grade': grade});

    if (foundStudents == 'error') {
        createAlertPopup(5000, null, 'Error', 'Error while searching for students');
        return;
    }

    setStudents(foundStudents);
}

function toggleOverlay(status) {
    var overlayCloseBtn = document.getElementById('overlayCloseBtn');
    var overlay = document.getElementById('popupOverlay');
    
    if (status == true) {
        overlay.style.display = 'flex'
    } else {
        overlay.style.display = 'none'
    }
}

async function renderCreateNewPassPopup(studentid) {
    var overlayContent = document.getElementById('overlayContent')
    overlayContent.innerHTML = ''

    var createPassIframe = document.createElement('iframe')
    createPassIframe.src = `/newPassEdit?studentid=${studentid}`
    createPassIframe.style.width = '600px'
    createPassIframe.style.height = '650px'
    createPassIframe.style.border = 'none'

    overlayContent.appendChild(createPassIframe)
    toggleOverlay(true)
}

window.addEventListener('message', (event) => {
    if (event.data.message === 'close') {
        toggleOverlay(false);
        createAlertPopup(5000, 'success', 'Pass Created', `Pass ID: ${event.data.passId} has been created successfully.`);
    }
});

function setFilterDisplay(text) {
    const filterDisplay = document.getElementById('filterDisplay');
    filterDisplay.textContent = text;
}

async function mainProcess() {
    const filterFloorOptions = document.getElementById('filterFloor')
    const filterLocationOptions = document.getElementById('filterLocation')

    document.getElementById('usernameTopbar').onclick = function(event) {
        var signoutNow = confirm('Do you want to signout now?')
        if (signoutNow) {
            window.location = '/signout'
        }
    }

    var userinfo = await getUserInfo()
    var username = userinfo['user'][1]

    if (userinfo == 'error') {
        userinfo = null
        createAlertPopup(5000, null, 'Error', 'An error occured while getting user information')
        return 0
    }

    setUsernameTopbar(username)

    var destinationIds = await getLocationId(1);
    var floorIds = await getLocationId(2);

    setLocationFilter('filterLocation', {...destinationIds});
    setLocationFilter('filterFloor', floorIds);

    setLocationSelector(destinationIds)
    setLocationSelector(floorIds)

    document.getElementById('passesNavButton').onclick = function(event) {
        window.location.href = '/passCatalogue'
    }
    document.getElementById('studentsNavButton').onclick = function(event) {
        window.location.href = '/studentCatalogue'
    }
    document.getElementById('manageNavButton').onclick = function(event) {
        window.location.href = '/managePanel'
    }
    document.getElementById('settingsNavButton').onclick = function(event) {
        window.location.href = '/settingsPanel'
    }

    const locationSelector = document.getElementById('locationSelector');
    locationSelector.onchange = async (event) => {
        const updateResult = await updateUserLocation(locationSelector.value);
        if (updateResult == 'error') {
            createAlertPopup(5000, null, 'Error', 'Error while updating user location data');
            return 0;
        }
    }

    var userLocation = await getUserLocation()
    if (userLocation != 'error' && userLocation != null) {
        document.getElementById('locationSelector').value = userLocation
    }

    filterFloorOptions.value = 'Dorm Floor'
    filterLocationOptions.value = 'Current Location'

    filterFloorOptions.onchange = function () {doFloorSearch()}
    filterLocationOptions.onchange = function () {doLocationSearch()}

    const searchTextBox = document.getElementById('filterSearchInput');
    searchTextBox.oninput = function () { doNameSearch() };

    const filterGradeOptions = document.getElementById('filterGrade');
    filterGradeOptions.onchange = function () { doGradeSearch() };

    overlayCloseBtn.addEventListener('click', () => {
        toggleOverlay(false)
    });
}

document.addEventListener('DOMContentLoaded', () => {
    mainProcess()
    toggleOverlay(false)
});
