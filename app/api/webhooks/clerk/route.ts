/* eslint-disable camelcase */
import { clerkClient } from "@clerk/clerk-sdk-node";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.action";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add WEBHOOK_SECRET to your environment variables.");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.warn("Missing Svix headers", { svix_id, svix_timestamp, svix_signature });
    return new Response("Missing Svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }

  const eventType = evt.type;
  const { id } = evt.data;

  if (!id || typeof id !== "string") {
    return new Response("Missing or invalid user ID", { status: 400 });
  }

  // Handle user.created
  if (eventType === "user.created") {
    const { email_addresses, image_url, first_name, last_name, username } = evt.data;

    const email = email_addresses?.[0]?.email_address;
    if (!username || !email) {
      return new Response("Missing required user fields", { status: 400 });
    }

    const user = {
      clerkId: id,
      email,
      username,
      firstName: first_name ?? "",
      lastName: last_name ?? "",
      photo: image_url ?? "",
    };

    try {
      const newUser = await createUser(user);

      if (newUser) {
        await clerkClient.users.updateUserMetadata(id, {
          publicMetadata: { userId: newUser._id },
        });
      }

      return NextResponse.json({ message: "User created", user: newUser });
    } catch (err) {
      console.error("Failed to create user:", err);
      return new Response("User creation error", { status: 500 });
    }
  }

  // Handle user.updated
  if (eventType === "user.updated") {
    const { image_url, first_name, last_name, username } = evt.data;

    const user = {
      firstName: first_name ?? "",
      lastName: last_name ?? "",
      username: username ?? "",
      photo: image_url ?? "",
    };

    try {
      const updatedUser = await updateUser(id, user);
      return NextResponse.json({ message: "User updated", user: updatedUser });
    } catch (err) {
      console.error("Failed to update user:", err);
      return new Response("User update error", { status: 500 });
    }
  }

  // Handle user.deleted
  if (eventType === "user.deleted") {
    try {
      const deletedUser = await deleteUser(id);
      return NextResponse.json({ message: "User deleted", user: deletedUser });
    } catch (err) {
      console.error("Failed to delete user:", err);
      return new Response("User deletion error", { status: 500 });
    }
  }

  console.log(`Unhandled webhook: ${eventType} (ID: ${id})`);
  console.log("Payload:", body);

  return new Response("Webhook received", { status: 200 });
}
