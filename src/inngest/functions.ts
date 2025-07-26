import { inngest } from "./client";
import {  gemini, createAgent } from "@inngest/agent-kit";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const codeAgent  = createAgent({
      name:"code-agent",
      system:"You are an export nextjs developer. You write readable, maintainable code, you write simple next.js & react snippets ",
      model:gemini({model:"gemini-2.0-flash"})
    });
   
    const {output } = await codeAgent.run(
      `Write the following snippets for : ${event.data.value}`
    )
    return { output};
  }
);
