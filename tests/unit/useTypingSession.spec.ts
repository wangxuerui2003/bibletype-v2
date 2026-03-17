import { effectScope, nextTick } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTypingSession } from "../../composables/useTypingSession";

describe("useTypingSession", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("updates elapsed time and wpm in real time", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const scope = effectScope();
    const session = scope.run(() => useTypingSession("hello"))!;

    session.pushKey("h");
    session.pushKey("e");
    session.pushKey("l");
    session.pushKey("l");
    session.pushKey("o");

    await vi.advanceTimersByTimeAsync(5000);
    await nextTick();

    expect(session.elapsedMs.value).toBeGreaterThanOrEqual(5000);
    expect(session.wpm.value).toBe(12);

    scope.stop();
  });

  it("returns an exact snapshot for completion payloads", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const scope = effectScope();
    const session = scope.run(() => useTypingSession("grace"))!;

    for (const char of "grace") {
      session.pushKey(char);
    }

    await vi.advanceTimersByTimeAsync(2500);
    await nextTick();

    const snapshot = session.snapshot();

    expect(snapshot.correctChars).toBe(5);
    expect(snapshot.accuracy).toBe(100);
    expect(snapshot.elapsedMs).toBeGreaterThanOrEqual(2500);
    expect(snapshot.wpm).toBeCloseTo(24, 1);

    scope.stop();
  });

  it("keeps corrected mistakes in the verse accuracy", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const scope = effectScope();
    const session = scope.run(() => useTypingSession("grace"))!;

    session.pushKey("g");
    session.pushKey("x");
    session.pushKey("Backspace");
    session.pushKey("r");
    session.pushKey("a");
    session.pushKey("c");
    session.pushKey("e");

    await vi.advanceTimersByTimeAsync(2500);
    await nextTick();

    expect(session.isComplete.value).toBe(true);
    expect(session.accuracy.value).toBeCloseTo(83.3, 1);

    const snapshot = session.snapshot();

    expect(snapshot.correctChars).toBe(5);
    expect(snapshot.accuracy).toBeCloseTo(83.3, 1);

    scope.stop();
  });
});
