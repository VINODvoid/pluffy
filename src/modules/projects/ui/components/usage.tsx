import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { formatDuration, intervalToDuration } from "date-fns";
import { CrownIcon } from "lucide-react";
import Link from "next/link";

interface Props {
    points:number;
    msBeforeNext:number;
}


export const Usage = ({points,msBeforeNext}:Props) =>{
    const {has} = useAuth();
    const hasPremiumAccess = has?.({plan:"pro"});
    return (
        <div className="rounded-t-xl bg-background border border-b-0 p-2.5 ">
            <div className="flex items-center gap-x-2">
                <div>
                    <p className="text-sm">
                        {points} {hasPremiumAccess ? "" : "free"} credits remaining
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Resets in {" "} {formatDuration(intervalToDuration({
                            start:new Date(),
                            end:new Date(Date.now()+msBeforeNext),
                        }),
                        {format:["months","days","hours","minutes"]}
                        )}
                        {" "}
                    </p>
                </div>
                {!hasPremiumAccess && (
                <Button
                asChild
                size={"sm"}
                className="ml-auto"
                variant={"tertiary"}
                >
                    <Link href={"/pricing"}>
                    <CrownIcon/> Upgrade
                    </Link>
                </Button>
                )}
            </div>
        </div>
    )
}