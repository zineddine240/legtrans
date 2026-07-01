import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { plan, userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (plan !== "pro" && plan !== "plus") {
      return NextResponse.json(
        { error: "Invalid plan. Choose 'pro' or 'plus'." },
        { status: 400 }
      );
    }

    const amount = plan === "pro" ? 4000 : 6000;
    const rawSecretKey = process.env.CHARGILY_SECRET_KEY;
    const secretKey = rawSecretKey ? rawSecretKey.trim() : "";

    if (!secretKey) {
      console.error("CHARGILY_SECRET_KEY is not defined in environment variables");
      return NextResponse.json(
        { error: "Payment configuration error. Please contact support." },
        { status: 500 }
      );
    }

    const origin = req.headers.get("origin") || new URL(req.url).origin;
    const successUrl = `${origin}/payment/success`;
    const failureUrl = `${origin}/payment/failed`;

    // Dynamically switch between Test and Live api endpoints based on key prefix
    const isLive = secretKey.startsWith("live_");
    const url = isLive
      ? "https://pay.chargily.net/api/v2/checkouts"
      : "https://pay.chargily.net/test/api/v2/checkouts";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "dzd",
        locale: "fr",
        success_url: successUrl,
        failure_url: failureUrl,
        metadata: {
          user_id: userId,
          plan: plan,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Chargily checkout API error response:", errorText);
      return NextResponse.json(
        { error: `Failed to create checkout session: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const checkoutUrl = data.checkout_url || data.url;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Invalid response from payment provider" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error("Error creating Chargily checkout:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
