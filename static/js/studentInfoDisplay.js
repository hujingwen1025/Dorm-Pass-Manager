var studentCardAmount = 0

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}  

function createNewStudentCard(studentName, studentInfo, studentTravelInfo, studentImage, destroyTimeout) {
    studentCardAmount += 1

    setWindowSizeOnCardAmount(studentCardAmount)

    window.focus()

    var studentCard = document.createElement("iframe")
    const studentCardSlot = document.getElementById("studentCardSlot")

    studentCard.setAttribute("src", `/studentInfoFrame?studentName=${studentName}&studentInfo=${studentInfo}&studentTravelInfo=${studentTravelInfo}&studentImage=${studentImage}`)
    studentCardSlot.appendChild(studentCard)

    setTimeout(function(){
        studentCard.remove()
        studentCardAmount -= 1
        setWindowSizeOnCardAmount(studentCardAmount)
    }, destroyTimeout)
}

function setWindowSizeOnCardAmount(cardAmount) {
    window.resizeTo(425, 120 * (cardAmount + 1))
}

document.addEventListener('DOMContentLoaded', () => {

})