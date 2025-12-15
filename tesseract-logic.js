async function recognizeImages() {
    outputTextarea.value = '';
    downloadBtn.disabled = true;
    copyBtn.disabled = true;
    startBtn.disabled = true;
    statusMsg.style.display = 'block';
    progressBarContainer.style.display = 'block';

    const lang = languageSelect.value;
    const worker = await Tesseract.createWorker({
        logger: m => {
            if (m.status === 'recognizing text') {
                const overallProgress = (imagesProcessed + m.progress) / files.length;
                progressBar.style.width = `${overallProgress * 100}%`;
                statusMsg.innerText = `Processing Image ${imagesProcessed + 1} of ${files.length}... ${(overallProgress * 100).toFixed(2)}% done`;
            } else if (m.status === 'loading' || m.status === 'initializing') {
                statusMsg.innerText = `Status: ${m.status.charAt(0).toUpperCase() + m.status.slice(1)}...`;
            }
        },
    });

    await worker.loadLanguage(lang);
    await worker.initialize(lang);

    let extractedText = '';
    let imagesProcessed = 0;
    for (const file of files) {
        const { data: { text } } = await worker.recognize(file);
        extractedText += `--- Page ${imagesProcessed + 1} ---\n\n` + text + '\n\n';
        imagesProcessed++;
    }

    outputTextarea.value = extractedText.trim();
    statusMsg.innerText = `Extraction complete! Extracted text from ${files.length} images.`;
    downloadBtn.disabled = false;
    copyBtn.disabled = false;
    startBtn.disabled = false;
    await worker.terminate();
    progressBarContainer.style.display = 'none';
    progressBar.style.width = '0%';
}