// merger.js

document.getElementById('dropArea').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', handleFiles);
document.getElementById('dropArea').addEventListener('dragover', handleDragOver);
document.getElementById('dropArea').addEventListener('drop', handleDrop);

let files = [];

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    handleFiles({ target: { files: droppedFiles } });
}

function handleFiles(event) {
    const newFiles = Array.from(event.target.files);
    files = [...files, ...newFiles]; // Maintain the previous files

    // Update file list
    updateFileList();

    // Enable the merge button if we have at least two files
    document.getElementById('mergeButton').disabled = files.length < 2;
}

function updateFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = ''; // Clear previous list

    files.forEach((file, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${file.name}`;
        fileList.appendChild(li);
    });

    // Show queue card if files are added
    document.getElementById('queueCard').classList.remove('hidden');
}

document.getElementById('mergeButton').addEventListener('click', mergeFiles);

function mergeFiles() {
    // Show progress bar
    const progressBarContainer = document.getElementById('progressBarContainer');
    const progressBar = document.getElementById('progressBar');
    progressBarContainer.classList.remove('hidden');
    progressBar.style.width = '0%';

    const zip = new JSZip();
    let totalFiles = files.length;
    let processedFiles = 0;

    // Create a promise for each file to extract and merge its content
    const promises = files.map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                JSZip.loadAsync(e.target.result).then((zipFile) => {
                    // Merge contents of this zip into the main zip
                    Object.keys(zipFile.files).forEach(filename => {
                        // Check for conflicts
                        if (zip.file(filename)) {
                            handleConflict(filename, zipFile.file(filename)).then((chosenFile) => {
                                if (chosenFile) {
                                    zip.file(filename, zipFile.file(filename).async("blob"));
                                }
                                processedFiles++;
                                updateProgressBar(processedFiles, totalFiles, progressBar);
                                resolve();
                            });
                        } else {
                            zip.file(filename, zipFile.file(filename).async("blob"));
                            processedFiles++;
                            updateProgressBar(processedFiles, totalFiles, progressBar);
                            resolve();
                        }
                    });
                }).catch(reject);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file); // Read as ArrayBuffer
        });
    });

    Promise.all(promises).then(() => {
        // Generate the final ZIP file
        return zip.generateAsync({ type: 'blob' });
    }).then((blob) => {
        // Create a URL for the ZIP and set it to the download link
        const url = URL.createObjectURL(blob);
        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = url;
        downloadLink.classList.remove('hidden');
        downloadLink.textContent = 'Download Merged Pack'; // Change button text
        document.getElementById('mergeButton').classList.add('hidden'); // Hide the merge button
        progressBar.style.width = '100%'; // Complete progress bar

        // Show the Start Over button
        document.getElementById('startOverButton').classList.remove('hidden');
    }).catch((error) => {
        console.error('Error merging files:', error);
    });
}

// Function to handle conflicts
function handleConflict(filename, newFile) {
    return new Promise((resolve) => {
        showPopup(`Conflict detected for file "${filename}". Which Pack's Files Should Be Used?`)
            .then((userChoice) => resolve(userChoice));
    });
}

// Custom popup function
function showPopup(message) {
    return new Promise((resolve) => {
        // Create popup element
        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.innerHTML = `
            <div class="popup-content">
                <h3>File Conflict</h3> <!-- Title for the popup -->
                <p>${message}</p>
                <button id="confirmPopup" class="popup-first">Use Second Pack</button>
                <button id="cancelPopup" class="popup-second">Use First Pack</button>
            </div>
        `;
        document.body.appendChild(popup);

        // Center the popup and apply fly up animation
        setTimeout(() => {
            popup.classList.remove('hidden');
            popup.classList.add('fly-up');
            popup.style.opacity = '1'; // Show popup with fade in
        }, 10);

        // Handle button clicks
        document.getElementById('confirmPopup').onclick = () => {
            resolve(true);
            document.body.removeChild(popup);
        };
        document.getElementById('cancelPopup').onclick = () => {
            resolve(false);
            document.body.removeChild(popup);
        };
    });
}

// Update progress bar
function updateProgressBar(processedFiles, totalFiles, progressBar) {
    const percent = (processedFiles / totalFiles) * 100;
    progressBar.style.width = `${percent}%`;
}
