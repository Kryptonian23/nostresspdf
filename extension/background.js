// NoStressPDF Chrome Extension - Background Service Worker

// Set this to the public NoStressPDF URL before publishing the extension.
const NOSTRESSPDF_URL = 'http://localhost:3000/en';

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
    // Create main context menu item
    chrome.contextMenus.create({
        id: 'nostresspdf-open',
        title: 'Open with NoStressPDF',
        contexts: ['link', 'page']
    });

    // Create submenu for specific tools
    chrome.contextMenus.create({
        id: 'nostresspdf-merge',
        parentId: 'nostresspdf-open',
        title: 'Merge PDFs',
        contexts: ['link', 'page']
    });

    chrome.contextMenus.create({
        id: 'nostresspdf-compress',
        parentId: 'nostresspdf-open',
        title: 'Compress PDF',
        contexts: ['link', 'page']
    });

    chrome.contextMenus.create({
        id: 'nostresspdf-convert',
        parentId: 'nostresspdf-open',
        title: 'Convert to PDF',
        contexts: ['link', 'page']
    });

    chrome.contextMenus.create({
        id: 'nostresspdf-all-tools',
        parentId: 'nostresspdf-open',
        title: 'All Tools →',
        contexts: ['link', 'page']
    });

    console.log('NoStressPDF context menus created');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    let url = NOSTRESSPDF_URL;

    switch (info.menuItemId) {
        case 'nostresspdf-merge':
            url = `${NOSTRESSPDF_URL}/tools/merge-pdf`;
            break;
        case 'nostresspdf-compress':
            url = `${NOSTRESSPDF_URL}/tools/compress-pdf`;
            break;
        case 'nostresspdf-convert':
            url = `${NOSTRESSPDF_URL}/tools/jpg-to-pdf`;
            break;
        case 'nostresspdf-all-tools':
        case 'nostresspdf-open':
            url = NOSTRESSPDF_URL;
            break;
        default:
            url = NOSTRESSPDF_URL;
    }

    // Open NoStressPDF in a new tab
    chrome.tabs.create({ url: url });
});

// Log when service worker starts
console.log('NoStressPDF background service worker started');
