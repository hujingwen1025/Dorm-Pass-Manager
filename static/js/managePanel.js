async function getLocationId(type) {
    try {
        const response = await fetch("/getLocationId", {
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
                console.error(response.errorinfo)
                return 'error'
                break;
            case "ok":
                if (type == 1) {
                    window.destinationLocationJson = responseJson.locationJson
                } else if (type == 2) {
                    window.floorLocationJson = responseJson.locationJson
                }
                return responseJson.locationJson
                break;
            default:
                return None
        }
        
    } catch (error) {
        console.error('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 0
    }
}

async function searchStudents(filters) {
    try {
        const response = await fetch("/searchStudents", {
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
                console.error(response.errorinfo)
                return 'error'
                break;
            case "ok":
                return responseJson.students
                break;
            default:
                return None
        }
        
    } catch (error) {
        console.error('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 0
    }
}

async function getUserInfo() {
    try {
        const response = await fetch("/getUserInfo", {
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
                console.error(responseJson.errorinfo)
                return 'error'
                break;
            case "ok":
                return responseJson.userinfo
                break;
            default:
                return None
        }
        
    } catch (error) {
        console.error('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 0
    }
}

async function getLocationInfo(locationFilter) {
    try {
        const response = await fetch("/getLocationInfo", {
            method: 'POST',
            body: JSON.stringify({
                "filters": locationFilter
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
                console.error(responseJson.errorinfo)
                return 'error'
                break;
            case "ok":
                return responseJson.locationinfo
                break;
            default:
                return None
        }
        
    } catch (error) {
        console.error('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 0
    }
}

async function getStudents(filters) {
    try {
        const response = await fetch("/getStudents", {
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
                console.error(responseJson.errorinfo)
                return 'error'
            case "ok":
                return responseJson.students
            default:
                return None
        }
        
    } catch (error) {
        console.error('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 0
    }
}

async function getStudentInfo(studentid) {
    try {
        const response = await fetch("/getStudentInfo", {
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
                console.error(responseJson.errorinfo)
                return 'error'
                break;
            case "ok":
                return responseJson.studentinfo
                break;
            default:
                return None
        }
        
    } catch (error) {
        console.error('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 0
    }
}

async function updateUserLocation(locationName) {
    try {
        const response = await fetch("/updateUserLocation", {
            method: 'POST',
            body: JSON.stringify({
                "location": locationName
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
                console.error(responseJson.errorinfo)
                return 'error'
                break;
            case "ok":
                return 0
                break;
            default:
                return None
        }
        
    } catch (error) {
        console.error('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 0
    }
}

function createAlertPopup(closetimeout, type = null, title, body, alertid = '') {
    let alertContainer = document.getElementById('alertContainer')

    let alertElement = document.createElement('div');
    alertElement.setAttribute('id', alertid)
    alertElement.classList.add('alert')
    console.log(type)
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
    bodyText.textContent = body

    alertElement.appendChild(closeButton)
    alertElement.appendChild(titleText)
    alertElement.appendChild(bodyText)

    alertContainer.appendChild(alertElement)

    if (closetimeout != null) {
        let closeTimout = setTimeout(function () {alertElement.remove()}, closetimeout);
    }
}

function createDestinationChooserPopup(studentName, studentInfo, studentImage, destinationButtonJson) {
    let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=0,height=0,left=-1000,top=-1000`
    open(`/studentDestinationChooser?studentName=${studentName}&studentInfo=${studentInfo}&studentImage=${studentImage}&destinationButtonJson=${destinationButtonJson}`, "Choose Student Destination", params)
}

function createStudentInfoDisplayPopup() {
    let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=0,height=0,left=-1000,top=-1000`
    open("/studentInfoDisplay", "Student Status Display", params)
}

async function setUsernameTopbar(username) {
    const usernameTopbarDispaly = document.getElementById("usernameTopbar")
    usernameTopbarDispaly.textContent = username
}

async function setLocationSelector(locationJson) {
    const optionSlot = document.getElementById("locationSelector")
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

function doOptionUpdate(optionid = null) {
    const studentsOption = document.getElementById('studentsOption');
    const usersOption = document.getElementById('usersOption');
    const locationsOption = document.getElementById('locationsOption');
    const diagnosticsOption = document.getElementById('diagnosticsOption');
    const backupOption = document.getElementById('backupOption');
    const settingsOption = document.getElementById('settingsOption');

    switch (optionid) {
        case 'studentsOption':
            studentsOption.classList.add('optionActivated')
            break;
        case 'usersOption':
            usersOption.classList.add('optionActivated')
            break;
        case 'locationsOption':
            locationsOption.classList.add('optionActivated')
            break;
        case 'diagnosticsOption':
            diagnosticsOption.classList.add('optionActivated')
            break;
        case 'backupOption':
            backupOption.classList.add('optionActivated')
            break;
        case 'settingsOption':
            settingsOption.classList.add('optionActivated')
            break;
        case 'moreset':
            studentsOption.classList.remove('optionActivated')
            usersOption.classList.remove('optionActivated')
            locationsOption.classList.remove('optionActivated')
            diagnosticsOption.classList.remove('optionActivated')
            backupOption.classList.remove('optionActivated')
            settingsOption.classList.remove('optionActivated')

            switch (window.selectedOption) {
                case 'studentsOption':
                    studentsOption.classList.add('optionActivated')
                    break;
                case 'usersOption':
                    usersOption.classList.add('optionActivated')
                    break;
                case 'locationsOption':
                    locationsOption.classList.add('optionActivated')
                    break;
                case 'diagnosticsOption':
                    diagnosticsOption.classList.add('optionActivated')
                    break;
                case 'backupOption':
                    backupOption.classList.add('optionActivated')
                    break;
                case 'settingsOption':
                    settingsOption.classList.add('optionActivated')
                    break;
            }
            break;
        case 'reset':
            studentsOption.classList.remove('optionActivated')
            usersOption.classList.remove('optionActivated')
            locationsOption.classList.remove('optionActivated')
            diagnosticsOption.classList.remove('optionActivated')
            backupOption.classList.remove('optionActivated')
            settingsOption.classList.remove('optionActivated')
        default:
            console.log('Incorrect reference')
            break;
    }
}

function setSelectedCustomOption(alloptions, selectedOption, pinnedOption) {
    for (let i = 0; i < alloptions.length; i ++) {
        document.getElementById(alloptions[i]).classList.remove('buttonSelectorActivated')
    }
    if (selectedOption != null) {
        console.log(alloptions[selectedOption])
        document.getElementById(alloptions[selectedOption]).classList.add('buttonSelectorActivated')
    }
    if (pinnedOption != null) {
        document.getElementById(pinnedOption).classList.add('buttonSelectorActivated')
    }
}

function setSelectedOption(optionid) {
    const studentsContainer = document.getElementById('studentsContainer');
    const usersContainer = document.getElementById('usersContainer');
    const locationsContainer = document.getElementById('locationsContainer');
    const diagnosticsContainer = document.getElementById('diagnosticsContainer');
    const backupContainer = document.getElementById('backupContainer');
    const settingsContainer = document.getElementById('settingsContainer');

    studentsContainer.classList.add('containerHidden')
    usersContainer.classList.add('containerHidden')
    locationsContainer.classList.add('containerHidden')
    diagnosticsContainer.classList.add('containerHidden')
    backupContainer.classList.add('containerHidden')
    settingsContainer.classList.add('containerHidden')

    window.selectedOption = optionid
    doOptionUpdate('moreset')

    switch (optionid) {
        case 'studentsOption':
            studentsContainer.classList.remove('containerHidden')
            break;
        case 'usersOption':
            usersContainer.classList.remove('containerHidden')
            break;
        case 'locationsOption':
            locationsContainer.classList.remove('containerHidden')
            break;
        case 'diagnosticsOption':
            diagnosticsContainer.classList.remove('containerHidden')
            break;
        case 'backupOption':
            backupContainer.classList.remove('containerHidden')
            break;
        case 'settingsOption':
            settingsContainer.classList.remove('containerHidden')
            break;
        default:
            console.log('Incorrect Reference')
            break;
    }
}

async function doEditStudentDatalistUpdate(name) {
    const studentEditDatalist = document.getElementById('editStudentFoundStudents')
    studentEditDatalist.innerHTML = ''
    var studentList = await searchStudents({'name': name})
    if (studentList != [] && studentList != undefined && studentList != null) {
        for (let i = 0; i < studentList.length; i ++) {
            const option = document.createElement('option')
            option.value = studentList[i][1]
            studentEditDatalist.appendChild(option)
        }
    }
}

async function doEditStudentFloorDatalistUpdate(locationName) {
    const studentEditFloorDatalist = document.getElementById('editStudentFoundFloors')
    studentEditFloorDatalist.innerHTML = ''
    var locationList = await getLocationInfo({'name': locationName})
    if (locationList != [] && locationList != undefined && locationList != null) {
        for (let i = 0; i < locationList.length; i ++) {
            const option = document.createElement('option')
            option.value = locationList[i][1]
            studentEditFloorDatalist.appendChild(option)
            console.log('Added option:', option);
        }
    }
}

function setStudentEditDisable(status) {
    document.getElementById('editStudentName').disabled = status
    document.getElementById('editStudentGrade').disabled = status
    document.getElementById('editStudentCardid').disabled = status
    document.getElementById('editStudentFloor').disabled = status
}

async function loadStudentInfoEdit(name) {
    var studentList = await searchStudents({'strictname': name})
    if (studentList.length > 0) {
        console.log('found student, updating')
        var nameInfo = studentList[0][1]
        var gradeInfo = studentList[0][2]
        var locationInfo = await getLocationInfo({'id': studentList[0][4]})
        locationInfo = locationInfo[0][1]
        var cardidInfo = studentList[0][3]

        setStudentEditDisable(false)

        document.getElementById('editStudentName').value = nameInfo
        document.getElementById('editStudentGrade').value = gradeInfo
        document.getElementById('editStudentCardid').value = cardidInfo
        document.getElementById('editStudentFloor').value = locationInfo
    } else {
        console.log('student not found, clearing')
        document.getElementById('editStudentName').value = ''
        document.getElementById('editStudentGrade').value = ''
        document.getElementById('editStudentCardid').value = ''
        document.getElementById('editStudentFloor').value = ''

        setStudentEditDisable(true)
    }
}

function setOptionContentVisibility(allContent, selectedContent) {
    for (let i = 0; i < allContent.length; i ++) {
        document.getElementById(allContent[i]).classList.add('containerHidden')
    }
    console.log('unh')
    console.log(allContent[selectedContent])
    document.getElementById(allContent[selectedContent]).classList.remove('containerHidden')
}

async function mainProcess() {
    var destinationIds = await getLocationId(1)
    var floorIds = await getLocationId(2)
    var userinfo = await getUserInfo()
    var username = userinfo['user'][1]
    window.selectedOption = null

    if (userinfo == 'error') {
        userinfo = null
        createAlertPopup(5000, null, 'Error', 'An error occured while getting user information')
        return 0
    }

    setUsernameTopbar(username)

    setLocationSelector(destinationIds);  
    setLocationSelector(floorIds); 
    
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

    const locationSelector = window.document.getElementById('locationSelector')

    locationSelector.onchange = (event) => {
        updateUserLocation(locationSelector.value)
        if (updateUserLocation == 'error') {
            createAlertPopup(5000, null, 'Error', 'Error while updating user location data')
            return 0
        }
        if (window.searchActivated == false) {
            setTimeout(() => {triggerDisplayUpdate()}, 1000);
        }
    }

    const studentsOption = document.getElementById('studentsOption');
    const usersOption = document.getElementById('usersOption');
    const locationsOption = document.getElementById('locationsOption');
    const diagnosticsOption = document.getElementById('diagnosticsOption');
    const backupOption = document.getElementById('backupOption');
    const settingsOption = document.getElementById('settingsOption');

    studentsOption.onmouseover = function() {doOptionUpdate('studentsOption')}
    usersOption.onmouseover = function() {doOptionUpdate('usersOption')}
    locationsOption.onmouseover = function() {doOptionUpdate('locationsOption')}
    diagnosticsOption.onmouseover = function() {doOptionUpdate('diagnosticsOption')}
    backupOption.onmouseover = function() {doOptionUpdate('backupOption')}
    settingsOption.onmouseover = function() {doOptionUpdate('settingsOption')}

    studentsOption.onmouseout = function() {doOptionUpdate('moreset')}
    usersOption.onmouseout = function() {doOptionUpdate('moreset')}
    locationsOption.onmouseout = function() {doOptionUpdate('moreset')}
    diagnosticsOption.onmouseout = function() {doOptionUpdate('moreset')}
    backupOption.onmouseout = function() {doOptionUpdate('moreset')}
    settingsOption.onmouseout = function() {doOptionUpdate('moreset')}

    studentsOption.onclick = function() {setSelectedOption('studentsOption')}
    usersOption.onclick = function() {setSelectedOption('usersOption')}
    locationsOption.onclick = function() {setSelectedOption('locationsOption')}
    diagnosticsOption.onclick = function() {setSelectedOption('diagnosticsOption')}
    backupOption.onclick = function() {setSelectedOption('backupOption')}
    settingsOption.onclick = function() {setSelectedOption('settingsOption')}

    const studentAddButton = document.getElementById('addStudentSelector')
    const studentEditButton = document.getElementById('editStudentSelector')
    studentAddButton.onmouseover = function() {setSelectedCustomOption(['addStudentSelector', 'editStudentSelector'], 0, window.studentSelectorChoice)}
    studentEditButton.onmouseover = function() {setSelectedCustomOption(['addStudentSelector', 'editStudentSelector'], 1, window.studentSelectorChoice)}
    studentAddButton.onmouseout = function() {setSelectedCustomOption(['addStudentSelector', 'editStudentSelector'], null, window.studentSelectorChoice)}
    studentEditButton.onmouseout = function() {setSelectedCustomOption(['addStudentSelector', 'editStudentSelector'], null, window.studentSelectorChoice)}
    window.studentSelectorChoice = null

    document.getElementById('addStudentSelector').onclick = function(event) {
        window.studentSelectorChoice = 'addStudentSelector'
        setSelectedCustomOption(['addStudentSelector', 'editStudentSelector'], 0, window.studentSelectorChoice)
        setOptionContentVisibility(['addStudentContent', 'editStudentContent'], 0)
    }
    document.getElementById('editStudentSelector').onclick = function(event) {
        window.studentSelectorChoice = 'editStudentSelector'
        setSelectedCustomOption(['addStudentSelector', 'editStudentSelector'], 1, window.studentSelectorChoice)
        setOptionContentVisibility(['addStudentContent', 'editStudentContent'], 1)
    }

    const userAddButton = document.getElementById('addUserSelector')
    const userEditButton = document.getElementById('editUserSelector')
    userAddButton.onmouseover = function() {setSelectedCustomOption(['addUserSelector', 'editUserSelector'], 0, window.userSelectorChoice)}
    userEditButton.onmouseover = function() {setSelectedCustomOption(['addUserSelector', 'editUserSelector'], 1, window.userSelectorChoice)}
    userAddButton.onmouseout = function() {setSelectedCustomOption(['addUserSelector', 'editUserSelector'], null, window.userSelectorChoice)}
    userEditButton.onmouseout = function() {setSelectedCustomOption(['addUserSelector', 'editUserSelector'], null, window.userSelectorChoice)}
    window.userSelectorChoice = null

    document.getElementById('addUserSelector').onclick = function(event) {
        window.userSelectorChoice = 'addUserSelector'
        setSelectedCustomOption(['addUserSelector', 'editUserSelector'], 0, window.userSelectorChoice)
        setOptionContentVisibility(['addUserContent', 'editUserContent'], 0)
    }
    document.getElementById('editUserSelector').onclick = function(event) {
        window.userSelectorChoice = 'editUserSelector'
        setSelectedCustomOption(['addUserSelector', 'editUserSelector'], 1, window.userSelectorChoice)
        setOptionContentVisibility(['addUserContent', 'editUserContent'], 1)
    }

    const locationAddButton = document.getElementById('addLocationSelector')
    const locationEditButton = document.getElementById('editLocationSelector')
    locationAddButton.onmouseover = function() {setSelectedCustomOption(['addLocationSelector', 'editLocationSelector'], 0, window.locationSelectorChoice)}
    locationEditButton.onmouseover = function() {setSelectedCustomOption(['addLocationSelector', 'editLocationSelector'], 1, window.locationSelectorChoice)}
    locationAddButton.onmouseout = function() {setSelectedCustomOption(['addLocationSelector', 'editLocationSelector'], null, window.locationSelectorChoice)}
    locationEditButton.onmouseout = function() {setSelectedCustomOption(['addLocationSelector', 'editLocationSelector'], null, window.locationSelectorChoice)}
    window.locationSelectorChoice = null

    document.getElementById('addLocationSelector').onclick = function(event) {
        window.locationSelectorChoice = 'addLocationSelector'
        setSelectedCustomOption(['addLocationSelector', 'editLocationSelector'], 0, window.locationSelectorChoice)
        setOptionContentVisibility(['addLocationContent', 'editLocationContent'], 0)
    }
    document.getElementById('editLocationSelector').onclick = function(event) {
        window.locationSelectorChoice = 'editLocationSelector'
        setSelectedCustomOption(['addLocationSelector', 'editLocationSelector'], 1, window.locationSelectorChoice)
        setOptionContentVisibility(['addLocationContent', 'editLocationContent'], 1)
    }

    const editStudentDatalist = document.getElementById('editStudentChoose')
    editStudentDatalist.oninput = function(){doEditStudentDatalistUpdate(editStudentDatalist.value)}
    editStudentDatalist.addEventListener('focusout', (event) => {
            loadStudentInfoEdit(editStudentDatalist.value)
      });

    const editStudentFloorDatalist = document.getElementById('editStudentFloor')
    editStudentFloorDatalist.oninput = function(){doEditStudentFloorDatalistUpdate(editStudentFloorDatalist.value)}

    editStudentDatalist.value = ''
    console.log('setting')
    loadStudentInfoEdit('')
}

document.addEventListener('DOMContentLoaded', () => {
    mainProcess()
});