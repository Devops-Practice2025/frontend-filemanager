// File Manager Application
// This runs entirely in the browser - no server needed!

// Store files in browser memory
let files = [];
let selectedFiles = [];
let currentFilter = 'all';

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    setupEventListeners();
    loadSampleFiles();
    updateFileCount();
}

// Set up all event listeners
function setupEventListeners() {
    // File input change
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    const dropZone = document.getElementById('dropZone');
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlightDropZone, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlightDropZone, false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        debounce(searchFiles, 300)();
    });
}

// Load sample files for demonstration
function loadSampleFiles() {
    const sampleFiles = [
        {
            id: generateId(),
            name: 'Welcome Document.pdf',
            size: '1.2 MB',
            type: 'pdf',
            uploadDate: getCurrentDate(),
            content: 'Welcome to the File Manager demo!'
        },
        {
            id: generateId(),
            name: 'Sample Image.jpg',
            size: '2.5 MB',
            type: 'image',
            uploadDate: getCurrentDate(),
            content: 'Sample image content'
        },
        {
            id: generateId(),
            name: 'Instructions.txt',
            size: '15 KB',
            type: 'text',
            uploadDate: getCurrentDate(),
            content: 'This is a sample text file for demonstration.'
        },
        {
            id: generateId(),
            name: 'Archive.zip',
            size: '8.7 MB',
            type: 'archive',
            uploadDate: getCurrentDate(),
            content: 'Sample archive content'
        }
    ];
    
    files = sampleFiles;
    displayFiles();
}

// Handle file selection from input
function handleFileSelect(event) {
    selectedFiles = Array.from(event.target.files);
    updateSelectedFilesDisplay();
}

// Update selected files display
function updateSelectedFilesDisplay() {
    const display = document.getElementById('selectedFiles');
    
    if (selectedFiles.length === 0) {
        display.innerHTML = '<p style="color: #95a5a6;">No files selected</p>';
        return;
    }
    
    let html = '<h4>Selected Files:</h4>';
    selectedFiles.forEach((file, index) => {
        const fileType = getFileTypeFromName(file.name);
        const fileSize = formatFileSize(file.size);
        html += `
            <div class="file-item-small">
                <i class="${getFileIconClass(fileType)}"></i>
                <span>${file.name}</span>
                <span class="file-size">(${fileSize})</span>
            </div>
        `;
    });
    
    display.innerHTML = html;
}

// Handle drag and drop
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlightDropZone() {
    document.getElementById('dropZone').style.borderColor = '#3498db';
    document.getElementById('dropZone').style.backgroundColor = '#e8f4fc';
}

function unhighlightDropZone() {
    document.getElementById('dropZone').style.borderColor = '#bdc3c7';
    document.getElementById('dropZone').style.backgroundColor = '#f8fafc';
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const droppedFiles = dt.files;
    selectedFiles = Array.from(droppedFiles);
    updateSelectedFilesDisplay();
    showStatusMessage(`${droppedFiles.length} file(s) ready to upload`, 'info');
}

// Upload files to browser memory
function uploadFiles() {
    if (selectedFiles.length === 0) {
        showStatusMessage('Please select files first!', 'error');
        return;
    }
    
    selectedFiles.forEach(file => {
        const fileObj = {
            id: generateId(),
            name: file.name,
            size: formatFileSize(file.size),
            type: getFileTypeFromName(file.name),
            uploadDate: getCurrentDate(),
            file: file
        };
        
        files.push(fileObj);
    });
    
    showStatusMessage(`${selectedFiles.length} file(s) uploaded successfully!`, 'success');
    
    // Clear selection
    selectedFiles = [];
    document.getElementById('fileInput').value = '';
    updateSelectedFilesDisplay();
    
    // Refresh display
    displayFiles();
    updateFileCount();
}

// Clear file selection
function clearSelection() {
    selectedFiles = [];
    document.getElementById('fileInput').value = '';
    updateSelectedFilesDisplay();
    showStatusMessage('Selection cleared', 'info');
}

// Display files in grid and table
function displayFiles(filesToShow = files) {
    displayFilesGrid(filesToShow);
    displayFilesTable(filesToShow);
}

// Display files in grid view
function displayFilesGrid(filesToShow) {
    const grid = document.getElementById('filesGrid');
    
    if (filesToShow.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open fa-3x"></i>
                <h3>No Files Found</h3>
                <p>Try uploading some files or changing your search filter.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    filesToShow.forEach(file => {
        html += `
            <div class="file-card" data-id="${file.id}">
                <div class="file-icon">
                    ${getFileIcon(file.type)}
                </div>
                <h4 class="file-name">${file.name}</h4>
                <div class="file-meta">
                    <div><i class="fas fa-file"></i> ${file.type.toUpperCase()}</div>
                    <div><i class="fas fa-weight-hanging"></i> ${file.size}</div>
                    <div><i class="fas fa-calendar"></i> ${file.uploadDate}</div>
                </div>
                <div class="file-actions">
                    <button class="action-btn preview-btn" onclick="previewFile('${file.id}')" title="Preview">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn download-btn" onclick="downloadFile('${file.id}')" title="Download">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteFile('${file.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

// Display files in table view
function displayFilesTable(filesToShow) {
    const tbody = document.getElementById('filesTableBody');
    
    if (filesToShow.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-table">
                    <i class="fas fa-inbox"></i> No files found
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    filesToShow.forEach(file => {
        html += `
            <tr data-id="${file.id}">
                <td>
                    <div class="table-file-name">
                        ${getFileIcon(file.type)}
                        <span>${file.name}</span>
                    </div>
                </td>
                <td><span class="file-type-badge">${file.type.toUpperCase()}</span></td>
                <td>${file.size}</td>
                <td>${file.uploadDate}</td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn preview-btn" onclick="previewFile('${file.id}')">
                            <i class="fas fa-eye"></i> Preview
                        </button>
                        <button class="table-btn download-btn" onclick="downloadFile('${file.id}')">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button class="table-btn delete-btn" onclick="deleteFile('${file.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Search files
function searchFiles() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    let filteredFiles = files;
    
    // Apply text search
    if (searchText) {
        filteredFiles = filteredFiles.filter(file => 
            file.name.toLowerCase().includes(searchText) ||
            file.type.toLowerCase().includes(searchText) ||
            file.size.toLowerCase().includes(searchText)
        );
    }
    
    // Apply type filter
    if (currentFilter !== 'all') {
        filteredFiles = filteredFiles.filter(file => 
            file.type === currentFilter
        );
    }
    
    displayFiles(filteredFiles);
    
    if (filteredFiles.length === 0 && (searchText || currentFilter !== 'all')) {
        showStatusMessage('No files found matching your criteria', 'info');
    }
}

// Filter files by type
function filterFiles(type) {
    currentFilter = type;
    
    // Update active filter tag
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    event.target.classList.add('active');
    
    searchFiles();
}

// Download file
function downloadFile(fileId) {
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
        showStatusMessage('File not found!', 'error');
        return;
    }
    
    if (file.file) {
        // For real uploaded files
        const url = URL.createObjectURL(file.file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else {
        // For sample files, create a blob
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    showStatusMessage(`Downloading ${file.name}...`, 'info');
}

// Preview file
function previewFile(fileId) {
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
        showStatusMessage('File not found!', 'error');
        return;
    }
    
    const modal = document.getElementById('filePreviewModal');
    const title = document.getElementById('previewTitle');
    const content = document.getElementById('previewContent');
    
    title.textContent = `Preview: ${file.name}`;
    
    let previewContent = '';
    if (file.type === 'pdf') {
        previewContent = `
            <div class="preview-pdf">
                <i class="fas fa-file-pdf fa-4x" style="color: #e74c3c;"></i>
                <h4>PDF File Preview</h4>
                <p>File: ${file.name}</p>
                <p>Size: ${file.size}</p>
                <p>Uploaded: ${file.uploadDate}</p>
                <p class="preview-note">
                    <i class="fas fa-info-circle"></i>
                    In a real application, this would show the actual PDF content.
                </p>
                <button class="btn btn-primary" onclick="downloadFile('${file.id}')">
                    <i class="fas fa-download"></i> Download PDF
                </button>
            </div>
        `;
    } else if (file.type === 'image') {
        previewContent = `
            <div class="preview-image">
                <i class="fas fa-file-image fa-4x" style="color: #3498db;"></i>
                <h4>Image Preview</h4>
                <p>File: ${file.name}</p>
                <p>Size: ${file.size}</p>
                <p>Uploaded: ${file.uploadDate}</p>
                <p class="preview-note">
                    <i class="fas fa-info-circle"></i>
                    In a real application, this would display the actual image.
                </p>
                <button class="btn btn-primary" onclick="downloadFile('${file.id}')">
                    <i class="fas fa-download"></i> Download Image
                </button>
            </div>
        `;
    } else {
        previewContent = `
            <div class="preview-generic">
                ${getFileIcon(file.type, 'fa-4x')}
                <h4>${file.type.toUpperCase()} File Preview</h4>
                <p>File: ${file.name}</p>
                <p>Type: ${file.type.toUpperCase()}</p>
                <p>Size: ${file.size}</p>
                <p>Uploaded: ${file.uploadDate}</p>
                ${file.content ? `<div class="preview-content"><pre>${file.content}</pre></div>` : ''}
                <button class="btn btn-primary" onclick="downloadFile('${file.id}')">
                    <i class="fas fa-download"></i> Download File
                </button>
            </div>
        `;
    }
    
    content.innerHTML = previewContent;
    modal.classList.add('show');
}

// Delete file
function deleteFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }
    
    const fileIndex = files.findIndex(f => f.id === fileId);
    if (fileIndex > -1) {
        const fileName = files[fileIndex].name;
        files.splice(fileIndex, 1);
        showStatusMessage(`Deleted "${fileName}"`, 'success');
        displayFiles();
        updateFileCount();
    }
}

// Show help modal
function showHelp() {
    document.getElementById('helpModal').classList.add('show');
}

// Close modal
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

// Update file count
function updateFileCount() {
    const count = files.length;
    document.getElementById('fileCount').textContent = `${count} file${count !== 1 ? 's' : ''}`;
}

// Show status message
function showStatusMessage(text, type = 'info') {
    const messageDiv = document.getElementById('statusMessage');
    messageDiv.textContent = text;
    messageDiv.className = `status-message status-${type}`;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
    
    // Show immediately
    setTimeout(() => {
        messageDiv.style.display = 'block';
    }, 10);
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getCurrentDate() {
    const now = new Date();
    return now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getFileTypeFromName(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext)) return 'image';
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return 'document';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';
    return 'other';
}

function getFileIcon(type, sizeClass = '') {
    const icons = {
        'pdf': `<i class="fas fa-file-pdf ${sizeClass}" style="color: #e74c3c;"></i>`,
        'image': `<i class="fas fa-file-image ${sizeClass}" style="color: #3498db;"></i>`,
        'document': `<i class="fas fa-file-word ${sizeClass}" style="color: #2c3e50;"></i>`,
        'text': `<i class="fas fa-file-alt ${sizeClass}" style="color: #f39c12;"></i>`,
        'archive': `<i class="fas fa-file-archive ${sizeClass}" style="color: #8e44ad;"></i>`,
        'other': `<i class="fas fa-file ${sizeClass}" style="color: #95a5a6;"></i>`
    };
    return icons[type] || icons['other'];
}

function getFileIconClass(type) {
    const classes = {
        'pdf': 'fas fa-file-pdf',
        'image': 'fas fa-file-image',
        'document': 'fas fa-file-word',
        'text': 'fas fa-file-alt',
        'archive': 'fas fa-file-archive',
        'other': 'fas fa-file'
    };
    return classes[type] || classes['other'];
}

function formatFileSize(bytes) {
    if (typeof bytes !== 'number') bytes = 1024; // Default for sample files
    if (bytes < 1024) return bytes + ' Bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions available globally
window.uploadFiles = uploadFiles;
window.clearSelection = clearSelection;
window.searchFiles = searchFiles;
window.filterFiles = filterFiles;
window.downloadFile = downloadFile;
window.previewFile = previewFile;
window.deleteFile = deleteFile;
window.showHelp = showHelp;
window.closeModal = closeModal;