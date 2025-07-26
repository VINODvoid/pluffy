"use client"

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import {toast}  from "sonner";

/**
 * Renders a button that triggers a background job via a TRPC mutation and displays a success notification upon completion.
 *
 * The button is disabled while the mutation is pending to prevent multiple invocations.
 */
export default function Home() {
 const trpc =useTRPC();
 const invoke = useMutation(trpc.invoke.mutationOptions({
  onSuccess:()=>{
    toast.success("Background job started")
  }
 }))

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Button onClick={()=> invoke.mutate({text:"hello"})} disabled={invoke.isPending}>
      Invoke Job
      </Button>
    </div>
  );
} 
