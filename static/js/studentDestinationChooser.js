var destinationButtonAmount = 0;

function getParameterByName(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function parseJSON(str) {
    return str ? JSON.parse(str) : {};
}

function createButtons(jsonData) {
    const container = document.getElementById('destinationButtonContainer');
    
    if (!container) {
        console.error('Button container element not found');
        return;
    }

    Object.entries(jsonData).forEach(([key, value]) => {
        destinationButtonAmount += 1;

        const [displayText, buttonId, isEnabled] = value.split(',');
        
        const button = document.createElement('button');
        button.textContent = displayText;
        button.id = buttonId;
        if (isEnabled == 1) {
            button.disabled = false;
        } else {
            button.disabled = true;
        }

        button.addEventListener('click', () => {
            parent.postMessage("doneselect" + button.id, '*')
            close()
        });

        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'button-wrapper';
        container.appendChild(buttonWrapper);

        buttonWrapper.appendChild(button);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const studentName = getParameterByName('studentName')
    const studentInfo = getParameterByName('studentInfo')
    const studentImage = getParameterByName('studentImage')

    const closeButton = document.getElementById('closeButton');

    document.getElementById('studentName').textContent = studentName;
    document.getElementById('studentInfo').textContent = studentInfo;

    if (studentImage != null) {
        document.getElementById('studentImage').src = studentImage;
    }

    const destinationButtonText = getParameterByName('destinationButtonJson').replaceAll("%27", '"').replaceAll("%22", '"').replaceAll("%20", ' ').replaceAll("'", '"')
    const destinationButtonJson = parseJSON(destinationButtonText)

    if (Object.keys(destinationButtonJson).length > 0) {
        createButtons(destinationButtonJson);
    } else {
        console.log('No valid JSON data provided');
    }

    closeButton.addEventListener('click', () => {
        close()
    });

    window.resizeTo(530, 70 * destinationButtonAmount + 275)
})