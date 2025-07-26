"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {toast}  from "sonner";

/**
 * Renders a button that triggers a background job via a TRPC mutation and displays a success notification upon completion.
 *
 * The button is disabled while the mutation is pending to prevent multiple invocations.
 */
export default function Home() {
  const [value,setValue] = useState<string>("");

 const trpc =useTRPC();
 const invoke = useMutation(trpc.invoke.mutationOptions({
  onSuccess:()=>{
    toast.success("Background job started")
  }
 }))

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Input onChange={(e)=> setValue(e.target.value)} value={value}/>
      <Button onClick={()=> invoke.mutate({value:value})} disabled={invoke.isPending}>
      Invoke Job
      </Button>
    </div>
  );
} 
