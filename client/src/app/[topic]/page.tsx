"use server"
// /anything

import { redis } from "@/lib/redis"
import ClientPage from "./ClientPage"

interface PageProps {
  params: {
    topic: string
  }
}

const Page = async ({ params }: PageProps) => {
  const { topic } = params

  // ? pairs of: [members, score] [redis, 3, is, 2, great, 6]
  const initialData = await redis.zrange<(string | number)[]>(
    `room:${topic}`,
    0,
    49, // * we grab the first 50 words
    {
      withScores: true, // * we want the scores for word cloud
    }
  )

  const words: { text: string; value: number }[] = [] // ! we change the array format to an object and store the words here

  for (let i = 0; i < initialData.length; i++) {
    const [text, value] = initialData.slice(i, i + 2) // >[0,1,2] ... [redis, 3, is, 2, great, 6]

    if (typeof text === "string" && typeof value === "number") {
      words.push({ text, value })
    }
  }

  await redis.incr("served-requests") // * increment served requests

  // ! Pay attention, we are passing the initialData from this server component to the client but not with a json object instead we are passing it as a props inside the ClientPage component
  // * When we use an API we must return the data as a json object and retrieve it from the API and pass it as a prop to the component that will render the data
  return <ClientPage initialData={words} topicName={topic} />
}

export default Page