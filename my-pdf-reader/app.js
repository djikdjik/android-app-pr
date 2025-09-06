// This is required by PDF.js to find its worker script
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

const fileInput = document.getElementById('pdf-file-input');
const viewerContainer = document.getElementById('pdf-viewer-container');

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
        console.error('No PDF file selected.');
        viewerContainer.innerHTML = '<p>Please select a valid PDF file.</p>';
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = function() {
        const typedarray = new Uint8Array(this.result);
        renderPdf(typedarray);
    };
    fileReader.readAsArrayBuffer(file);
});

function renderPdf(data) {
    const loadingTask = pdfjsLib.getDocument(data);
    loadingTask.promise.then(pdf => {
        viewerContainer.innerHTML = ''; // Clear previous PDF
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            pdf.getPage(pageNum).then(function(page) {
                const scale = 1.5;
                const viewport = page.getViewport({ scale: scale });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                viewerContainer.appendChild(canvas);
                page.render({ canvasContext: context, viewport: viewport });
            });
        }
    });
}

// Register the Service Worker for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service worker registered.', reg))
            .catch(err => console.error('Service worker registration failed.', err));
    });
}