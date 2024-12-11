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
                return response.errorinfo
                break;
            case "ok":
                return responseJson.locationJson
                break;
            default:
                return None
        }
        removeLoader()
    } catch (error) {
        console.error('Error:', error);
        renderDialog(true, "Error", "An error occurred while requesting for item return");
        removeLoader()
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
                return response.errorinfo
                break;
            case "ok":
                return responseJson.userinfo
                break;
            default:
                return None
        }
        removeLoader()
    } catch (error) {
        console.error('Error:', error);
        renderDialog(true, "Error", "An error occurred while requesting for item return");
        removeLoader()
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
                return response.errorinfo
                break;
            case "ok":
                return responseJson.students
                break;
            default:
                return None
        }
        removeLoader()
    } catch (error) {
        console.error('Error:', error);
        renderDialog(true, "Error", "An error occurred while requesting for item return");
        removeLoader()
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
                renderDialog(true, "Error", "An error occurred while trying to reach data server");
                break;
            case "ok":
                break;
            default:
                alert("Request ERROR - Server returned unreadable data");
        }
        removeLoader()
    } catch (error) {
        console.error('Error:', error);
        renderDialog(true, "Error", "An error occurred while requesting for item return");
        removeLoader()
    }
}

async function setLocationSelector(locationJson) {
    const optionSlot = document.getElementById("locationSelector")
    var locations = []
    var locationJson = await locationJson
    for (i = 1; i < Object.keys(locationJson).length; i ++) {
        locations[i - 1] = locationJson[i]
    }
    console.log(locations)
    locations.forEach(curlocation => {
      const option = document.createElement('option');
      option.text = curlocation;
      optionSlot.appendChild(option);
    });
  }

async function setStudentIndex(studentsJson) {
    const studentListSlot = document.getElementById("studentList")
    var students = []
    var studentsJson = await studentsJson
    console.log(Object.keys(studentsJson).length)
    for (i = 0; i < Object.keys(studentsJson).length; i ++) {
        students[i ] = studentsJson[i + 1]
    }
    console.log(students)
    students.forEach(curstudent => {
        var studentli = document.createElement('li')

        studentListSlot.appendChild(studentli)
        studentli.classList.add('list-item')

        var studentNameDiv = document.createElement('div')
        var studentInfoDiv = document.createElement('div')
        
        studentli.appendChild(studentNameDiv);
        studentli.appendChild(studentInfoDiv);

        studentNameDiv.classList.add('studentNameDiv')
        studentInfoDiv.classList.add('studentInfoDiv')

        studentNameDiv.innerHTML = curstudent[0]
        studentInfoDiv.innerHTML = curstudent[1]

        console.log(curstudent[0])
    })
}

async function setUsernameTopbar(username) {
    const usernameTopbarDispaly = document.getElementById("usernameTopbar")
    usernameTopbarDispaly.textContent = username
}

async function mainProcess() {
    var destinationIds = getLocationId(1)
    var floorIds = getLocationId(2)
    var userinfo = await getUserInfo()
    var username = userinfo['user'][1]

    setUsernameTopbar(username)

    setLocationSelector(destinationIds);      
}

document.addEventListener('DOMContentLoaded', () => {
    mainProcess()
});