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

function getParameterByName(name) {
    return new URLSearchParams(window.location.search).get(name);
}

async function getStudentImage(studentId) {
    try {
        const response = await fetch("/getStudentImage", {
            method: 'POST',
            body: JSON.stringify({
                "studentid": studentId
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
                console.log(response.errorinfo)
                return 'error'
                break;
            case "ok":
                return responseJson.studentBase64Image
                break;
            default:
                return None
        }
        
    } catch (error) {
        console.log('Error:', error);
        return 'error'
    }
}

async function renderStudentImage(studentId) {
    var imageBase64 = await getStudentImage(studentId)
    document.getElementById('studentImage').src = imageBase64
}

document.addEventListener('DOMContentLoaded', () => {
    const studentName = getParameterByName('studentName')
    const studentInfo = getParameterByName('studentInfo')
    const studentTravelInfo = getParameterByName('studentTravelInfo')
    const studentId = getParameterByName('studentId')

    document.getElementById('studentName').textContent = studentName;
    document.getElementById('studentInfo').textContent = studentInfo;
    document.getElementById('studentTravelInfo').textContent = studentTravelInfo;

    if (studentImage != null) {
        renderStudentImage(studentId)
    }
})