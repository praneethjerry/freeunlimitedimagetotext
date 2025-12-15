const imageInput = document.getElementById('imageInput');
const selectImagesBtn = document.getElementById('selectImagesBtn');
const dropZone = document.getElementById('dropZone');
const languageSelect = document.getElementById('languageSelect');
const startBtn = document.getElementById('startBtn');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const outputTextarea = document.getElementById('output');
const progressBar = document.getElementById('progressBar');
const progressBarContainer = document.querySelector('.progress-bar-container');
const statusMsg = document.getElementById('statusMsg');
const togglePreviewBtn = document.getElementById('togglePreview');
const previewContainer = document.getElementById('previewContainer');
const uploadImagesRadio = document.getElementById('uploadImagesRadio');
const uploadFolderRadio = document.getElementById('uploadFolderRadio');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const body = document.body;

const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeBtn = document.getElementsByClassName("close")[0];

let files = [];
let isPreviewEnabled = false;

// --- Theme Toggle Logic ---
const currentTheme = localStorage.getItem('theme') || 'dark';
if (currentTheme === 'light') {
    body.classList.add('light-mode');
    themeToggleBtn.innerText = '🌙';
} else {
    body.classList.remove('light-mode');
    themeToggleBtn.innerText = '☀️';
}

themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    if (body.classList.contains('light-mode')) {
        themeToggleBtn.innerText = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        themeToggleBtn.innerText = '☀️';
        localStorage.setItem('theme', 'dark');
    }
});

// --- Modal Logic ---
function openModal(src) {
    modal.style.display = "block";
    modalImage.src = src;
}
function closeModal() {
    modal.style.display = "none";
}

closeBtn.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// --- Event Listeners ---
imageInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Drag and Drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
});

dropZone.addEventListener('drop', (e) => {
    handleFiles(e.dataTransfer.files);
});

// Upload Mode selection
uploadImagesRadio.addEventListener('change', () => {
    selectImagesBtn.innerText = "Select Images";
    imageInput.removeAttribute('webkitdirectory');
    imageInput.multiple = true;
    files = [];
    resetUI();
});

uploadFolderRadio.addEventListener('change', () => {
    selectImagesBtn.innerText = "Select Folder";
    imageInput.setAttribute('webkitdirectory', '');
    imageInput.multiple = true;
    files = [];
    resetUI();
});

startBtn.addEventListener('click', async () => {
    if (files.length === 0) {
        alert("Please upload at least one image.");
        return;
    }
    await recognizeImages();
});

downloadBtn.addEventListener('click', () => {
    const text = outputTextarea.value;
    if (text.trim() === "") {
        alert("No text to download!");
        return;
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

copyBtn.addEventListener('click', () => {
    outputTextarea.select();
    outputTextarea.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand('copy');
    alert("Text copied to clipboard!");
});

togglePreviewBtn.addEventListener('click', () => {
    isPreviewEnabled = !isPreviewEnabled;
    previewContainer.style.display = isPreviewEnabled ? 'flex' : 'none';
    togglePreviewBtn.innerText = isPreviewEnabled ? "Disable Previews" : "Enable Previews";
    if (isPreviewEnabled && files.length > 0) {
        showPreviews();
    }
});

// --- Functions ---
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleFiles(fileList) {
    files = [...fileList].filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
        selectImagesBtn.innerText = `Selected ${files.length} image(s)`;
        startBtn.disabled = false;
        copyBtn.disabled = true;
        dropZone.style.display = 'none';
        outputTextarea.value = "Images uploaded. Click 'Extract Text' to begin.";
        if (isPreviewEnabled) {
            showPreviews();
        }
    } else {
        resetUI();
    }
}

function resetUI() {
    dropZone.style.display = 'block';
    outputTextarea.value = "";
    startBtn.disabled = true;
    downloadBtn.disabled = true;
    copyBtn.disabled = true;
    previewContainer.style.display = 'none';
    previewContainer.innerHTML = '';
    selectImagesBtn.innerText = uploadImagesRadio.checked ? "Select Images" : "Select Folder";
    progressBarContainer.style.display = 'none';
    progressBar.style.width = '0%';
    statusMsg.style.display = 'none';
}

function showPreviews() {
    previewContainer.innerHTML = '';
    previewContainer.style.display = 'flex';

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'thumb';

            let hoverTimer;

            img.addEventListener('mouseenter', () => {
                hoverTimer = setTimeout(() => openModal(img.src), 1000);
            });

            img.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimer);
            });

            previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}