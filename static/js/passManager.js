window.onbeforeunload = function(e) {
    return 'Are you sure you want to leave this page?  You will lose any unsaved data.';
  };

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
        createAlertPopup(null, 'Error', 'Error while sending data to server')
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
        createAlertPopup(null, 'Error', 'Error while sending data to server')
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
                break;
            case "ok":
                return responseJson.students
                break;
            default:
                return None
        }
        
    } catch (error) {
        console.error('Error:', error);
        createAlertPopup(null, 'Error', 'Error while sending data to server')
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
        createAlertPopup(null, 'Error', 'Error while sending data to server')
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
        createAlertPopup(null, 'Error', 'Error while sending data to server')
        return 0
    }
}

function createAlertPopup(type, title, body) {
    let alertContainer = document.getElementById('alertContainer')

    let alertElement = document.createElement('div');
    alertElement.classList.add('alert')
    if (alertElement != null) {
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

    let closeTimout = setTimeout(function () {alertElement.remove()}, 5000);
}

function createDestinationChooserPopup(studentName, studentInfo, studentImage, destinationButtonJson) {
    let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=0,height=0,left=-1000,top=-1000`
    open(`/studentDestinationChooser?studentName=${studentName}&studentInfo=${studentInfo}&studentImage=${studentImage}&destinationButtonJson=${destinationButtonJson}`, "Choose Student Destination", params)
}

function createStudentInfoDisplayPopup() {
    let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=0,height=0,left=-1000,top=-1000`
    open("/studentInfoDisplay", "Student Status Display", params)
}

async function createNewStudentPass(studnetid, destinationid) {
    try {
        const response = await fetch("/updateitemstatus", {
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
                console.error(responseJson.errorinfo)
                return 'error'
            case "ok":
                break;
            default:
                createAlertPopup(null, 'Error', 'Server returned unreadable data')
                return 0
        }
        
    } catch (error) {
        console.error('Error:', error);
        createAlertPopup(null, 'Error', 'Error while sending data to server')
        return 0
    }
}

async function updateStudentPass(params) {
    try {
        const response = await fetch("/updatePass", {
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
                console.error(responseJson.errorinfo)
                return 'error'
            case "ok":
                break;
            default:
                createAlertPopup(null, 'Error', 'Server returned unreadable data')
                return 0
        }
        
    } catch (error) {
        console.error('Error:', error);
        createAlertPopup(null, 'Error', 'Error while sending data to server')
        return 0
    }
}

async function setLocationSelector(locationJson) {
    const optionSlot = document.getElementById("locationSelector")
    var locations = []
    var locationJson = await locationJson
    for (i = 1; i < Object.keys(locationJson).length; i ++) {
        locations[i - 1] = locationJson[i]
    }
    locations.forEach(curlocation => {
      const option = document.createElement('option');
      option.text = curlocation;
      optionSlot.appendChild(option);
    });
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
        var studentApproveButton = document.createElement('button')
        var studentFlagButton = document.createElement('button')

        var passid = curstudent[3]
        var flagged = curstudent[4]
        
        studentli.appendChild(studentNameDiv);
        studentli.appendChild(studentInfoDiv);
        studentli.appendChild(studentActionButton);
        studentli.appendChild(studentApproveButton);
        studentli.appendChild(studentFlagButton);

        studentNameDiv.classList.add('studentNameDiv')
        studentInfoDiv.classList.add('studentInfoDiv')
        studentActionButton.classList.add('studentActionButton')
        studentApproveButton.classList.add('studentActionButton')
        studentFlagButton.classList.add('studentActionButton')

        console.log(curstudent)
        if (flagged == 1) {
            studentNameDiv.innerHTML = `🔴 ${curstudent[0]}`
        } else {
            studentNameDiv.innerHTML = `🟢 ${curstudent[0]}`
        }

        studentInfoDiv.innerHTML = curstudent[1]
        studentActionButton.innerHTML = 'Actions'
        studentApproveButton.innerHTML = 'Approve'
        studentFlagButton.innerHTML = 'Flag'

        studentActionButton.setAttribute('id', `actions-${curstudent[0]}`)
        studentApproveButton.setAttribute('id', `approve-${curstudent[0]}`)
        studentFlagButton.setAttribute('id', `flag-${curstudent[0]}`)

        document.getElementById(`actions-${curstudent[0]}`).onclick = function(event){
            alert(event.target.parentNode.id);
        }
        document.getElementById(`approve-${curstudent[0]}`).onclick = function(event){
            var confirmApprove = confirm(`APPROVE ${curstudent[0]} ?`)
            if (confirmApprove) {
                var updateResult = updateStudentPass({'passid': passid,'approve': true})
                if (updateResult != 'error') {
                    createAlertPopup('success', 'Approve Success', `${curstudent[0]} has been approved`)
                } else {
                    createAlertPopup(null, 'Error', 'Error while updating student pass')
                    return 0
                }
                document.getElementById(window.lastfilterchoice).click()
            }
        }
        document.getElementById(`flag-${curstudent[0]}`).onclick = function(event){
            var confirmApprove = confirm(`FLAG ${curstudent[0]} ?`)
            if (confirmApprove) {
                var updateResult = updateStudentPass({'passid': passid,'flag': true})
                if (updateResult != 'error') {
                    createAlertPopup('success', 'Flag Success', `${curstudent[0]} has been flagged`)
                } else {
                    createAlertPopup(null, 'Error', 'Error while updating student pass')
                    return 0
                }
                document.getElementById(window.lastfilterchoice).click()
            }
        }
    })
}

async function setStudents(filters) {
    if (window.destinationLocationJson == null) {
        window.destinationLocationJson = getLocationId(1)
    } else if (window.floorLocationJson == null) {
        window.floorLocationJson = getLocationId(2)
    }
    var studentsInformation = await getStudents(filters)
    if (studentsInformation == 'error') {
        createAlertPopup(null, 'Error', 'Error while getting student information')
        return 0
    }
    window.opo = studentsInformation
    let studentsJson = {}
    for (l = 0; l < studentsInformation.length; l ++) {
        let studentInfo  = await getStudentInfo(studentsInformation[l][1])
        let floorName = window.floorLocationJson[studentInfo[2]]
        let studentGrade = studentInfo[1]
        let studentName = studentInfo[0]
        let passid = studentsInformation[l][0]
        let flagged = studentsInformation[l][8]
        let passStatus = ''

        if (studentInfo == 'error') {
            createAlertPopup(null, 'Error', 'Error while getting student info')
            return 0
        }

        if (studentsInformation[l][4] == null) {
            passStatus = '◽️🏢◽️'
        } else if (studentsInformation[l][5] == null) {
            passStatus = '🏢➡️⛳️'
        } else if (studentsInformation[l][6] == null) {
            passStatus = '◽️⛳️◽️'
        } else if (studentsInformation[l][7] == null) {
            passStatus = '⛳️➡️🏢'
        } else {
            passStatus = '◽️🏢✅'
        }

        studentsJson[l] = [studentName, `Grade ${studentGrade} ${floorName} - ${passStatus}`, studentsInformation[l][1], passid, flagged]
    }
    setStudentIndex(studentsJson)
}

async function setUsernameTopbar(username) {
    const usernameTopbarDispaly = document.getElementById("usernameTopbar")
    usernameTopbarDispaly.textContent = username
}

function setFilterDisplay(text) {
    const filterDisplay = document.getElementById('filterDisplay')
    filterDisplay.textContent = text
}

async function mainProcess() {
    var destinationIds = getLocationId(1)
    var floorIds = getLocationId(2)
    var userinfo = await getUserInfo()
    var username = userinfo['user'][1]
    window.lastfilterchoice = 'filterButtonLocal'

    if (userinfo == 'error') {
        userinfo = null
        createAlertPopup(null, 'Error', 'An error occured while getting user information')
        return 0
    }

    setUsernameTopbar(username)

    setLocationSelector(destinationIds);  
    
    document.getElementById('filterButtonAll').onclick = function(event) {
        window.lastfilterchoice = 'filterButtonAll'
        setStudents({})
        setFilterDisplay('All')
    }
    document.getElementById('filterButtonLocal').onclick = function(event) {
        window.lastfilterchoice = 'filterButtonLocal'
        setStudents({'location': 'local'})
        setFilterDisplay('Local')
    }
    document.getElementById('filterButtonArriving').onclick = function(event) {
        window.lastfilterchoice = 'filterButtonArriving'
        setStudents({'location': 'local', 'status': 1})
        setFilterDisplay('Arriving')
    }
    document.getElementById('filterButtonLeaving').onclick = function(event) {
        window.lastfilterchoice = 'filterButtonLeaving'
        setStudents({'location': 'local', 'status': 3})
        setFilterDisplay('Leaving')
    }
    document.getElementById('filterButtonFlagged').onclick = function(event) {
        window.lastfilterchoice = 'filterButtonFlagged'
        setStudents({'flag': true})
        setFilterDisplay('Flagged')
    }
    document.getElementById('filterButtonPresent').onclick = function(event) {
        window.lastfilterchoice = 'filterButtonPresent'
        setStudents({'location': 'local', 'status': 2})
        setFilterDisplay('Present')
    }

    const filterSearchInput = document.getElementById("filterSearchInput")
    filterSearchInput.addEventListener("input", function(event) {
        if (filterSearchInput.value != '') {
            window.searchActivated = true
            setStudents({'search':filterSearchInput.value})
            setFilterDisplay(`Search - ${filterSearchInput.value}`)
        } else {
            window.searchActivated = false
            document.getElementById(window.lastfilterchoice).click()
        }
        }
    )

    const locationSelector = window.document.getElementById('locationSelector')

    locationSelector.onchange = (event) => {
        updateUserLocation(locationSelector.value)
        if (updateUserLocation == 'error') {
            createAlertPopup(null, 'Error', 'Error while updating user location data')
            return 0
        }
        if (window.searchActivated == false) {
            setTimeout(() => {document.getElementById(window.lastfilterchoice).click()}, 1000);
        }
    }

    document.getElementById(window.lastfilterchoice).click()

    window.searchActivated = false
}

function updateDisplay() {
    console.log('Updating info...')
    if (window.searchActivated == false) {
        document.getElementById(window.lastfilterchoice).click()
    }
    setTimeout(updateDisplay, 15000);
}

document.addEventListener('DOMContentLoaded', () => {
    mainProcess()
    updateDisplay()   
});