/* eslint-disable camelcase */
import { clerkClient, WebhookEvent } from "@clerk/clerk-sdk-node";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.action";
import { CreateUserParams, UpdateUserParams } from "@/lib/databse/types";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
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
    return new Response("Error occured", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  // CREATE
  if (eventType === "user.created") {
    const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

    const userData: CreateUserParams = {
      clerkId: id,
      email: email_addresses[0].email_address,
      username: username || email_addresses[0].email_address.split('@')[0],
      firstName: first_name || '',
      lastName: last_name || '',
      photo: image_url || '',
    };

    console.log("CREATE - Event Data:", JSON.stringify(evt.data, null, 2));
    console.log("CREATE - createUser Payload:", JSON.stringify(userData, null, 2));

    try {
      const newUser = await createUser(userData);
      console.log("CREATE - createUser Result:", newUser);

      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: {
          userId: newUser._id,
        },
      });

      return NextResponse.json({ message: "OK", user: newUser });
    } catch (error) {
      console.error("CREATE - createUser Error:", error);
      return new Response("Error creating user", { status: 500 });
    }
  }

  // UPDATE
  if (eventType === "user.updated") {
    const { id, image_url, first_name, last_name, username } = evt.data;

    const userData: UpdateUserParams = {
      firstName: (first_name as string | undefined) ?? '',
      lastName: (last_name as string | undefined) ?? '',
      username: (username as string | undefined) ?? '',
      photo: (image_url as string | undefined) ?? '',
    };

    console.log("UPDATE - Event Data:", JSON.stringify(evt.data, null, 2));
    console.log("UPDATE - updateUser Payload:", JSON.stringify(userData, null, 2));

    try {
      const updatedUser = await updateUser(id, userData);
      console.log("UPDATE - updateUser Result:", updatedUser);
      return NextResponse.json({ message: "OK", user: updatedUser });
    } catch (error) {
      console.error("UPDATE - updateUser Error:", error);
      return new Response("Error updating user", { status: 500 });
    }
  }

  // DELETE
  if (eventType === "user.deleted") {
    console.log("DELETE - Event Data:", JSON.stringify(evt.data, null, 2));
    console.log("DELETE - deleteUser Clerk ID:", id);

    try {
      const deletedUser = await deleteUser(id!);
      console.log("DELETE - deleteUser Result:", deletedUser);
      return NextResponse.json({ message: "OK", user: deletedUser });
    } catch (error) {
      console.error("DELETE - deleteUser Error:", error);
      return new Response("Error deleting user", { status: 500 });
    }
  }

  console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
  console.log("Webhook body:", body);

  return new Response("", { status: 200 });
}
