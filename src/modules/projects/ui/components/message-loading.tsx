import Image from "next/image";
import { useEffect, useState } from "react";

const ShimmerMessages =() =>{
    const messages =[
        "Thinking...",
        "Loading...",
        "Generating...",
        "Analyzing the request...",
        "Building your website...",
        "Crafting components...",
        "Optimizing layout...",
        "Adding final touches...",
        "Almost ready...",
    ]   ;
    const [currentMessages,setCurrentMessages] = useState(0);
    useEffect(()=>{
        const interval = setInterval(()=>{
            setCurrentMessages((prev)=> (prev+1)%messages.length);
        },3000)

        return ()=> clearInterval(interval);
    })

    return (
        <div className="flex items-center gap-2">
            <span className="text-base text-muted-foreground animate-pulse ">
                {messages[currentMessages]}
            </span>
        </div>
    );
};


export const MessageLoading = () =>{
    return (
        <div className="flex group flex-col px-2 pb-4">
            <div className="flex items-center gap-2 pl-2 mb-2">
                <Image src={"/logo.svg"}
                alt="pluffy"
                height={18}
                width={18}
                className="shrink-0"
                />
                <span className="text-sm font-medium">Pluffy</span>
            </div>
            <div className="pl-8.5 flex flex-col gap-y-4">
        <ShimmerMessages/>
            </div>
        </div>
    )
}