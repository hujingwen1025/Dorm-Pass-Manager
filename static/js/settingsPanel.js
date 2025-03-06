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

window.onbeforeunload = function(e) {
    return 'Are you sure you want to leave this page?  You will lose any unsaved data.';
};

async function getLocationInfo(locationFilter) {
    try {
        const response = await fetch("/api/getLocationInfo", {
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

async function searchLocations(filters) {
    try {
        const response = await fetch("/api/searchLocations", {
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

async function doEditLocationDatalistUpdate(name) {
    const locationEditDatalist = document.getElementById('editUserFoundLocations')
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

async function setUsernameTopbar(username) {
    const usernameTopbarDispaly = document.getElementById("usernameTopbar")
    usernameTopbarDispaly.textContent = username
}

async function loadUserInfoEdit() {
    var userList = await searchUsers({'settingsEdit': 'true'})
    if (userList.length > 0) {
        dlog('found user, updating')
        window.userEditId = userList[0]
        var nameInfo = userList[1]
        var emailInfo = userList[2]
        var roleInfo = userList[3]
        var locationInfo = await getLocationInfo({'id': userList[4]})
        locationInfo = locationInfo[0][1]

        document.getElementById('editUserName').value = nameInfo
        document.getElementById('editUserEmail').value = emailInfo
        document.getElementById('editUserLocation').value = locationInfo
    } else {
        createAlertPopup(5000, null, 'Error', 'Error while loading user information')
        return 0
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

async function editUser(userName, userEmail, userLocation, userPassword) {
    try {
        const response = await fetch("/api/editUser", {
            method: 'POST',
            body: JSON.stringify({
                "settingsEdit": 'true',
                "name": userName,
                "email": userEmail,
                "location": userLocation,
                "password": userPassword
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
                createAlertPopup(5000, null, 'Error Saving Settings', responseJson.errorinfo)
                return 'error'
            case "ok":
                return 0
            default:
                return 'error'
        }

    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
    }
}

async function doUserEdit() {
    var userName = document.getElementById('editUserName').value
    var userEmail = document.getElementById('editUserEmail').value
    var userLocation = document.getElementById('editUserLocation').value
    var userPassword = document.getElementById('editUserPassword').value

    var editUserResult = await editUser(userName, userEmail, userLocation, userPassword)

    if (editUserResult == 'error') {
        dlog('Settings Save Error')
    } else {
        createAlertPopup(5000, 'success', 'Settings Saved', 'Settings has been successfully saved to the server')
    }
}

async function searchUsers(filters) {
    try {
        const response = await fetch("/api/searchUsers", {
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
                return 'error'
        }

    } catch (error) {
        dlog('Error:', error);
        createAlertPopup(5000, null, 'Error', 'Error while sending data to server')
        return 'error'
    }
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

    const editLocationDatalistDisplay = document.getElementById('editUserLocation')
    editLocationDatalistDisplay.oninput = function(){doEditLocationDatalistUpdate(editLocationDatalistDisplay.value)}
    editLocationDatalistDisplay.addEventListener('focusout', (event) => {
        loadLocationInfoEdit(editLocationDatalistDisplay.value)
    });

    const editUserButtonSubmit = document.getElementById('editUserButtonSubmit')
    editUserButtonSubmit.onclick = function () {doUserEdit()}
};

document.addEventListener('DOMContentLoaded', () => {
    mainProcess()
    loadUserInfoEdit()
});