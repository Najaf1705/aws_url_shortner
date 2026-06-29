import { config } from "../lib/config";
import { getOptionalAuthenticatedUser, getCookie } from "../lib/authUtils";
import { response } from "../lib/response";
import { getUserLinks, toGuestUserId } from "../lib/linkUtils";
import { getUserProfile, PRICING } from "../lib/premium";

export const handler = async (event: any) => {
    const headers = event.headers ?? {};
    const origin = headers.origin ?? headers.Origin;

    try {
        const payload = await getOptionalAuthenticatedUser(event);
        const cookieGuest = getCookie(event, "shorty-guest-id");
        const headerGuest = headers["shorty-guest-id"] ?? headers["Shorty-Guest-Id"];
        const guestId = cookieGuest ?? headerGuest ?? null;
        const userId = payload?.sub ?? toGuestUserId(guestId ?? "");

        console.log({
            table: config.urlTableName,
            userId,
            type: typeof userId,
        });

        const links = await getUserLinks(userId);

        console.log("user dets: ", links)

        // Include quota info for authenticated users
        let quotaInfo = null;
        if (payload) {
          const userProfile = await getUserProfile(payload.sub);
          quotaInfo = {
            freeLinksUsed: userProfile.freeLinksUsed,
            freeLinksLimit: PRICING.FREE_LINK_QUOTA,
            freeLinksRemaining: Math.max(0, PRICING.FREE_LINK_QUOTA - userProfile.freeLinksUsed),
            extraLinkCost: PRICING.EXTRA_LINK_COST,
            extensionCost: PRICING.EXTEND_30_DAYS_COST,
          };
        }

        return response(
            {
                message: "User Links",
                links,
                quota: quotaInfo,
            },
            { statusCode: 200, origin }
        );


    } catch (e: any) {
        if (e.message === "INVALID_TOKEN") {
            return response(
                { message: "User not authenticated" },
                { statusCode: 401, origin }
            );
        }

        if (e.message === "INVALID_GUEST_ID") {
            return response(
                { message: "Guest session missing" },
                { statusCode: 400, origin }
            );
        }

        console.error(
            "Redirect handler error:",
            e
        );

        return {
            statusCode: 500,
            headers: {
                "cache-control": "no-store",
            },
            body: "Internal error",
        };
    }
};
