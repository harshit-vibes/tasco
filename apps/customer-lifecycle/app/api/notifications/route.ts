import { NextRequest } from "next/server";
import { createNotificationsHandler } from "@tasco/api";

const APP_ID = "customer-lifecycle";

const { handleGet, handlePost } = createNotificationsHandler({
  appId: APP_ID,
  defaultLimit: 20,
});

export const GET = handleGet;
export const POST = handlePost;
