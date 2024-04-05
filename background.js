chrome.runtime.onInstalled.addListener(() => {
    // Extension installed or updated logic here
    console.log('Extension installed or updated.');
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        setTimeout(() => {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                function: checkAndLogin,
                args: [tabId]
            });
        }, 1500); // Delay of 1.5 seconds
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'closeTab') {
        setTimeout(() => {
            chrome.tabs.remove(message.tabId);
        }, 1500); // Delay of 1.5 seconds
    }
});

function checkAndLogin(tabId) {
    try {
        const currentURL = window.location.href;
        console.log('Current URL:', currentURL);
        // Check if the current tab URL contains 'device.sso.*.awamazon.com'
        const isSSOPage = currentURL.includes('device.sso') && currentURL.includes('amazonaws.com');
        if (isSSOPage) {
            const loginButton = document.getElementById('cli_verification_btn');
            if (loginButton) {
                // Click the 'cli_verification_btn'
                loginButton.click();
                console.log('Clicked on cli_verification_btn');
            }
        }
        // Check if the current tab URL contains 'awsapps.com' and 'start'
        const isUserConsentPage = currentURL.includes('awsapps.com') && currentURL.includes('start');
        if (isUserConsentPage) {
            const loginButtonAfterRedirection = document.getElementById('cli_login_button');
            // check if the 'cli_login_button' exists
            if (loginButtonAfterRedirection) {
                // Click the 'cli_login_button'
                loginButtonAfterRedirection.click();
                console.log('Clicked on cli_login_button new page');
                chrome.runtime.sendMessage({ action: 'closeTab', tabId: tabId });
            }
        }
        // Check if the current tab URL contains 'awsapps.com' and 'start'
        // this function is used if the button id changes and will find the english text in the button to allow access
        const isNewUserConsentPage = currentURL.includes('awsapps.com') && currentURL.includes('start');
        if (isNewUserConsentPage) {
            // Get all buttons on the page
            const buttons = document.getElementsByTagName('button');
            for (let i = 0; i < buttons.length; i++) {
                // If the button's text content is 'Allow access', click it
                if (buttons[i].textContent === 'Allow access') {
                    buttons[i].click();
                    console.log('Clicked on Allow access button');
                    chrome.runtime.sendMessage({ action: 'closeTab', tabId: tabId });
                    break;
                }
            }
        }
        // console.log('No action required.');
        // // list the ids of all buttons on the page
        // const buttons = document.getElementsByTagName('button');
        // for (let i = 0; i < buttons.length; i++) {
        //     console.log('Button ID:', buttons[i].id);
        // }

    } catch (error) {
        console.error('An error occurred:', error);
    }
}
