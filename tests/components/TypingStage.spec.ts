import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import TypingStage from "../../app/components/TypingStage.vue";

describe("TypingStage", () => {
  it("renders verse text", () => {
    const wrapper = mount(TypingStage, {
      props: {
        text: "In the beginning",
        typed: "In",
      },
    });

    expect(wrapper.text().replace(/\s+/g, " ").trim()).toContain("I n t h e b e g i n n i n g");
  });
});
