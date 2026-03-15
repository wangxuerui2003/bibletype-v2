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

    expect(wrapper.text()).toContain("In the beginning");
  });
});
