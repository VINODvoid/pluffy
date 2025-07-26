import * as React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { Input } from "./input"

// Mock the cn utility function since it's imported from @/lib/utils
jest.mock("@/lib/utils", () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(" "))
}))

// Alternative mock for Vitest (if Jest is not available)
// vi.mock("@/lib/utils", () => ({
//   cn: vi.fn((...classes) => classes.filter(Boolean).join(" "))
// }))

describe("Input Component", () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks()
    // vi.clearAllMocks() // Use this for Vitest
  })

  // Test basic rendering functionality
  describe("Basic Rendering", () => {
    it("renders an input element", () => {
      render(<Input />)
      const input = screen.getByRole("textbox")
      expect(input).toBeInTheDocument()
    })

    it("renders with correct HTML tag", () => {
      render(<Input />)
      const input = screen.getByRole("textbox")
      expect(input.tagName).toBe("INPUT")
    })

    it("includes the required data-slot attribute", () => {
      render(<Input />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("data-slot", "input")
    })

    it("calls cn utility with default class strings", () => {
      const { cn } = require("@/lib/utils")
      render(<Input />)
      
      expect(cn).toHaveBeenCalledWith(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        undefined
      )
    })
  })

  // Test different HTML input types
  describe("Input Types", () => {
    it("renders text input by default", () => {
      render(<Input />)
      const input = screen.getByRole("textbox")
      expect(input).toBeInTheDocument()
    })

    it("renders email input correctly", () => {
      render(<Input type="email" />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("type", "email")
    })

    it("renders password input correctly", () => {
      render(<Input type="password" />)
      const input = document.querySelector('input[type="password"]')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute("type", "password")
    })

    it("renders number input correctly", () => {
      render(<Input type="number" />)
      const input = screen.getByRole("spinbutton")
      expect(input).toHaveAttribute("type", "number")
    })

    it("renders telephone input correctly", () => {
      render(<Input type="tel" />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("type", "tel")
    })

    it("renders URL input correctly", () => {
      render(<Input type="url" />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("type", "url")
    })

    it("renders search input correctly", () => {
      render(<Input type="search" />)
      const input = screen.getByRole("searchbox")
      expect(input).toHaveAttribute("type", "search")
    })

    it("renders file input correctly", () => {
      render(<Input type="file" />)
      const input = document.querySelector('input[type="file"]')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute("type", "file")
    })

    it("renders date input correctly", () => {
      render(<Input type="date" />)
      const input = document.querySelector('input[type="date"]')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute("type", "date")
    })

    it("renders time input correctly", () => {
      render(<Input type="time" />)
      const input = document.querySelector('input[type="time"]')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute("type", "time")
    })

    it("renders checkbox input correctly", () => {
      render(<Input type="checkbox" />)
      const input = screen.getByRole("checkbox")
      expect(input).toHaveAttribute("type", "checkbox")
    })

    it("renders radio input correctly", () => {
      render(<Input type="radio" />)
      const input = screen.getByRole("radio")
      expect(input).toHaveAttribute("type", "radio")
    })

    it("renders hidden input correctly", () => {
      render(<Input type="hidden" />)
      const input = document.querySelector('input[type="hidden"]')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute("type", "hidden")
    })

    it("renders range input correctly", () => {
      render(<Input type="range" />)
      const input = screen.getByRole("slider")
      expect(input).toHaveAttribute("type", "range")
    })

    it("renders color input correctly", () => {
      render(<Input type="color" />)
      const input = document.querySelector('input[type="color"]')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute("type", "color")
    })
  })

  // Test className merging and styling
  describe("ClassName Handling", () => {
    it("applies custom className alongside default classes", () => {
      const { cn } = require("@/lib/utils")
      render(<Input className="custom-class" />)
      
      expect(cn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        "custom-class"
      )
    })

    it("handles multiple custom classes", () => {
      const { cn } = require("@/lib/utils")
      render(<Input className="class1 class2 class3" />)
      
      expect(cn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        "class1 class2 class3"
      )
    })

    it("handles empty string className", () => {
      const { cn } = require("@/lib/utils")
      render(<Input className="" />)
      
      expect(cn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        ""
      )
    })

    it("handles undefined className", () => {
      const { cn } = require("@/lib/utils")
      render(<Input className={undefined} />)
      
      expect(cn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        undefined
      )
    })

    it("handles null className", () => {
      const { cn } = require("@/lib/utils")
      render(<Input className={null as any} />)
      
      expect(cn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        null
      )
    })

    it("calls cn utility only once per render", () => {
      const { cn } = require("@/lib/utils")
      render(<Input className="test-class" />)
      
      expect(cn).toHaveBeenCalledTimes(1)
    })
  })

  // Test HTML attribute forwarding
  describe("HTML Attributes Forwarding", () => {
    it("forwards basic input attributes correctly", () => {
      render(
        <Input
          id="test-input"
          name="username"
          placeholder="Enter username"
          value="test-value"
          readOnly
        />
      )
      
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("id", "test-input")
      expect(input).toHaveAttribute("name", "username")
      expect(input).toHaveAttribute("placeholder", "Enter username")
      expect(input).toHaveValue("test-value")
      expect(input).toHaveAttribute("readonly")
    })

    it("forwards disabled attribute", () => {
      render(<Input disabled />)
      const input = screen.getByRole("textbox")
      expect(input).toBeDisabled()
    })

    it("forwards required attribute", () => {
      render(<Input required />)
      const input = screen.getByRole("textbox")
      expect(input).toBeRequired()
    })

    it("forwards maxLength attribute", () => {
      render(<Input maxLength={20} />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("maxlength", "20")
    })

    it("forwards minLength attribute", () => {
      render(<Input minLength={3} />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("minlength", "3")
    })

    it("forwards pattern attribute", () => {
      render(<Input pattern="[A-Za-z0-9]+" />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("pattern", "[A-Za-z0-9]+")
    })

    it("forwards autoComplete attribute", () => {
      render(<Input autoComplete="username" />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("autocomplete", "username")
    })

    it("forwards autoFocus attribute", () => {
      render(<Input autoFocus />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveFocus()
    })

    it("forwards tabIndex attribute", () => {
      render(<Input tabIndex={0} />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("tabindex", "0")
    })

    it("forwards defaultValue attribute", () => {
      render(<Input defaultValue="default text" />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveValue("default text")
    })

    it("forwards title attribute", () => {
      render(<Input title="Input tooltip" />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("title", "Input tooltip")
    })
  })

  // Test accessibility attributes
  describe("Accessibility Attributes", () => {
    it("forwards aria-label attribute", () => {
      render(<Input aria-label="Search field" />)
      const input = screen.getByLabelText("Search field")
      expect(input).toHaveAttribute("aria-label", "Search field")
    })

    it("forwards aria-describedby attribute", () => {
      render(<Input aria-describedby="help-text" />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("aria-describedby", "help-text")
    })

    it("forwards aria-invalid attribute", () => {
      render(<Input aria-invalid="true" />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("aria-invalid", "true")
    })

    it("forwards aria-required attribute", () => {
      render(<Input aria-required="true" />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("aria-required", "true")
    })

    it("forwards aria-labelledby attribute", () => {
      render(<Input aria-labelledby="label-id" />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("aria-labelledby", "label-id")
    })

    it("forwards role attribute", () => {
      render(<Input role="combobox" />)
      const input = screen.getByRole("combobox")
      expect(input).toHaveAttribute("role", "combobox")
    })

    it("forwards aria-expanded attribute", () => {
      render(<Input aria-expanded="false" />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("aria-expanded", "false")
    })

    it("forwards aria-autocomplete attribute", () => {
      render(<Input aria-autocomplete="list" />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("aria-autocomplete", "list")
    })
  })

  // Test event handler forwarding
  describe("Event Handler Forwarding", () => {
    it("forwards onChange event handler", () => {
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} />)
      const input = screen.getByRole("textbox")
      
      fireEvent.change(input, { target: { value: "new value" } })
      
      expect(handleChange).toHaveBeenCalled()
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ 
            value: "new value" 
          })
        })
      )
    })

    it("forwards onFocus event handler", () => {
      const handleFocus = jest.fn()
      render(<Input onFocus={handleFocus} />)
      const input = screen.getByRole("textbox")
      
      fireEvent.focus(input)
      
      expect(handleFocus).toHaveBeenCalled()
    })

    it("forwards onBlur event handler", () => {
      const handleBlur = jest.fn()
      render(<Input onBlur={handleBlur} />)
      const input = screen.getByRole("textbox")
      
      fireEvent.focus(input)
      fireEvent.blur(input)
      
      expect(handleBlur).toHaveBeenCalled()
    })

    it("forwards onClick event handler", () => {
      const handleClick = jest.fn()
      render(<Input onClick={handleClick} />)
      const input = screen.getByRole("textbox")
      
      fireEvent.click(input)
      
      expect(handleClick).toHaveBeenCalled()
    })

    it("forwards onKeyDown event handler", () => {
      const handleKeyDown = jest.fn()
      render(<Input onKeyDown={handleKeyDown} />)
      const input = screen.getByRole("textbox")
      
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" })
      
      expect(handleKeyDown).toHaveBeenCalled()
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "Enter"
        })
      )
    })

    it("forwards onKeyUp event handler", () => {
      const handleKeyUp = jest.fn()
      render(<Input onKeyUp={handleKeyUp} />)
      const input = screen.getByRole("textbox")
      
      fireEvent.keyUp(input, { key: "Escape", code: "Escape" })
      
      expect(handleKeyUp).toHaveBeenCalled()
    })

    it("forwards onInput event handler", () => {
      const handleInput = jest.fn()
      render(<Input onInput={handleInput} />)
      const input = screen.getByRole("textbox")
      
      fireEvent.input(input, { target: { value: "input text" } })
      
      expect(handleInput).toHaveBeenCalled()
    })

    it("forwards onPaste event handler", () => {
      const handlePaste = jest.fn()
      render(<Input onPaste={handlePaste} />)
      const input = screen.getByRole("textbox")
      
      fireEvent.paste(input)
      
      expect(handlePaste).toHaveBeenCalled()
    })
  })

  // Test number input specific attributes
  describe("Number Input Specific Attributes", () => {
    it("forwards min and max attributes for number input", () => {
      render(<Input type="number" min={5} max={95} />)
      const input = screen.getByRole("spinbutton")
      expect(input).toHaveAttribute("min", "5")
      expect(input).toHaveAttribute("max", "95")
    })

    it("forwards step attribute for number input", () => {
      render(<Input type="number" step={0.5} />)
      const input = screen.getByRole("spinbutton")
      expect(input).toHaveAttribute("step", "0.5")
    })

    it("handles string values for numeric attributes", () => {
      render(<Input type="number" min="10" max="90" step="10" />)
      const input = screen.getByRole("spinbutton")
      expect(input).toHaveAttribute("min", "10")
      expect(input).toHaveAttribute("max", "90")
      expect(input).toHaveAttribute("step", "10")
    })
  })

  // Test file input specific attributes
  describe("File Input Specific Attributes", () => {
    it("forwards accept attribute for file input", () => {
      render(<Input type="file" accept=".pdf,.doc,.docx" />)
      const input = document.querySelector('input[type="file"]')
      expect(input).toHaveAttribute("accept", ".pdf,.doc,.docx")
    })

    it("forwards multiple attribute for file input", () => {
      render(<Input type="file" multiple />)
      const input = document.querySelector('input[type="file"]')
      expect(input).toHaveAttribute("multiple")
    })

    it("handles MIME type patterns in accept attribute", () => {
      render(<Input type="file" accept="image/*,video/*,application/pdf" />)
      const input = document.querySelector('input[type="file"]')
      expect(input).toHaveAttribute("accept", "image/*,video/*,application/pdf")
    })
  })

  // Test data attributes
  describe("Data Attributes", () => {
    it("always includes the data-slot attribute", () => {
      render(<Input />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("data-slot", "input")
    })

    it("forwards custom data attributes", () => {
      render(<Input data-testid="custom-input" data-cy="input-field" />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("data-testid", "custom-input")
      expect(input).toHaveAttribute("data-cy", "input-field")
    })

    it("maintains data-slot even with other data attributes", () => {
      render(<Input data-custom="value" data-track="analytics" />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("data-slot", "input")
      expect(input).toHaveAttribute("data-custom", "value")
      expect(input).toHaveAttribute("data-track", "analytics")
    })
  })

  // Test edge cases and error handling
  describe("Edge Cases and Error Handling", () => {
    it("handles null type prop gracefully", () => {
      render(<Input type={null as any} />)
      const input = screen.getByRole("textbox")
      expect(input).toBeInTheDocument()
    })

    it("handles undefined type prop gracefully", () => {
      render(<Input type={undefined} />)
      const input = screen.getByRole("textbox")
      expect(input).toBeInTheDocument()
    })

    it("handles very long placeholder text", () => {
      const longPlaceholder = "This is an extremely long placeholder text that might cause layout issues or overflow problems in certain UI scenarios but should still render correctly"
      render(<Input placeholder={longPlaceholder} />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("placeholder", longPlaceholder)
    })

    it("handles special characters in input value", () => {
      const specialChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~"
      render(<Input value={specialChars} readOnly />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveValue(specialChars)
    })

    it("handles unicode and emoji characters", () => {
      const unicodeText = "Hello 🌍 世界 مرحبا שלום नमस्ते"
      render(<Input value={unicodeText} readOnly />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveValue(unicodeText)
    })

    it("handles empty string values", () => {
      render(<Input value="" placeholder="Empty value" />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveValue("")
      expect(input).toHaveAttribute("placeholder", "Empty value")
    })

    it("handles boolean props correctly", () => {
      render(<Input disabled={false} required={true} readOnly={false} />)
      const input = screen.getByRole("textbox")
      expect(input).not.toBeDisabled()
      expect(input).toBeRequired()
      expect(input).not.toHaveAttribute("readonly")
    })

    it("handles zero values for numeric attributes", () => {
      render(<Input type="number" min={0} max={0} step={0} />)
      const input = screen.getByRole("spinbutton")
      expect(input).toHaveAttribute("min", "0")
      expect(input).toHaveAttribute("max", "0")
      expect(input).toHaveAttribute("step", "0")
    })
  })

  // Test ref forwarding functionality
  describe("Ref Forwarding", () => {
    it("forwards ref to the underlying input element", () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input ref={ref} />)
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      expect(ref.current?.tagName).toBe("INPUT")
    })

    it("allows access to input DOM methods through ref", () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input ref={ref} />)
      
      expect(typeof ref.current?.focus).toBe("function")
      expect(typeof ref.current?.blur).toBe("function")
      expect(typeof ref.current?.select).toBe("function")
      expect(typeof ref.current?.setSelectionRange).toBe("function")
    })

    it("allows programmatic focus control through ref", () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input ref={ref} />)
      
      ref.current?.focus()
      expect(ref.current).toHaveFocus()
      
      ref.current?.blur()
      expect(ref.current).not.toHaveFocus()
    })

    it("allows reading input value through ref", () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input ref={ref} defaultValue="ref test" />)
      
      expect(ref.current?.value).toBe("ref test")
    })

    it("allows text selection through ref", () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input ref={ref} defaultValue="selectable text" />)
      
      ref.current?.focus()
      ref.current?.setSelectionRange(0, 5)
      
      expect(ref.current?.selectionStart).toBe(0)
      expect(ref.current?.selectionEnd).toBe(5)
    })
  })

  // Test form integration scenarios
  describe("Form Integration", () => {
    it("works correctly within form elements", () => {
      render(
        <form data-testid="test-form">
          <Input name="test-field" />
        </form>
      )
      
      const input = screen.getByRole("textbox")
      const form = screen.getByTestId("test-form")
      
      expect(input.closest("form")).toBe(form)
      expect(input).toHaveAttribute("name", "test-field")
    })

    it("forwards form attribute for external forms", () => {
      render(<Input form="external-form-id" />)
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("form", "external-form-id")
    })

    it("handles form validation attributes correctly", () => {
      render(
        <Input 
          required 
          pattern="[A-Z][a-z]+" 
          title="First letter uppercase, rest lowercase"
        />
      )
      
      const input = screen.getByRole("textbox")
      expect(input).toBeRequired()
      expect(input).toHaveAttribute("pattern", "[A-Z][a-z]+")
      expect(input).toHaveAttribute("title", "First letter uppercase, rest lowercase")
    })
  })

  // Test complex styling scenarios
  describe("Complex Styling Scenarios", () => {
    it("handles conditional className values", () => {
      const { cn } = require("@/lib/utils")
      const isError = true
      const conditionalClass = isError ? "border-red-500" : "border-gray-300"
      
      render(<Input className={conditionalClass} />)
      
      expect(cn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        "border-red-500"
      )
    })

    it("handles template literal className values", () => {
      const { cn } = require("@/lib/utils")
      const size = "lg"
      const variant = "primary"
      
      render(<Input className={`input-${size} variant-${variant}`} />)
      
      expect(cn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        "input-lg variant-primary"
      )
    })

    it("preserves all default Tailwind classes", () => {
      const { cn } = require("@/lib/utils")
      render(<Input />)
      
      const [baseClasses, focusClasses, invalidClasses] = cn.mock.calls[0]
      
      // Check that key styling classes are present
      expect(baseClasses).toContain("border-input")
      expect(baseClasses).toContain("rounded-md")
      expect(baseClasses).toContain("px-3")
      expect(baseClasses).toContain("py-1")
      expect(baseClasses).toContain("disabled:opacity-50")
      
      expect(focusClasses).toContain("focus-visible:border-ring")
      expect(focusClasses).toContain("focus-visible:ring-ring/50")
      
      expect(invalidClasses).toContain("aria-invalid:border-destructive")
    })
  })
})