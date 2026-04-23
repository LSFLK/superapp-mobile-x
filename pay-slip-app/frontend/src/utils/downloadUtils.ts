/**
 * Utility function to download a file from a URL.
 * Handles both regular URLs and blob URLs properly.
 * @param url - The URL to download from
 * @param fileName - The name to save the file as
 * @throws Error if download fails
 */
export async function downloadFile(
  url: string,
  fileName: string,
): Promise<void> {
  // basic protocol validation: only allow http(s), blob, or data URLs
  if (
    !url.startsWith("http://") &&
    !url.startsWith("https://") &&
    !url.startsWith("blob:") &&
    !url.startsWith("data:")
  ) {
    throw new Error("Invalid URL protocol for download");
  }

  try {
    let downloadUrl = url;
    let shouldRevoke = false;

    // If it's not already a blob or data URL, fetch it with proper error handling
    if (!url.startsWith("blob:") && !url.startsWith("data:")) {
      try {
        // Remove strict CORS mode - let browser handle it naturally
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const blob = await response.blob();
        downloadUrl = window.URL.createObjectURL(blob);
        shouldRevoke = true;
      } catch (fetchErr) {
        console.error("Fetch failed, attempting direct download:", fetchErr);
        // Continue with original URL - let browser handle it
        downloadUrl = url;
      }
    }

    // Create and trigger download link
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      if (shouldRevoke) {
        window.URL.revokeObjectURL(downloadUrl);
      }
    }, 100);
  } catch (error) {
    console.error("Download error:", error);
    throw new Error(
      `Failed to download: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Simple download that just opens the file in a new tab
 * (fallback for CORS-restricted resources)
 * @param url - The URL to open
 */
export function openFileInNewTab(url: string): void {
  window.open(url, "_blank");
}
