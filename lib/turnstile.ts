interface SiteVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new Error("TURNSTILE_SECRET_KEY is not configured");
  }

  const formData = new URLSearchParams();
  formData.set("secret", secret);
  formData.set("response", token);

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = (await res.json()) as SiteVerifyResponse;
    return data.success === true;
  } catch {
    return false;
  }
}
