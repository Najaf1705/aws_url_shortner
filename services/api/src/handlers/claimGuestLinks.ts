import { getAuthenticatedUser, getCookie } from "../lib/authUtils";
import { claimGuestLinks, toGuestUserId } from "../lib/linkUtils";
import { response } from "../lib/response";

export const handler = async (event: any) => {
    const headers = event.headers ?? {};
    const origin = headers.origin ?? headers.Origin;

    try {
        const payload = await getAuthenticatedUser(event);
        const body = event?.body ? JSON.parse(event.body) : {};
        const cookieGuest = getCookie(event, "shorty-guest-id");
        const headerGuest = headers["shorty-guest-id"] ?? headers["Shorty-Guest-Id"] ?? body.guestId;
        const guestId = cookieGuest ?? headerGuest ?? null;
        const guestUserId = toGuestUserId(guestId ?? "");
        const claimed = await claimGuestLinks(guestUserId, payload.sub);

        return response(
            {
                message: "Guest links claimed",
                claimed,
            },
            { statusCode: 200, origin }
        );
    } catch (e: any) {
        if (
            e.message === "UNAUTHENTICATED" ||
            e.message === "INVALID_TOKEN"
        ) {
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

        throw e;
    }
};
