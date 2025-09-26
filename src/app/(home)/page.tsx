import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectList } from "@/modules/home/ui/components/project-list";
import Image from "next/image";

/**
 * Renders a button that triggers a background job via a TRPC mutation and displays a success notification upon completion.
 *
 * The button is disabled while the mutation is pending to prevent multiple invocations.
 */
export default function Home() {
  // const [value, setValue] = useState<string>("");
  // const router = useRouter();
  // const trpc = useTRPC();

  // const createProject = useMutation(
  //   trpc.projects.create.mutationOptions({
  //     onError: (error) => {
  //       toast.error(error.message);
  //     },
  //     onSuccess:(data) =>{
  //       router.push(`/projects/${data.id}`)
  //     }
  //   })
  // );


  
  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-6 py-[16vh] 2xl:py-48">
        <div className="flex flex-col items-center ">
          <Image 
          src={"/logo.svg"}
          alt="logo"
          width={50}
          height={50}
          className="hidden md:block"
          />
        </div>
        <h1 className="text-2xl md:text-5xl text-primary text-center">
          Bake with <b>Pluffy AI</b>
        </h1>
        <p className=" text-lg md:text-xl text-muted-foreground text-center">
            Create applications and websites by baking yourself with AI
        </p>
        <div className="max-w-3xl mx-auto w-full">
          <ProjectForm/>
        </div>
      </section>
      <ProjectList/>
    </div>
  );
}
