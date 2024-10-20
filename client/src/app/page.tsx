
import { Icons } from "@/components/Icons"
import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import TopicCreator from "@/components/TopicCreator"
import { redis } from "@/lib/redis"
import { Star } from "lucide-react"
import AnimatedBackground from "@/components/AnimatedBackground"

export default function Home() {
  // const servedRequests = await redis.get("served-requests")

  const servedRequests = 3

  const colorStarBorder = "text-blue-400"
  const colorStarFill = "fill-blue-400"
  return (
    <section className="min-h-screen bg-grid-zinc-50">

      <MaxWidthWrapper className="relative pb-24 pt-10 sm:pb-32 lg:pt-24 xl:pt-32 lg:pb-52">
        <div className="hidden lg:block absolute inset-0 top-8">
          {/* circle */}
        </div>

        <div className="px-6 lg:px-0 lg:pt-4">
          <div className="relative mx-auto text-center flex flex-col items-center">
            <h1 className="bg-gradient-to-r from-blue-400 to-pink-300 bg-clip-text text-transparent relative leading-snug w-fit tracking-tight text-balance mt-16 font-bold text-6xl md:text-7xl">
              Whariya{" "}
              <span className="whitespace-nowrap">
                th
                <span className="relative bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                  i
                  <span className="absolute inset-x-0 -top-0 -translate-x-3">
                    <Icons.brain className="size-7 md:size-8" />
                  </span>
                </span>
                nk
              </span>{" "}
              about...
            </h1>

            <TopicCreator />

            <div className="mt-12 flex flex-col sm:flex-row items-cemter sm:items-start gap-5">
              <div className="flex flex-col gap-1 justify-between items-center">
                <div className="flex gap-0.5">
                  <Star className={`h-4 w-4 ${colorStarBorder} ${colorStarFill}`} />
                  <Star className={`h-4 w-4 ${colorStarBorder} ${colorStarFill}`} />
                  <Star className={`h-4 w-4 ${colorStarBorder} ${colorStarFill}`} />
                  <Star className={`h-4 w-4 ${colorStarBorder} ${colorStarFill}`} />
                  <Star className={`h-4 w-4 ${colorStarBorder} ${colorStarFill}`} />
                </div>

                <p>
                  <span className="font-semibold">
                    {Math.ceil(Number(servedRequests) / 10) * 10}

                  </span>{" "}
                  served requests
                </p>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  )
}
