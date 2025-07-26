import { inngest } from "./client";
import { gemini, createAgent } from "@inngest/agent-kit";
import { helloWorld } from "./functions";

// Mock the inngest client
jest.mock("./client", () => ({
  inngest: {
    createFunction: jest.fn().mockImplementation((config, trigger, handler) => {
      // Store the actual handler for testing
      return { config, trigger, handler };
    })
  }
}));

// Mock the agent-kit
jest.mock("@inngest/agent-kit", () => ({
  gemini: jest.fn(),
  createAgent: jest.fn()
}));

describe("helloWorld Inngest Function", () => {
  let mockCreateFunction: jest.MockedFunction<typeof inngest.createFunction>;
  let mockCreateAgent: jest.MockedFunction<typeof createAgent>;
  let mockGemini: jest.MockedFunction<typeof gemini>;
  let mockAgent: any;
  let mockStep: any;
  let mockEvent: any;
  let handlerFunction: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    mockCreateFunction = inngest.createFunction as jest.MockedFunction<typeof inngest.createFunction>;
    mockCreateAgent = createAgent as jest.MockedFunction<typeof createAgent>;
    mockGemini = gemini as jest.MockedFunction<typeof gemini>;
    
    // Mock agent instance with run method
    mockAgent = {
      run: jest.fn()
    };
    
    mockCreateAgent.mockReturnValue(mockAgent);
    mockGemini.mockReturnValue({ model: "gemini-2.0-flash" });
    
    // Mock step and event objects
    mockStep = {
      id: "test-step",
      name: "test-step"
    };
    
    mockEvent = {
      id: "test-event",
      name: "test/hello.world",
      data: {
        value: "React component"
      },
      ts: Date.now()
    };

    // Extract the handler function from the last createFunction call
    if (mockCreateFunction.mock.calls.length > 0) {
      const lastCall = mockCreateFunction.mock.calls[mockCreateFunction.mock.calls.length - 1];
      handlerFunction = lastCall[2];
    }
  });

  describe("Function Configuration", () => {
    it("should create function with correct configuration", () => {
      expect(mockCreateFunction).toHaveBeenCalledWith(
        { id: "hello-world" },
        { event: "test/hello.world" },
        expect.any(Function)
      );
    });

    it("should export the helloWorld function", () => {
      expect(helloWorld).toBeDefined();
      expect(typeof helloWorld).toBe("object");
    });
  });

  describe("Agent Configuration", () => {
    it("should create agent with correct name", async () => {
      mockAgent.run.mockResolvedValue({ output: "test output" });
      
      await handlerFunction({ event: mockEvent, step: mockStep });

      expect(mockCreateAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "code-agent"
        })
      );
    });

    it("should create agent with correct system prompt", async () => {
      mockAgent.run.mockResolvedValue({ output: "test output" });
      
      await handlerFunction({ event: mockEvent, step: mockStep });

      expect(mockCreateAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          system: "You are an export nextjs developer. You write readable, maintainable code, you write simple next.js & react snippets "
        })
      );
    });

    it("should create agent with gemini model", async () => {
      mockAgent.run.mockResolvedValue({ output: "test output" });
      
      await handlerFunction({ event: mockEvent, step: mockStep });

      expect(mockCreateAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: { model: "gemini-2.0-flash" }
        })
      );
    });

    it("should initialize gemini with correct model version", async () => {
      mockAgent.run.mockResolvedValue({ output: "test output" });
      
      await handlerFunction({ event: mockEvent, step: mockStep });

      expect(mockGemini).toHaveBeenCalledWith({
        model: "gemini-2.0-flash"
      });
    });

    it("should verify complete agent configuration structure", async () => {
      mockAgent.run.mockResolvedValue({ output: "test output" });
      
      await handlerFunction({ event: mockEvent, step: mockStep });

      expect(mockCreateAgent).toHaveBeenCalledWith({
        name: "code-agent",
        system: "You are an export nextjs developer. You write readable, maintainable code, you write simple next.js & react snippets ",
        model: { model: "gemini-2.0-flash" }
      });
    });
  });

  describe("Happy Path Execution", () => {
    it("should process event data and return agent output", async () => {
      const expectedOutput = "Generated Next.js component code";
      mockAgent.run.mockResolvedValue({ output: expectedOutput });

      const result = await handlerFunction({ event: mockEvent, step: mockStep });

      expect(mockAgent.run).toHaveBeenCalledWith(
        "Write the following snippets for : React component"
      );
      expect(result).toEqual({ output: expectedOutput });
    });

    it("should handle various code request types", async () => {
      const testCases = [
        { input: "TypeScript interface", expected: "interface User { id: string; name: string; }" },
        { input: "API route handler", expected: "export async function GET() { return Response.json({}); }" },
        { input: "custom hook", expected: "function useCustomHook() { return useState(); }" },
        { input: "component with props", expected: "interface Props { title: string; } export default function Component({ title }: Props) { return <div>{title}</div>; }" }
      ];

      for (const testCase of testCases) {
        mockAgent.run.mockResolvedValue({ output: testCase.expected });
        
        const testEvent = { ...mockEvent, data: { value: testCase.input } };
        const result = await handlerFunction({ event: testEvent, step: mockStep });

        expect(mockAgent.run).toHaveBeenCalledWith(`Write the following snippets for : ${testCase.input}`);
        expect(result).toEqual({ output: testCase.expected });
        
        jest.clearAllMocks();
        mockCreateAgent.mockReturnValue(mockAgent);
      }
    });

    it("should work with empty string input", async () => {
      mockAgent.run.mockResolvedValue({ output: "Please provide a specific code request" });
      
      const emptyEvent = { ...mockEvent, data: { value: "" } };
      const result = await handlerFunction({ event: emptyEvent, step: mockStep });

      expect(mockAgent.run).toHaveBeenCalledWith("Write the following snippets for : ");
      expect(result).toEqual({ output: "Please provide a specific code request" });
    });

    it("should handle whitespace-only input", async () => {
      mockAgent.run.mockResolvedValue({ output: "Please provide a specific code request" });
      
      const whitespaceEvent = { ...mockEvent, data: { value: "   \n\t  " } };
      const result = await handlerFunction({ event: whitespaceEvent, step: mockStep });

      expect(mockAgent.run).toHaveBeenCalledWith("Write the following snippets for :    \n\t  ");
      expect(result).toEqual({ output: "Please provide a specific code request" });
    });
  });

  describe("Edge Cases and Input Validation", () => {
    it("should handle undefined event data value", async () => {
      mockAgent.run.mockResolvedValue({ output: "Default response for undefined input" });
      
      const undefinedEvent = { ...mockEvent, data: { value: undefined } };
      const result = await handlerFunction({ event: undefinedEvent, step: mockStep });

      expect(mockAgent.run).toHaveBeenCalledWith("Write the following snippets for : undefined");
      expect(result).toEqual({ output: "Default response for undefined input" });
    });

    it("should handle null event data value", async () => {
      mockAgent.run.mockResolvedValue({ output: "Default response for null input" });
      
      const nullEvent = { ...mockEvent, data: { value: null } };
      const result = await handlerFunction({ event: nullEvent, step: mockStep });

      expect(mockAgent.run).toHaveBeenCalledWith("Write the following snippets for : null");
      expect(result).toEqual({ output: "Default response for null input" });
    });

    it("should handle missing data.value property", async () => {
      const noValueEvent = { ...mockEvent, data: {} };
      
      await expect(handlerFunction({ event: noValueEvent, step: mockStep }))
        .rejects.toThrow();
    });

    it("should handle completely missing data property", async () => {
      const invalidEvent = { ...mockEvent };
      delete (invalidEvent as any).data;
      
      await expect(handlerFunction({ event: invalidEvent, step: mockStep }))
        .rejects.toThrow();
    });

    it("should handle special characters in input", async () => {
      const specialInput = "Component with <div>, {props}, & 'quotes' and \"double quotes\"";
      mockAgent.run.mockResolvedValue({ output: "Handled special characters successfully" });
      
      const specialEvent = { ...mockEvent, data: { value: specialInput } };
      const result = await handlerFunction({ event: specialEvent, step: mockStep });

      expect(mockAgent.run).toHaveBeenCalledWith(`Write the following snippets for : ${specialInput}`);
      expect(result).toEqual({ output: "Handled special characters successfully" });
    });

    it("should handle very long input strings", async () => {
      const longInput = "a".repeat(5000) + " component request";
      mockAgent.run.mockResolvedValue({ output: "Processed long input successfully" });
      
      const longEvent = { ...mockEvent, data: { value: longInput } };
      const result = await handlerFunction({ event: longEvent, step: mockStep });

      expect(mockAgent.run).toHaveBeenCalledWith(`Write the following snippets for : ${longInput}`);
      expect(result).toEqual({ output: "Processed long input successfully" });
    });

    it("should handle Unicode and emoji characters", async () => {
      const unicodeInput = "React component with 🚀 emoji and ñáéíóú accents";
      mockAgent.run.mockResolvedValue({ output: "Handled Unicode input successfully" });
      
      const unicodeEvent = { ...mockEvent, data: { value: unicodeInput } };
      const result = await handlerFunction({ event: unicodeEvent, step: mockStep });

      expect(mockAgent.run).toHaveBeenCalledWith(`Write the following snippets for : ${unicodeInput}`);
      expect(result).toEqual({ output: "Handled Unicode input successfully" });
    });

    it("should handle numeric input values", async () => {
      const numericInput = 42;
      mockAgent.run.mockResolvedValue({ output: "Handled numeric input" });
      
      const numericEvent = { ...mockEvent, data: { value: numericInput } };
      const result = await handlerFunction({ event: numericEvent, step: mockStep });

      expect(mockAgent.run).toHaveBeenCalledWith("Write the following snippets for : 42");
      expect(result).toEqual({ output: "Handled numeric input" });
    });

    it("should handle boolean input values", async () => {
      const booleanInput = true;
      mockAgent.run.mockResolvedValue({ output: "Handled boolean input" });
      
      const booleanEvent = { ...mockEvent, data: { value: booleanInput } };
      const result = await handlerFunction({ event: booleanEvent, step: mockStep });

      expect(mockAgent.run).toHaveBeenCalledWith("Write the following snippets for : true");
      expect(result).toEqual({ output: "Handled boolean input" });
    });

    it("should handle object input values", async () => {
      const objectInput = { type: "component", framework: "react" };
      mockAgent.run.mockResolvedValue({ output: "Handled object input" });
      
      const objectEvent = { ...mockEvent, data: { value: objectInput } };
      const result = await handlerFunction({ event: objectEvent, step: mockStep });

      expect(mockAgent.run).toHaveBeenCalledWith(`Write the following snippets for : ${JSON.stringify(objectInput)}`);
      expect(result).toEqual({ output: "Handled object input" });
    });
  });

  describe("Error Handling", () => {
    it("should propagate agent execution errors", async () => {
      const agentError = new Error("Gemini API rate limit exceeded");
      mockAgent.run.mockRejectedValue(agentError);

      await expect(handlerFunction({ event: mockEvent, step: mockStep }))
        .rejects.toThrow("Gemini API rate limit exceeded");
    });

    it("should handle agent creation failures", async () => {
      mockCreateAgent.mockImplementation(() => {
        throw new Error("Failed to initialize agent");
      });

      await expect(handlerFunction({ event: mockEvent, step: mockStep }))
        .rejects.toThrow("Failed to initialize agent");
    });

    it("should handle gemini model initialization errors", async () => {
      mockGemini.mockImplementation(() => {
        throw new Error("Invalid Gemini API key");
      });

      await expect(handlerFunction({ event: mockEvent, step: mockStep }))
        .rejects.toThrow("Invalid Gemini API key");
    });

    it("should handle network timeout errors", async () => {
      const timeoutError = new Error("Request timeout after 30 seconds");
      timeoutError.name = "TimeoutError";
      mockAgent.run.mockRejectedValue(timeoutError);

      await expect(handlerFunction({ event: mockEvent, step: mockStep }))
        .rejects.toThrow("Request timeout after 30 seconds");
    });

    it("should handle authentication errors", async () => {
      const authError = new Error("Authentication failed - invalid API key");
      authError.name = "AuthenticationError";
      mockAgent.run.mockRejectedValue(authError);

      await expect(handlerFunction({ event: mockEvent, step: mockStep }))
        .rejects.toThrow("Authentication failed - invalid API key");
    });

    it("should handle quota exceeded errors", async () => {
      const quotaError = new Error("API quota exceeded for this billing period");
      quotaError.name = "QuotaExceededError";
      mockAgent.run.mockRejectedValue(quotaError);

      await expect(handlerFunction({ event: mockEvent, step: mockStep }))
        .rejects.toThrow("API quota exceeded for this billing period");
    });

    it("should handle server internal errors", async () => {
      const serverError = new Error("Internal server error");
      serverError.name = "InternalServerError";
      mockAgent.run.mockRejectedValue(serverError);

      await expect(handlerFunction({ event: mockEvent, step: mockStep }))
        .rejects.toThrow("Internal server error");
    });

    it("should handle model unavailable errors", async () => {
      const modelError = new Error("Gemini model temporarily unavailable");
      modelError.name = "ModelUnavailableError";
      mockAgent.run.mockRejectedValue(modelError);

      await expect(handlerFunction({ event: mockEvent, step: mockStep }))
        .rejects.toThrow("Gemini model temporarily unavailable");
    });
  });

  describe("Response Format Validation", () => {
    it("should handle agent response without output property", async () => {
      mockAgent.run.mockResolvedValue({});

      const result = await handlerFunction({ event: mockEvent, step: mockStep });

      expect(result).toEqual({ output: undefined });
    });

    it("should handle agent response with null output", async () => {
      mockAgent.run.mockResolvedValue({ output: null });

      const result = await handlerFunction({ event: mockEvent, step: mockStep });

      expect(result).toEqual({ output: null });
    });

    it("should handle agent response with empty string output", async () => {
      mockAgent.run.mockResolvedValue({ output: "" });

      const result = await handlerFunction({ event: mockEvent, step: mockStep });

      expect(result).toEqual({ output: "" });
    });

    it("should handle agent response with string output", async () => {
      const stringOutput = "const MyComponent = () => <div>Hello World</div>;";
      mockAgent.run.mockResolvedValue({ output: stringOutput });

      const result = await handlerFunction({ event: mockEvent, step: mockStep });

      expect(result).toEqual({ output: stringOutput });
    });

    it("should handle agent response with object output", async () => {
      const objectOutput = {
        code: "const MyComponent = () => <div>Hello</div>;",
        explanation: "A simple React functional component",
        imports: ["import React from 'react';"],
        dependencies: ["react", "@types/react"]
      };
      mockAgent.run.mockResolvedValue({ output: objectOutput });

      const result = await handlerFunction({ event: mockEvent, step: mockStep });

      expect(result).toEqual({ output: objectOutput });
    });

    it("should handle agent response with array output", async () => {
      const arrayOutput = [
        "import React from 'react';",
        "const Component = () => <div>Content</div>;",
        "export default Component;"
      ];
      mockAgent.run.mockResolvedValue({ output: arrayOutput });

      const result = await handlerFunction({ event: mockEvent, step: mockStep });

      expect(result).toEqual({ output: arrayOutput });
    });

    it("should handle agent response with complex nested output", async () => {
      const complexOutput = {
        components: [
          { name: "Header", code: "const Header = () => <header>Title</header>" },
          { name: "Footer", code: "const Footer = () => <footer>Copyright</footer>" }
        ],
        styles: { backgroundColor: "blue", color: "white" },
        dependencies: ["react", "typescript"],
        metadata: {
          generatedAt: new Date().toISOString(),
          version: "1.0.0"
        }
      };
      mockAgent.run.mockResolvedValue({ output: complexOutput });

      const result = await handlerFunction({ event: mockEvent, step: mockStep });

      expect(result).toEqual({ output: complexOutput });
    });

    it("should handle agent response with numeric output", async () => {
      mockAgent.run.mockResolvedValue({ output: 42 });

      const result = await handlerFunction({ event: mockEvent, step: mockStep });

      expect(result).toEqual({ output: 42 });
    });

    it("should handle agent response with boolean output", async () => {
      mockAgent.run.mockResolvedValue({ output: true });

      const result = await handlerFunction({ event: mockEvent, step: mockStep });

      expect(result).toEqual({ output: true });
    });
  });

  describe("Concurrency and Performance", () => {
    it("should handle multiple concurrent function executions", async () => {
      const promises = Array.from({ length: 5 }, (_, i) => {
        mockAgent.run.mockResolvedValue({ output: `Response ${i + 1}` });
        return handlerFunction({
          event: { ...mockEvent, data: { value: `Request ${i + 1}` } },
          step: mockStep
        });
      });

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(mockCreateAgent).toHaveBeenCalledTimes(5);
      expect(mockAgent.run).toHaveBeenCalledTimes(5);
    });

    it("should create new agent instance for each function execution", async () => {
      mockAgent.run.mockResolvedValue({ output: "First execution" });
      await handlerFunction({ event: mockEvent, step: mockStep });

      const initialCallCount = mockCreateAgent.mock.calls.length;

      mockAgent.run.mockResolvedValue({ output: "Second execution" });
      await handlerFunction({ event: mockEvent, step: mockStep });

      // Each execution should create a new agent
      expect(mockCreateAgent).toHaveBeenCalledTimes(initialCallCount + 1);
    });

    it("should handle rapid sequential executions", async () => {
      const results = [];
      for (let i = 0; i < 3; i++) {
        mockAgent.run.mockResolvedValue({ output: `Sequential ${i + 1}` });
        const result = await handlerFunction({
          event: { ...mockEvent, data: { value: `Sequential request ${i + 1}` } },
          step: mockStep
        });
        results.push(result);
      }

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({ output: "Sequential 1" });
      expect(results[1]).toEqual({ output: "Sequential 2" });
      expect(results[2]).toEqual({ output: "Sequential 3" });
    });

    it("should handle failed concurrent executions gracefully", async () => {
      const promises = [
        handlerFunction({
          event: { ...mockEvent, data: { value: "Success 1" } },
          step: mockStep
        }),
        handlerFunction({
          event: { ...mockEvent, data: { value: "Failure" } },
          step: mockStep
        }),
        handlerFunction({
          event: { ...mockEvent, data: { value: "Success 2" } },
          step: mockStep
        })
      ];

      // Mock different responses for each call
      mockAgent.run
        .mockResolvedValueOnce({ output: "Success 1 result" })
        .mockRejectedValueOnce(new Error("Failed execution"))
        .mockResolvedValueOnce({ output: "Success 2 result" });

      const results = await Promise.allSettled(promises);

      expect(results).toHaveLength(3);
      expect(results[0].status).toBe("fulfilled");
      expect(results[1].status).toBe("rejected");
      expect(results[2].status).toBe("fulfilled");
    });
  });

  describe("Integration Scenarios", () => {
    it("should work with different step configurations", async () => {
      const customStep = { 
        id: "custom-step", 
        name: "custom-processing",
        metadata: { version: "1.0" }
      };
      mockAgent.run.mockResolvedValue({ output: "Custom step output" });

      const result = await handlerFunction({ event: mockEvent, step: customStep });

      expect(result).toEqual({ output: "Custom step output" });
    });

    it("should handle events with additional metadata", async () => {
      const richEvent = {
        ...mockEvent,
        data: {
          value: "Enhanced component",
          metadata: { userId: "user123", requestId: "req456" },
          context: { framework: "nextjs", version: "14" }
        },
        user: { id: "user123", name: "Test User" },
        source: "web-interface"
      };

      mockAgent.run.mockResolvedValue({ output: "Enhanced component code" });

      const result = await handlerFunction({ event: richEvent, step: mockStep });

      expect(mockAgent.run).toHaveBeenCalledWith("Write the following snippets for : Enhanced component");
      expect(result).toEqual({ output: "Enhanced component code" });
    });

    it("should maintain consistent behavior across different event formats", async () => {
      const eventFormats = [
        { ...mockEvent, data: { value: "Format 1" } },
        { ...mockEvent, data: { value: "Format 2" }, timestamp: Date.now() },
        { ...mockEvent, data: { value: "Format 3" }, source: "test-source" },
        { ...mockEvent, data: { value: "Format 4" }, version: "2.0" }
      ];

      for (const [index, eventFormat] of eventFormats.entries()) {
        mockAgent.run.mockResolvedValue({ output: `Response ${index + 1}` });
        
        const result = await handlerFunction({ event: eventFormat, step: mockStep });
        
        expect(result).toEqual({ output: `Response ${index + 1}` });
        expect(mockAgent.run).toHaveBeenCalledWith(`Write the following snippets for : Format ${index + 1}`);
      }
    });

    it("should handle event replay scenarios", async () => {
      // Simulate the same event being processed multiple times
      const replayEvent = { ...mockEvent, replay: true };
      
      mockAgent.run.mockResolvedValue({ output: "Replayed execution result" });

      const result1 = await handlerFunction({ event: replayEvent, step: mockStep });
      const result2 = await handlerFunction({ event: replayEvent, step: mockStep });

      expect(result1).toEqual({ output: "Replayed execution result" });
      expect(result2).toEqual({ output: "Replayed execution result" });
      expect(mockCreateAgent).toHaveBeenCalledTimes(2);
    });
  });

  describe("System Prompt and Agent Configuration Edge Cases", () => {
    it("should handle system prompt with special characters", async () => {
      // Verify the system prompt is preserved exactly as written
      mockAgent.run.mockResolvedValue({ output: "test" });
      await handlerFunction({ event: mockEvent, step: mockStep });

      const agentConfig = mockCreateAgent.mock.calls[0][0];
      expect(agentConfig.system).toBe("You are an export nextjs developer. You write readable, maintainable code, you write simple next.js & react snippets ");
      
      // Verify it contains the exact text including the trailing space
      expect(agentConfig.system.endsWith(" ")).toBe(true);
    });

    it("should maintain agent name consistency", async () => {
      mockAgent.run.mockResolvedValue({ output: "test" });
      
      // Execute multiple times to ensure consistency
      await handlerFunction({ event: mockEvent, step: mockStep });
      await handlerFunction({ event: mockEvent, step: mockStep });

      const calls = mockCreateAgent.mock.calls;
      expect(calls[0][0].name).toBe("code-agent");
      expect(calls[1][0].name).toBe("code-agent");
    });

    it("should verify model configuration is immutable", async () => {
      mockAgent.run.mockResolvedValue({ output: "test" });
      await handlerFunction({ event: mockEvent, step: mockStep });

      const agentConfig = mockCreateAgent.mock.calls[0][0];
      const modelConfig = agentConfig.model;
      
      expect(modelConfig).toEqual({ model: "gemini-2.0-flash" });
      
      // Verify the mock was called with the exact model configuration
      expect(mockGemini).toHaveBeenCalledWith({ model: "gemini-2.0-flash" });
    });

    it("should handle agent configuration with all required properties", async () => {
      mockAgent.run.mockResolvedValue({ output: "test" });
      await handlerFunction({ event: mockEvent, step: mockStep });

      const agentConfig = mockCreateAgent.mock.calls[0][0];
      
      // Verify all required properties are present
      expect(agentConfig).toHaveProperty('name');
      expect(agentConfig).toHaveProperty('system');
      expect(agentConfig).toHaveProperty('model');
      
      // Verify no unexpected properties
      const expectedKeys = ['name', 'system', 'model'];
      const actualKeys = Object.keys(agentConfig);
      expect(actualKeys.sort()).toEqual(expectedKeys.sort());
    });
  });

  describe("Real-world Usage Patterns", () => {
    it("should handle typical React component requests", async () => {
      const componentRequests = [
        "functional component with useState",
        "class component with lifecycle methods",
        "component with TypeScript props",
        "component with CSS modules",
        "HOC (Higher Order Component)",
        "custom hook for API calls"
      ];

      for (const request of componentRequests) {
        mockAgent.run.mockResolvedValue({ 
          output: `Generated code for: ${request}` 
        });
        
        const testEvent = { ...mockEvent, data: { value: request } };
        const result = await handlerFunction({ event: testEvent, step: mockStep });

        expect(mockAgent.run).toHaveBeenCalledWith(`Write the following snippets for : ${request}`);
        expect(result.output).toContain(request);
      }
    });

    it("should handle Next.js specific requests", async () => {
      const nextjsRequests = [
        "API route with POST method",
        "Server-side rendering page",
        "Static generation with getStaticProps",
        "Dynamic routing with [id].tsx",
        "Middleware for authentication",
        "App Router layout component"
      ];

      for (const request of nextjsRequests) {
        mockAgent.run.mockResolvedValue({ 
          output: `Next.js implementation for: ${request}` 
        });
        
        const testEvent = { ...mockEvent, data: { value: request } };
        const result = await handlerFunction({ event: testEvent, step: mockStep });

        expect(result.output).toContain("Next.js");
        expect(result.output).toContain(request);
      }
    });

    it("should handle TypeScript-specific requests", async () => {
      const typescriptRequests = [
        "interface for user data",
        "generic utility type",
        "enum for status values",
        "type guard function",
        "conditional types example"
      ];

      for (const request of typescriptRequests) {
        mockAgent.run.mockResolvedValue({ 
          output: `TypeScript code: ${request}` 
        });
        
        const testEvent = { ...mockEvent, data: { value: request } };
        const result = await handlerFunction({ event: testEvent, step: mockStep });

        expect(result.output).toContain("TypeScript");
      }
    });
  });
});