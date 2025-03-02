console.log(`%c  _____ _______ ____  _____  
 / ____|__   __/ __ \\|  __ \\ 
| (___    | | | |  | | |__) |
 \\___ \\   | | | |  | |  ___/ 
 ____) |  | | | |__| | |     
|_____/   |_|  \\____/|_|     
                             
DANGER ZONE
注意：开发者区域

This is a browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or "hack" someone's account, it is a scam and will give them access to your account. By pasting anything here, you might be putting your account and database information at risk!
If you don't understand what you are doing, please close this window.
这是一个针对开发人员的浏览器特性。如果有人告诉你在这里复制粘贴一些东西来启用某个功能或“入侵”某人的账户，这是一个骗局，他们会获得你的账户。通过在这里粘贴任何内容，您可能会将您的帐户和数据库信息置于危险之中！
如果您不明白自己在做什么，请关闭此窗口。
`, 'color: red') 

window.debug = false
function dlog(text) {
    if (window.debug) {
        console.log(text)
    }
}

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
                createAlertPopup(5000, null, 'Error While Getting Location ID', response.errorinfo)
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
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
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
                createAlertPopup(5000, null, 'Error While Searching For Students', response.errorinfo)
                return 'error'
                break;
            case "ok":
                return responseJson.students
                break;
            default:
                return None
        }
        
    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
    }
}

async function searchUsers(filters) {
    try {
        const response = await fetch("/searchUsers", {
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
                createAlertPopup(5000, null, 'Error While Searching For Users', response.errorinfo)
                return 'error'
                break;
            case "ok":
                return responseJson.users
                break;
            default:
                return None
        }

    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
    }
}

async function searchLocations(filters) {
    try {
        const response = await fetch("/searchLocations", {
            method: 'POST',
            body: JSON.stringify({
                "searchFilters": filters
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
                createAlertPopup(5000, null, 'Error While Searching For Locations', responseJson.errorinfo)
                return 'error'
                break;
            case "ok":
                return responseJson.locations
                break;
            default:
                return None
        }

    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
    }
}

async function addUser(name, email, role, location, password = null) {
    try {
        const response = await fetch("/addUser", {
            method: 'POST',
            body: JSON.stringify({
                "name": name,
                "email": email,
                "role": role,
                "location": location,
                "password": password
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
                createAlertPopup(5000, null, 'Error While Adding User', responseJson.errorinfo)
                return 'error'
            case "ok":
                return responseJson.userid
            default:
                return None
        }
        
    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
    }
}

async function addStudent(studentName, studentGrade, studentFloor, studentCardid, studentImage) {
    try {
        const response = await fetch("/addStudent", {
            method: 'POST',
            body: JSON.stringify({
                "name": studentName,
                "grade": studentGrade,
                "floor": studentFloor,
                "cardid": studentCardid,
                "image": studentImage
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
                createAlertPopup(5000, null, 'Error While Adding Students', responseJson.errorinfo)
                return 'error'
            case "ok":
                return responseJson.studentid
            default:
                return None
        }
        
    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
    }
}

async function addLocation(locationName, locationType) {
    try {
        const response = await fetch("/addLocation", {
            method: 'POST',
            body: JSON.stringify({
                "name": locationName,
                "type": locationType
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
                createAlertPopup(5000, null, 'Error Adding Location', responseJson.errorinfo)
                return 'error'
            case "ok":
                return responseJson.locationid
            default:
                return None
        }

    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
    }
}

async function editStudent(studentid, studentName, studentGrade, studentFloor, studentCardid, studentImage) {
    try {
        const response = await fetch("/editStudent", {
            method: 'POST',
            body: JSON.stringify({
                "studentid": studentid,
                "name": studentName,
                "grade": studentGrade,
                "floor": studentFloor,
                "cardid": studentCardid,
                "image": studentImage
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
                createAlertPopup(5000, null, 'Error Editing Students', responseJson.errorinfo)
                return 'error'
            case "ok":
                return 0
            default:
                return None
        }
        
    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
    }
}

async function editUser(userid, userName, userEmail, userRole, userLocation) {
    try {
        const response = await fetch("/editUser", {
            method: 'POST',
            body: JSON.stringify({
                "userid": userid,
                "name": userName,
                "email": userEmail,
                "role": userRole,
                "location": userLocation
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
                createAlertPopup(5000, null, 'Error Editing User', responseJson.errorinfo)
                return 'error'
            case "ok":
                return 0
            default:
                return None
        }

    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
    }
}

async function editLocation(locationid, locationName, locationType) {
    try {
        const response = await fetch("/editLocation", {
            method: 'POST',
            body: JSON.stringify({
                "locationid": locationid,
                "name": locationName,
                "type": locationType
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
                createAlertPopup(5000, null, 'Error Editing Location', responseJson.errorinfo)
                return 'error'
            case "ok":
                return 0
            default:
                return None
        }

    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
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
        return 'error'
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
                createAlertPopup(5000, null, 'Error While Getting Location Info', responseJson.errorinfo)
                return 'error'
                break;
            case "ok":
                return responseJson.locationinfo
                break;
            default:
                return None
        }
        
    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
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
                createAlertPopup(5000, null, 'Error While Getting Student Info', responseJson.errorinfo)
                return 'error'
            case "ok":
                return responseJson.students
            default:
                return None
        }
        
    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
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
                createAlertPopup(5000, null, 'Error While Getting Student Info', responseJson.errorinfo)
                return 'error'
                break;
            case "ok":
                return responseJson.studentinfo
                break;
            default:
                return None
        }
        
    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
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
                createAlertPopup(5000, null, 'Error While Updating User Location', responseJson.errorinfo)
                return 'error'
                break;
            case "ok":
                return 0
                break;
            default:
                return None
        }
        
    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
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
            dlog('Incorrect reference')
            break;
    }
}

function setSelectedCustomOption(alloptions, selectedOption, pinnedOption) {
    for (let i = 0; i < alloptions.length; i ++) {
        document.getElementById(alloptions[i]).classList.remove('buttonSelectorActivated')
    }
    if (selectedOption != null) {
        dlog(alloptions[selectedOption])
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
            dlog('Incorrect Reference')
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

async function doEditLocationDatalistUpdate(name) {
    const locationEditDatalist = document.getElementById('editLocationFoundLocations')
    locationEditDatalist.innerHTML = ''
    var locationList = await searchLocations({'name': name})
    if (locationList != [] && locationList != undefined && locationList != null) {
        for (let i = 0; i < locationList.length; i ++) {
            const option = document.createElement('option')
            option.value = locationList[i][1]
            locationEditDatalist.appendChild(option)
        }
    }
}

async function doEditUserDatalistUpdate(name) {
    const userEditDatalist = document.getElementById('editUserFoundUsers')
    userEditDatalist.innerHTML = ''
    var userList = await searchUsers({'name': name})
    if (userList != [] && userList != undefined && userList != null) {
        for (let i = 0; i < userList.length; i ++) {
            const option = document.createElement('option')
            option.value = userList[i][1]
            userEditDatalist.appendChild(option)
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
            option.locationId = locationList[i][0]
            studentEditFloorDatalist.appendChild(option)
            dlog('Added option:', option);
        }
    }
}

async function doAddStudentFloorDatalistUpdate(locationName) {
    const studentAddFloorDatalist = document.getElementById('addStudentFoundFloors')
    studentAddFloorDatalist.innerHTML = ''
    var locationList = await getLocationInfo({'name': locationName})
    if (locationList != [] && locationList != undefined && locationList != null) {
        for (let i = 0; i < locationList.length; i ++) {
            const option = document.createElement('option')
            option.value = locationList[i][1]
            option.locationId = locationList[i][0]
            studentAddFloorDatalist.appendChild(option)
            dlog('Added option:', option);
        }
    }
}

async function doAddUserLocationDatalistUpdate(locationName) {
    const userAddLocationDatalist = document.getElementById('addUserFoundLocations')
    userAddLocationDatalist.innerHTML = ''
    var locationList = await getLocationInfo({'name': locationName})
    if (locationList != [] && locationList != undefined && locationList != null) {
        for (let i = 0; i < locationList.length; i ++) {
            const option = document.createElement('option')
            option.value = locationList[i][1]
            option.locationId = locationList[i][0]
            userAddLocationDatalist.appendChild(option)
            dlog('Added option:', option);
        }
    }
}

function setStudentEditDisable(status) {
    document.getElementById('editStudentName').disabled = status
    document.getElementById('editStudentGrade').disabled = status
    document.getElementById('editStudentCardid').disabled = status
    document.getElementById('editStudentFloor').disabled = status
    document.getElementById('editStudentImage').disabled = status
}

function setUserEditDisable(status) {
    document.getElementById('editUserName').disabled = status
    document.getElementById('editUserEmail').disabled = status
    document.getElementById('editUserRole').disabled = status
    document.getElementById('editUserLocation').disabled = status
    document.getElementById('editUserPassword').disabled = status
}

function setLocationEditDisable(status) {
    document.getElementById('editLocationName').disabled = status
    document.getElementById('editLocationType').disabled = status
}

async function loadStudentInfoEdit(name) {
    var studentList = await searchStudents({'strictname': name})
    if (studentList.length > 0) {
        dlog('found student, updating')
        window.studentEditId = studentList[0][0]
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
        dlog('student not found, clearing')
        document.getElementById('editStudentName').value = ''
        document.getElementById('editStudentGrade').value = ''
        document.getElementById('editStudentCardid').value = ''
        document.getElementById('editStudentFloor').value = ''

        setStudentEditDisable(true)
    }
}

async function loadUserInfoEdit(name) {
    var userList = await searchUsers({'strictname': name})
    if (userList.length > 0) {
        dlog('found user, updating')
        window.userEditId = userList[0][0]
        var nameInfo = userList[0][1]
        var emailInfo = userList[0][2]
        var roleInfo = userList[0][3]
        var locationInfo = await getLocationInfo({'id': userList[0][4]})
        locationInfo = locationInfo[0][1]

        setUserEditDisable(false)

        document.getElementById('editUserName').value = nameInfo
        document.getElementById('editUserEmail').value = emailInfo
        document.getElementById('editUserLocation').value = locationInfo

        switch (roleInfo) {
            case 1:
                document.getElementById('editUserRole').value = 'admin'
                break;
            case 2:
                document.getElementById('editUserRole').value = 'proctor'
                break;
            case 3:
                document.getElementById('editUserRole').value = 'approver'
                break;
            default:
                createAlertPopup(5000, null, 'Error', 'Error while getting user role')
                break;
        }
    } else {
        dlog('user not found, clearing')
        document.getElementById('editUserName').value = ''
        document.getElementById('editUserEmail').value = ''
        document.getElementById('editUserLocation').value = ''

        setUserEditDisable(true)
    }
}

async function loadLocationInfoEdit(name) {
    var locationList = await searchLocations({'strictname': name})
    if (locationList.length > 0) {
        dlog('found location, updating')
        window.locationEditId = locationList[0][0]
        var nameInfo = locationList[0][1]
        var typeInfo = locationList[0][2]

        document.getElementById('editLocationName').value = nameInfo
        if (typeInfo == 1) {
            document.getElementById('editLocationType').value = 'destination'
        } else if (typeInfo == 2) {
            document.getElementById('editLocationType').value = 'dorm'
        } else {
            createAlertPopup(5000, null, 'Error', 'Error while getting location type')
        }

        setLocationEditDisable(false)
    } else {
        dlog('location not found, clearing')
        document.getElementById('editLocationName').value = ''
        setLocationEditDisable(true)
    }
}

function convertImageFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      
      reader.readAsDataURL(file);
    });
  }

async function doUserAdd() {
    var userName = document.getElementById('addUserName').value
    var userEmail = document.getElementById('addUserEmail').value
    var userRole = document.getElementById('addUserRole').value
    var userLocation = document.getElementById('addUserLocation').value
    var userPassword = document.getElementById('addUserPassword').value

    var addResult = await addUser(userName, userEmail, userRole, userLocation, userPassword)
    if (addResult != 'error') {
        document.getElementById('addUserName').value = ''
        document.getElementById('addUserEmail').value = ''
        document.getElementById('addUserRole').value = ''
        document.getElementById('addUserLocation').value = ''
        document.getElementById('addUserPassword').value = ''

        createAlertPopup(5000, 'success', 'Success', `User ${userName} added successfully with an ID of ${addResult}`)
    } else {
        dlog('Error add user')
    }
}

async function doStudentAdd() {
    var studentImageFile = document.getElementById('addStudentImage').files[0]

    var studentName = document.getElementById('addStudentName').value
    var studentGrade = document.getElementById('addStudentGrade').value
    var studentFloor = document.getElementById('addStudentFloor').value
    var studentCardid = document.getElementById('addStudentCardid').value
    var studentImage = ''
    if (studentImageFile != undefined && studentImageFile != null) {
        await convertImageFileToBase64(studentImageFile).then(base64 => studentImage = base64);
    }

    var addResult = await addStudent(studentName, studentGrade, studentFloor, studentCardid, studentImage)
    if (addResult != 'error') {
        document.getElementById('addStudentName').value = ''
        document.getElementById('addStudentGrade').value = ''
        document.getElementById('addStudentFloor').value = ''
        document.getElementById('addStudentCardid').value = ''
        document.getElementById('addStudentImage').value = ''
        createAlertPopup(5000, 'success', 'Success', `Student ${studentName} added successfully with an ID of ${addResult}`)
    } else {
        dlog('Error add student')
    }
}

async function doLocationAdd() {
    var locationName = document.getElementById('addLocationName').value
    var locationType = document.getElementById('addLocationType').value

    var addResult = await addLocation(locationName, locationType)
    if (addResult != 'error') {
        document.getElementById('addLocationName').value = ''
        createAlertPopup(5000, 'success', 'Success', `Location ${locationName} added successfully with an ID of ${addResult}`)
    } else {
        dlog('Error add location')
    }
}

async function deleteStudent(studentid) {
    try {
        const response = await fetch("/editStudent", {
            method: 'POST',
            body: JSON.stringify({
                "studentid": studentid,
                "delete": 'true'
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
                createAlertPopup(5000, null, 'Error Deleting Student', responseJson.errorinfo)
                return 'error'
            case "ok":
                return studentid
            default:
                return None
        }

    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
    }
}

async function deleteUser(userid) {
    try {
        const response = await fetch("/editUser", {
            method: 'POST',
            body: JSON.stringify({
                "userid": userid,
                "delete": 'true'
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
                createAlertPopup(5000, null, 'Error Deleting User', responseJson.errorinfo)
                return 'error'
            case "ok":
                return userid
            default:
                return None
        }

    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
    }
}

async function deleteLocation(locationid) {
    try {
        const response = await fetch("/editLocation", {
            method: 'POST',
            body: JSON.stringify({
                "locationid": locationid,
                "delete": 'true'
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
                createAlertPopup(5000, null, 'Error Deleting Location', responseJson.errorinfo)
                return 'error'
            case "ok":
                return locationid
            default:
                return None
        }

    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
    }
}

async function doStudentDelete() {
    confirmDelete = confirm('Do you want to delete the selected student?')
    if (confirmDelete) {
        if (window.studentEditId == undefined || window.studentEditId == null) {
            createAlertPopup(5000, null, 'Error', 'No student selected for deletion')
            return 0
        }

        var deleteResult = await deleteStudent(window.studentEditId)
        if (deleteResult != 'error') {
            createAlertPopup(5000, 'success', 'Success', `Student with id of ${window.studentEditId} deleted successfully`)
        } else {
            dlog('Error delete student')
        }

        document.getElementById('editStudentChoose').value = ''
        loadStudentInfoEdit('')
    }
}

async function doUserDelete() {
    confirmDelete = confirm('Do you want to delete the selected user?')
    if (confirmDelete) {
        if (window.userEditId == undefined || window.userEditId == null) {
            createAlertPopup(5000, null, 'Error', 'No user selected for deletion')
            return 0
        }

        var deleteResult = await deleteUser(window.userEditId)
        if (deleteResult != 'error') {
            createAlertPopup(5000, 'success', 'Success', `User with id of ${window.userEditId} deleted successfully`)
        } else {
            dlog('Error delete user')
        }

        document.getElementById('editUserChoose').value = ''
        loadUserInfoEdit('')
    }
}

async function doLocationDelete() {
    confirmDelete = confirm('Do you want to delete the selected location?')
    if (confirmDelete) {
        if (window.locationEditId == undefined || window.locationEditId == null) {
            createAlertPopup(5000, null, 'Error', 'No location selected for deletion')
            return 0
        }

        var deleteResult = await deleteLocation(window.locationEditId)
        if (deleteResult != 'error') {
            createAlertPopup(5000, 'success', 'Success', `Location with id of ${window.locationEditId} deleted successfully`)
        } else {
            dlog('Error delete location')
        }

        document.getElementById('editLocationChoose').value = ''
        loadLocationInfoEdit('')
    }
}

async function doStudentEdit() {
    var studentImageFile = document.getElementById('editStudentImage').files[0]

    var studentName = document.getElementById('editStudentName').value
    var studentGrade = document.getElementById('editStudentGrade').value
    var studentFloor = document.getElementById('editStudentFloor').value
    var studentCardid = document.getElementById('editStudentCardid').value
    var studentImage = ''
    if (studentImageFile != undefined && studentImageFile != null) {
        await convertImageFileToBase64(studentImageFile).then(base64 => studentImage = base64);
    }

    if (window.studentEditId == undefined || window.studentEditId == null) {
        createAlertPopup(5000, null, 'Error', 'No student selected for editing')
        return 0
    }

    var editResult = await editStudent(window.studentEditId, studentName, studentGrade, studentFloor, studentCardid, studentImage)
    if (editResult != 'error') {
        createAlertPopup(5000, 'success', 'Success', `Student ${studentName} edited successfully`)
        document.getElementById('editStudentChoose').value = ''
        loadStudentInfoEdit('')
    } else {
        dlog('Error edit student')
    }
}

async function doUserEdit() {
    var userName = document.getElementById('editUserName').value
    var userEmail = document.getElementById('editUserEmail').value
    var userRole = document.getElementById('editUserRole').value
    var userLocation = document.getElementById('editUserLocation').value

    if (window.userEditId == undefined || window.userEditId == null) {
        createAlertPopup(5000, null, 'Error', 'No user selected for editing')
        return 0
    }

    var editResult = await editUser(window.userEditId, userName, userEmail, userRole, userLocation)
    if (editResult != 'error') {
        createAlertPopup(5000, 'success', 'Success', `User ${userName} edited successfully`)
        document.getElementById('editUserChoose').value = ''
        loadUserInfoEdit('')
    } else {
        dlog('Error edit user')
    }
}

async function doLocationEdit() {
    var locationName = document.getElementById('editLocationName').value
    var locationType = document.getElementById('editLocationType').value

    if (window.locationEditId == undefined || window.locationEditId == null) {
        createAlertPopup(5000, null, 'Error', 'No location selected for editing')
        return 0
    }

    var editResult = await editLocation(window.locationEditId, locationName, locationType)
    if (editResult != 'error') {
        createAlertPopup(5000, 'success', 'Success', `Location ${locationName} edited successfully`)
        document.getElementById('editLocationChoose').value = ''
        loadLocationInfoEdit('')
    } else {
        dlog('Error edit location')
    }
}

function setOptionContentVisibility(allContent, selectedContent) {
    for (let i = 0; i < allContent.length; i ++) {
        document.getElementById(allContent[i]).classList.add('containerHidden')
    }
    dlog('unh')
    dlog(allContent[selectedContent])
    document.getElementById(allContent[selectedContent]).classList.remove('containerHidden')
}

async function mainProcess() {
    document.getElementById('usernameTopbar').onclick = function(event) {
        var signoutNow = confirm('Do you want to signout now?')
        if (signoutNow) {
            window.location = '/signout'
        }
    }

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

    const editUserDatalist = document.getElementById('editUserChoose')
    editUserDatalist.oninput = function(){doEditUserDatalistUpdate(editUserDatalist.value)}
    editUserDatalist.addEventListener('focusout', (event) => {
        loadUserInfoEdit(editUserDatalist.value)
    });

    const editLocationDatalistDisplay = document.getElementById('editLocationChoose')
    editLocationDatalistDisplay.oninput = function(){doEditLocationDatalistUpdate(editLocationDatalistDisplay.value)}
    editLocationDatalistDisplay.addEventListener('focusout', (event) => {
        loadLocationInfoEdit(editLocationDatalistDisplay.value)
    });

    const editStudentFloorDatalist = document.getElementById('editStudentFloor')
    editStudentFloorDatalist.oninput = function(){doEditStudentFloorDatalistUpdate(editStudentFloorDatalist.value)}

    const addStudentFloorDatalist = document.getElementById('addStudentFloor')
    addStudentFloorDatalist.oninput = function(){doAddStudentFloorDatalistUpdate(addStudentFloorDatalist.value)}

    const addUserLocationDatalist = document.getElementById('addUserLocation')
    addUserLocationDatalist.oninput = function(){doAddUserLocationDatalistUpdate(addUserLocationDatalist.value)}

    const editLocationDatalist = document.getElementById('editLocationChoose')
    editLocationDatalist.oninput = function(){doEditLocationDatalistUpdate(editLocationDatalist.value)}

    const addStudentImageField = document.getElementById('addStudentImage')
    const editStudentImageField = document.getElementById('editStudentImage')

    const editStudentClearFileButton = document.getElementById('editStudentClearFileButton')

    const addLocationButtonSubmit = document.getElementById('addLocationButtonSubmit')
    addLocationButtonSubmit.onclick = function(event) {doLocationAdd()}

    addStudentImageField.onchange = function() {
        if (this.files[0].size > 1600000) {
           createAlertPopup(5000, 'warning', 'File Size Warning', 'File size too large. Please select a file smaller than 1.5MB')
           this.value = ""
        }
    }

    editStudentImageField.onchange = function() {
        if (this.files[0].size > 1600000) {
           createAlertPopup(5000, 'warning', 'File Size Warning', 'File size too large. Please select a file smaller than 1.5MB')
           this.value = ""
        }
    }

    editStudentClearFileButton.onclick = function() {
        editStudentImageField.value = ''
    }

    const editStudentDeleteButton = document.getElementById('editStudentDeleteButton')
    editStudentDeleteButton.onclick = function(event) {doStudentDelete()}

    const editUserDeleteButton = document.getElementById('editUserDeleteButton')
    editUserDeleteButton.onclick = function(event) {doUserDelete()}

    const editLocationDeleteButton = document.getElementById('editLocationDeleteButton')
    editLocationDeleteButton.onclick = function(event) {doLocationDelete()}

    const addStudentButtonSubmit = document.getElementById('addStudentButtonSubmit')
    addStudentButtonSubmit.onclick = function(event) {doStudentAdd()}

    const editStudentButtonSubmit = document.getElementById('editStudentButtonSubmit')
    editStudentButtonSubmit.onclick = function(event) {doStudentEdit()}

    const editUserButtonSubmit = document.getElementById('editUserButtonSubmit')
    editUserButtonSubmit.onclick = function(event) {doUserEdit()}

    const editLocationButtonSubmit = document.getElementById('editLocationButtonSubmit')
    editLocationButtonSubmit.onclick = function(event) {doLocationEdit()}

    const addUserButtonSubmit = document.getElementById('addUserButtonSubmit')
    addUserButtonSubmit.onclick = function(event) {doUserAdd()}

    editStudentDatalist.value = ''
    loadStudentInfoEdit('')
}

document.addEventListener('DOMContentLoaded', () => {
    mainProcess()
});