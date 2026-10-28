import { io } from "socket.io-client";

// Use the JWT whose "sub" is User A's ID.
const USER_A_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YWUwNTg2ZDllZDJlNGFhM2IyNmRjMDkiLCJpYXQiOjE3OTMxODkyOTgsImV4cCI6MTc5NTc4MTI5OH0.Fmhl0qIMOCDaCGJaVLImg6SHWDCWHjJ2AcZ3FXZYU60";

// Use the JWT whose "sub" is User B's ID.
const USER_B_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YWUwNTE1YzQzZGY3ZjQ5ZjZhZmE4MzciLCJpYXQiOjE3OTMxODk2MjksImV4cCI6MTc5NTc4MTYyOX0.oMmR83VaLfDIhvZaspEWJKJA_WPNKb5MEOqaxxmdv18";

const USER_A_ID = "6ae0586d9ed2e4aa3b26dc09";
const USER_B_ID = "6ae0515c43df7f49f6afa837";

const socketA = io("http://localhost:8001", {
  auth: { token: USER_A_TOKEN },
  transports: ["websocket"],
});

const socketB = io("http://localhost:8001", {
  auth: { token: USER_B_TOKEN },
  transports: ["websocket"],
});

let finished = false;
let groupId;
let invitationReceived = false;
let playerSyncReceivedByB = false;
let playerSyncReceivedByA = false;

function finish() {
  if (finished) return;
  finished = true;

  socketA.disconnect();
  socketB.disconnect();
}

function fail(message, error) {
  console.error(`\nFAIL: ${message}`, error ?? "");
  finish();
}

// Listen before triggering events to avoid missing notifications.
socketB.on("group:invitation", (invitation) => {
  invitationReceived = true;

  console.log("\nUser B received invitation:", invitation);

  // Accept the invitation as User B.
  socketB.emit(
    "group:invitation:accept",
    { invitationId: invitation.id },
    (response) => {
      console.log("\nUser B acceptance response:", response);

      if (!response?.success) {
        fail("User B could not accept the invitation.", response?.error);
        return;
      }

      console.log("PASS: User B joined the group.");

      // Test the actual playback sync after acceptance.
      testPlayerSync();
    },
  );
});

// User B should receive playback events from User A.
socketB.on("playerSync", (payload) => {
  playerSyncReceivedByB = true;
  console.log("\nUser B received playerSync:", payload);
});

// User A must not receive their own playback event.
socketA.on("playerSync", (payload) => {
  playerSyncReceivedByA = true;
  console.error("\nFAIL: User A received their own playerSync:", payload);
});

socketA.on("connect_error", (error) => {
  fail("User A connection failed.", error.message);
});

socketB.on("connect_error", (error) => {
  fail("User B connection failed.", error.message);
});

socketA.on("connect", () => {
  console.log("User A connected:", socketA.id);
  startTestWhenBothConnected();
});

socketB.on("connect", () => {
  console.log("User B connected:", socketB.id);
  startTestWhenBothConnected();
});

let started = false;

function startTestWhenBothConnected() {
  if (started || !socketA.connected || !socketB.connected) return;
  started = true;

  // Step 1: User A creates a group.
  socketA.emit("group:create", (response) => {
    console.log("\nGroup creation response:", response);

    if (!response?.success) {
      fail("Group creation failed.", response?.error);
      return;
    }

    groupId = response.data.id;

    if (response.data.ownerId !== USER_A_ID) {
      fail("The group owner is not User A.", response.data.ownerId);
      return;
    }

    console.log("PASS: User A created group:", groupId);

    // Step 2: User A invites User B.
    socketA.emit(
      "group:invite",
      {
        groupId,
        invitedUserId: USER_B_ID,
      },
      (inviteResponse) => {
        console.log("\nInvitation response:", inviteResponse);

        if (!inviteResponse?.success) {
          fail("User A could not invite User B.", inviteResponse?.error);
          return;
        }

        console.log("PASS: Invitation created.");

        // User B's invitation listener will accept it.
      },
    );
  });
}

function testPlayerSync() {
  console.log("\nTesting playerSync...");

  const payload = {
    songId: "test-song-123",
    seekPosition: 241,
    songUrl: "https://example.com/test-song.mp3",
    songImage: "https://example.com/test-cover.jpg",
    artist: "Test Artist",
    isPlaying: true,
    userId: USER_A_ID,
  };

  // First, verify that spoofing another user's identity is rejected.
  socketA.emit(
    "playerSync",
    {
      ...payload,
      userId: USER_B_ID,
    },
    (spoofResponse) => {
      console.log("\nSpoofed userId response:", spoofResponse);

      if (
        spoofResponse?.success ||
        spoofResponse?.error?.code !== "USER_ID_MISMATCH"
      ) {
        fail("The server did not reject the spoofed userId.");
        return;
      }

      console.log("PASS: Server rejected the spoofed userId.");

      // Now send a valid playback event.
      socketA.emit("playerSync", payload, (response) => {
        console.log("\nValid playerSync acknowledgement:", response);

        if (!response?.success) {
          fail("Valid playerSync was rejected.", response?.error);
          return;
        }

        console.log("PASS: Server accepted playerSync.");

        // Allow time for the event to reach User B.
        setTimeout(() => {
          if (!playerSyncReceivedByB) {
            fail("User B did not receive playerSync.");
            return;
          }

          if (playerSyncReceivedByA) {
            fail("User A received their own playerSync.");
            return;
          }

          console.log("PASS: User B received playerSync.");
          console.log("PASS: User A did not receive their own event.");
          console.log("\nALL PLAYER SYNC TESTS PASSED.");

          finish();
        }, 500);
      });
    },
  );
}

// Prevent the test from hanging indefinitely.
setTimeout(() => {
  if (!finished) {
    fail("Test timed out. Check group membership and Socket.IO handlers.");
  }
}, 15000);
