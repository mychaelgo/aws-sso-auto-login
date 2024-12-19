chrome.runtime.onInstalled.addListener(() => {
    // Extension installed or updated logic here
    console.log('Extension installed or updated.');
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    // skip urls like "chrome://" to avoid extension error
    if (tab.url?.startsWith('chrome://')) return undefined;

    if (changeInfo.status === 'complete') {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: checkAndLogin,
            args: [tabId]
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'closeTab') {
        chrome.tabs.remove(message.tabId);
    }
});

async function checkAndLogin(tabId) {
    try {
        const currentURL = window.location.href;
        // Check if the current tab URL contains 'device.sso.*.awamazon.com'
        if (isSSOPage(currentURL)) {
            const loginButton =  await waitForElement(() => document.getElementById('cli_verification_btn'));
            if (loginButton) {
                // Click the 'cli_verification_btn'
                loginButton.click();
                console.log('Clicked on cli_verification_btn');
            }
        }
        // Check if the current tab URL contains 'awsapps.com' and 'start'
        if (isUserConsentPage(currentURL)) {
            const loginButtonAfterRedirection = await waitForElement(() => document.getElementById('cli_login_button'));
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
        if (isNewUserConsentPage(currentURL)) {
            const allowButton = await waitForElement(() => {
                const button = document.querySelector('button[data-testid="allow-access-button"]');

                if (button?.textContent.toLowerCase().includes('allow')) {
                    return button;
                }
            });

            if (allowButton) {
                allowButton.click();
                console.log('Clicked on Allow access button');

                await waitForElement(() => document.querySelector('.awsui-context-alert')?.textContent.toLocaleLowerCase().startsWith('request approved'));

                chrome.runtime.sendMessage({ action: 'closeTab', tabId: tabId });
            }
        }

    } catch (error) {
        console.error('An error occurred:', error);
    }


    function isSSOPage(url) {
        return /^https:\/\/device\.sso\.[^.]*\.amazonaws\.com/.test(url);
    }

    function isUserConsentPage(url) {
        return /^https:\/\/[^.]+\.awsapps\.com\/start/.test(url);
    }

    function isNewUserConsentPage(url) {
        return isUserConsentPage(url);
    }

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function waitForElement(fn, timeout = 1500) {
        const startTime = Date.now();

        do {
            const result = fn();
            if (result) {
                return result;
            }

            await wait(100);
        } while (Date.now() - startTime < timeout);
    }
}
