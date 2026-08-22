export const saveDebugJson = async (data: unknown, fileName = "debug.json") => {
  console.log("calling");
  try {
    await fetch("http://localhost:5050/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName,
        data,
      }),
    });

    console.log("✅ Debug JSON saved");
  } catch (error) {
    console.error("❌ Failed to save debug JSON:", error);
  }
};
