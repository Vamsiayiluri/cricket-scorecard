/**
 * Utilities for capturing and sharing the result share card.
 * Uses html2canvas for DOM-to-canvas rendering.
 */

const CAPTURE_SCALE = 2; // retina quality

/**
 * Capture a DOM element to a canvas.
 * @param {HTMLElement} element
 * @returns {Promise<HTMLCanvasElement>}
 */
export const captureElement = async (element) => {
  const { default: html2canvas } = await import("html2canvas");
  return html2canvas(element, {
    scale: CAPTURE_SCALE,
    useCORS: true,
    logging: false,
    backgroundColor: null,
    allowTaint: true,
  });
};

/**
 * Download the captured canvas as a PNG file.
 * @param {HTMLCanvasElement} canvas
 * @param {string} filename
 */
export const downloadCanvas = (canvas, filename = "match-result.png") => {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
};

/**
 * Share canvas image via Web Share API (file share).
 * Falls back to URL-only share if file sharing is not supported.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{ title?: string, url?: string }} options
 * @returns {Promise<void>}
 */
export const shareCanvas = async (canvas, { title = "Match Result", url } = {}) => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error("Canvas toBlob failed"));
        return;
      }

      const file = new File([blob], "match-result.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title });
          resolve();
        } catch (err) {
          if (err.name !== "AbortError") reject(err);
          else resolve(); // user cancelled
        }
        return;
      }

      // Fallback: share URL only
      if (navigator.share && url) {
        try {
          await navigator.share({ title, url });
          resolve();
        } catch (err) {
          if (err.name !== "AbortError") reject(err);
          else resolve();
        }
        return;
      }

      reject(new Error("Web Share API not supported in this browser."));
    }, "image/png");
  });
};

/**
 * Copy canvas image to clipboard.
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<void>}
 */
export const copyCanvasToClipboard = async (canvas) => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error("Canvas toBlob failed"));
        return;
      }
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        resolve();
      } catch {
        reject(new Error("Clipboard image write not supported in this browser."));
      }
    }, "image/png");
  });
};

/**
 * Build a safe filename from a match title.
 * @param {string} title  e.g. "Team A vs Team B"
 * @returns {string}      e.g. "team-a-vs-team-b-result.png"
 */
export const buildFilename = (title = "match") =>
  `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-result.png`;
