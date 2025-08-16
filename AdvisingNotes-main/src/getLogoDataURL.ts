const CACHE_KEY = "stw_logo_dataurl_v1";

export async function getLogoDataURL(path = "/STW_LOGO.png"): Promise<string | null> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) return cached;

    const res = await fetch(path, { cache: "force-cache" });
    if (!res.ok) return null;

    const blob = await res.blob();
    // Optional: warn if too big — export a ~300px PNG/JPG for smaller PDFs
    if (blob.size > 300_000) console.warn("Logo is large; consider ~300px export.");

    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    localStorage.setItem(CACHE_KEY, dataUrl);
    return dataUrl;
  } catch (e) {
    console.error("getLogoDataURL failed", e);
    return null;
  }
}
