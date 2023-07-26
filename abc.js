document.addEventListener("DOMContentLoaded", function() {
    let htmlContent = `
        <div style="font-size: 80%">
            <h3 style="font-weight: bold; font-size: 125%">
                ABCABC
            </h3>
            <p>
                Play around with the input data to explore different data landscapes.
            </p>
            <!-- more HTML content here -->
            <h4>
                If you're curious about the code, check
                <a href="https://github.com/hyungkwonko/umato">
                    https://github.com/hyungkwonko/umato
                </a>.
            </h4>
        </div>`;
  
    let container = document.querySelector(".bundle-container");
    container.insertAdjacentHTML('beforeend', htmlContent);
  });