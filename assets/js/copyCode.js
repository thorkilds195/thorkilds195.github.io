// This assumes that you're using Rouge; if not, update the selector
const codeBlocks = document.querySelectorAll('.code-header + .highlighter-rouge');
const copyCodeButtons = document.querySelectorAll('.copy-code-button');

copyCodeButtons.forEach((copyCodeButton, index) => {
    const codeBlock = codeBlocks[index]; // Get the corresponding code block

    // Move the copy button inside the code block
    codeBlock.querySelector("code").prepend(copyCodeButton);

    // Unhide the button after it has been moved
    copyCodeButton.style.display = 'block';

    copyCodeButton.addEventListener('click', () => {
        // Copy the code to the user's clipboard
        window.navigator.clipboard.writeText(codeBlock.innerText);

        // Update the button text visually
        const { innerText: originalText } = copyCodeButton;
        copyCodeButton.innerText = 'Copied!';

        // (Optional) Toggle a class for styling the button
        copyCodeButton.classList.add('copied');

        // After 2 seconds, reset the button to its initial UI
        setTimeout(() => {
            copyCodeButton.innerText = originalText;
            copyCodeButton.classList.remove('copied');
        }, 2000);
    });
});