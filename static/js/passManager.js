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

document.addEventListener('DOMContentLoaded', () => {
    var destinationIds = getLocationId(1)
    var floorIds = getLocationId(2)


    console.log(destinationIds)
    setLocationSelector(destinationIds);      
});