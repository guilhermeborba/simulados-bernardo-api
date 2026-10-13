import { missionDraftInventory, currentMissionWeek } from "./mission-catalog";
import { readQuizCatalog } from "./quiz-catalog";

describe("Proposed mission curation release gate", () => {
  it("covers all 15 audiences with two slots and all 45 distinct quiz references, without exporting private questions", () => {
    const inventory = missionDraftInventory("2026-10-12");
    expect(inventory.missionCount).toBe(30);
    expect(inventory.coverage).toHaveLength(15);
    expect(inventory.coverage.every((row) => row.missions === 2)).toBe(true);
    const keys = inventory.missions.flatMap((m) => m.payload.activityKeys);
    expect(new Set(keys).size).toBe(45);
    expect([...keys].sort()).toEqual(
      readQuizCatalog()
        .map((q) => q.activityKey)
        .sort(),
    );
    expect(
      inventory.missions.every(
        (m) => m.review === "PENDING" && m.status === "DRAFT",
      ),
    ).toBe(true);
    const exported = JSON.stringify(inventory);
    for (const key of [
      "correctAnswer",
      "questions",
      "passwordHash",
      "explanation",
    ])
      expect(exported).not.toContain(`"${key}"`);
  });
  it("keeps Monday and the weekly interval in the Brazil calendar", () => {
    expect(currentMissionWeek(new Date("2026-10-12T02:59:59Z"))).toBe(
      "2026-10-05",
    );
    expect(currentMissionWeek(new Date("2026-10-12T03:00:00Z"))).toBe(
      "2026-10-12",
    );
    expect(missionDraftInventory("2026-10-12")).toMatchObject({
      startsAt: "2026-10-12T03:00:00.000Z",
      endsAt: "2026-10-19T03:00:00.000Z",
    });
  });
  it("blocks incomplete or private-only audience coverage before any proposed import", () => {
    const catalog = readQuizCatalog();
    expect(() =>
      missionDraftInventory(
        "2026-10-12",
        catalog.filter((q) => q.schoolYear !== 12),
      ),
    ).toThrow();
    expect(() =>
      missionDraftInventory(
        "2026-10-12",
        catalog.map((q) =>
          q.schoolYear === 3 ? { ...q, turmaSlug: "private" } : q,
        ),
      ),
    ).toThrow();
  });
  it("rejects invalid dates or non-Monday weeks", () => {
    for (const value of ["2026-10-13", "2026-02-30", "2026-10-12T00:00:00Z"])
      expect(() => missionDraftInventory(value)).toThrow();
  });
});
