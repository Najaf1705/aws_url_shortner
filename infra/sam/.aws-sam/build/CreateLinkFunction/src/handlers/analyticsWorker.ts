export const handler = async (event: any) => {
  // SQS batch
  const records = event?.Records ?? [];
  for (const r of records) {
    try {
      const msg = JSON.parse(r.body);
      console.log("click-event", msg);
    } catch (e) {
      console.error("bad message", r.body);
      // throw to trigger retry if you want strictness; for phase1, just log
    }
  }
  return {};
};