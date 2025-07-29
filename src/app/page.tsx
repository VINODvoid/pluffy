"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { toast } from "sonner";

/**
 * Renders a button that triggers a background job via a TRPC mutation and displays a success notification upon completion.
 *
 * The button is disabled while the mutation is pending to prevent multiple invocations.
 */
export default function Home() {
  const [value, setValue] = useState<string>("");
  const router = useRouter();
  const trpc = useTRPC();

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess:(data) =>{
        router.push(`/projects/${data.id}`)
      }
    })
  );

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto flex items-center flex-col  gap-y-4 justify-center">
        <Input onChange={(e) => setValue(e.target.value)} value={value} className="w-full" />
        <Button
          variant={"outline"}
          onClick={() => createProject.mutate({ value: value })}
          disabled={createProject.isPending}
        >
          Bake It  🍞
        </Button>
      </div>
    </div>
  );
}
