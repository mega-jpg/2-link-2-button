function loadMetaPixel(pixelIds) {
  return new Promise((resolve) => {
    if (!pixelIds.length) {
      resolve(false);
      return;
    }

    if (typeof window.fbq === "function") {
      pixelIds.forEach((pixelId) => window.fbq("init", pixelId));
      resolve(true);
      return;
    }

    (function bootstrapMetaPixel(windowObject, documentObject, scriptTag, scriptUrl) {
      if (windowObject.fbq) {
        return;
      }

      const fbq = function() {
        fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
      };

      if (!windowObject._fbq) {
        windowObject._fbq = fbq;
      }

      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.queue = [];
      windowObject.fbq = fbq;

      const scriptElement = documentObject.createElement(scriptTag);
      scriptElement.async = true;
      scriptElement.src = scriptUrl;
      scriptElement.onload = () => resolve(true);
      scriptElement.onerror = () => resolve(false);

      const firstScript = documentObject.getElementsByTagName(scriptTag)[0];
      firstScript.parentNode.insertBefore(scriptElement, firstScript);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    pixelIds.forEach((pixelId) => window.fbq("init", pixelId));
  });
}

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

  const pixelIds = [...new Set(trackedLinks.map((link) => link.dataset.pixelId).filter(Boolean))];
  loadMetaPixel(pixelIds);

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
