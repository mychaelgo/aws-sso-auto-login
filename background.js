chrome.runtime.onInstalled.addListener(() => {
    // Extension installed or updated logic here
    console.log('Extension installed or updated.');
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: checkAndLogin
        });
    }
});

function checkAndLogin() {
    const currentURL = window.location.href;

    // Check if the current tab URL contains 'device.sso.*.awamazon.com'
    const isSSOPage = currentURL.includes('device.sso') && currentURL.includes('amazonaws.com');
    if (isSSOPage) {
        const loginButton = document.getElementById('cli_verification_btn');
        if (loginButton) {
            // Click the 'cli_verification_btn'
            loginButton.click();
        }
    }

    const isUserConsentPage = currentURL.includes('awsapps.com/start/user-consent/authorize.html');
    if (isUserConsentPage) {
        const loginButtonAfterRedirection = document.getElementById('cli_login_button');
        if (loginButtonAfterRedirection) {
            // Click the 'cli_login_button'
            loginButtonAfterRedirection.click();
        }
    }
}
