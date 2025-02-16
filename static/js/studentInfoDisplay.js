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

var studentCardAmount = 0

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}  

function createNewStudentCard(studentName, studentInfo, studentTravelInfo, studentId, destroyTimeout) {
    studentCardAmount += 1

    setWindowSizeOnCardAmount(studentCardAmount)

    window.focus()

    var studentCard = document.createElement("iframe")
    const studentCardSlot = document.getElementById("studentCardSlot")

    studentCard.setAttribute("src", `/studentInfoFrame?studentName=${studentName}&studentInfo=${studentInfo}&studentTravelInfo=${studentTravelInfo}&studentId=${studentId}`)
    studentCardSlot.appendChild(studentCard)

    setTimeout(function(){
        studentCard.remove()
        studentCardAmount -= 1
        setWindowSizeOnCardAmount(studentCardAmount)
    }, destroyTimeout)
}

function setWindowSizeOnCardAmount(cardAmount) {
    window.resizeTo(440, 125 * cardAmount + 130)
}

document.addEventListener('DOMContentLoaded', () => {
    window.resizeTo(440, 120)
})