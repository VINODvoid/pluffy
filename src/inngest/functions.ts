import { inngest } from "./client";
import {  gemini, createAgent } from "@inngest/agent-kit";
import { Sandbox} from "@e2b/code-interpreter"
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id",async () =>{
      const sandbox = await Sandbox.create("pluffy-nextjs-test-2")
      return sandbox.sandboxId;
    })
    const codeAgent  = createAgent({
      name:"code-agent",
      system:"You are an export nextjs developer. You write readable, maintainable code, you write simple next.js & react snippets ",
      model:gemini({model:"gemini-2.0-flash"})
    });
   
    const {output } = await codeAgent.run(
      `Write the following snippets for : ${event.data.value}`
    )
    const sandboxUrl = await step.run("get-sandbox-url",async ()=>{
      const sandbox = await getSandbox(sandboxId)
      const host =  sandbox.getHost(3000);
      return `https://${host}`
    })
    return { output,sandboxUrl};
  }
);
