function fireFacebookPixel(pixelId) {
  return new Promise((resolve) => {
    if (!pixelId) {
      resolve();
      return;
    }

    const pixelUrl = new URL("https://www.facebook.com/tr/");
    pixelUrl.searchParams.set("id", pixelId);
    pixelUrl.searchParams.set("ev", "PageView");
    pixelUrl.searchParams.set("noscript", "1");

    const pixelImage = new Image();
    pixelImage.onload = () => resolve();
    pixelImage.onerror = () => resolve();
    pixelImage.src = pixelUrl.toString();

    window.setTimeout(resolve, 250);
  });
}

function trackAndRedirect(pixelId, destinationUrl) {
  fireFacebookPixel(pixelId).finally(() => {
    window.location.href = destinationUrl;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const trackedLinks = document.querySelectorAll(".cta[data-pixel-id][data-destination-url]");

  if (!trackedLinks.length) {
    return;
  }

  trackedLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const pixelId = link.dataset.pixelId;
      const destinationUrl = link.dataset.destinationUrl;

      if (!destinationUrl) {
        return;
      }

      trackAndRedirect(pixelId, destinationUrl);
    });
  });
});
