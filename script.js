function fireFallbackPixel(pixelId, eventName) {
  return new Promise((resolve) => {
    if (!pixelId) {
      resolve();
      return;
    }

    const pixelUrl = new URL("https://www.facebook.com/tr/");
    pixelUrl.searchParams.set("id", pixelId);
    pixelUrl.searchParams.set("ev", eventName);
    pixelUrl.searchParams.set("noscript", "1");

    const pixelImage = new Image();
    pixelImage.onload = () => resolve();
    pixelImage.onerror = () => resolve();
    pixelImage.src = pixelUrl.toString();

    window.setTimeout(resolve, 250);
  });
}

function trackAndRedirect(pixelId, destinationUrl) {
  const eventName = "Lead";
  let hasRedirected = false;

  const redirect = () => {
    if (hasRedirected) {
      return;
    }

    hasRedirected = true;
    window.location.href = destinationUrl;
  };

  if (typeof window.fbq === "function") {
    window.fbq("trackSingle", pixelId, eventName);
    window.setTimeout(redirect, 180);
    return;
  }

  fireFallbackPixel(pixelId, eventName).finally(redirect);
}

document.addEventListener("DOMContentLoaded", () => {
  const trackedLinks = Array.from(document.querySelectorAll(".cta[data-pixel-id][data-destination-url]"));

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
