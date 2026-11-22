import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CustomSelect } from "@/components/ui/custom-select";
import { FormField, Input } from "@/components/ui/field";

describe("FormField", () => {
  it("associates labels, hints, and errors with the control", () => {
    render(
      <FormField
        label="Email"
        hint="We never share it"
        error="Email is required"
      >
        <Input type="email" />
      </FormField>,
    );

    const input = screen.getByLabelText("Email");
    const describedBy = (input.getAttribute("aria-describedby") ?? "").split(
      " ",
    );

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(describedBy).toHaveLength(2);
    expect(screen.getByText("We never share it")).toHaveAttribute(
      "id",
      describedBy[0],
    );
    expect(screen.getByText("Email is required")).toHaveAttribute(
      "id",
      describedBy[1],
    );
  });

  it("names custom selects from the surrounding field label", () => {
    render(
      <FormField label="Status">
        <CustomSelect
          value=""
          onChange={() => {}}
          options={[{ value: "ACTIVE", label: "Active" }]}
        />
      </FormField>,
    );

    expect(screen.getByRole("button", { name: "Status" })).toHaveAttribute(
      "aria-haspopup",
      "listbox",
    );
  });
});
