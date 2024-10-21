"use server"

import { redis } from "@/lib/redis"
import { redirect } from "next/navigation"

export const createTopic = async ({ topicName }: { topicName: string }) => {
  const regex = /^[a-zA-Z-]+$/ // * only letters and hyphens

  if (!topicName || topicName.length > 50) {
    return { error: "Name must be between 1 and 50 chars" }
  }

  if (!regex.test(topicName)) {
    return { error: "Only letters and hyphens allowed in name" }
  }

  await redis.sadd("existing-topics", topicName)

  // redirect -> localhost:3000/redis
  redirect(`/${topicName}`) // * redirect to the topic page created by the user
}



type SubmitProps = {
  comment: string
  topicName: string
}


export const submitComment = async ({ comment, topicName }: SubmitProps) => {
  try {
    const words = wordFreq(comment) // ? util function to get the frequency of words

    // ? Promise.all is used to wait for all the words to be added to the sorted set
    await Promise.all(
      words.map(async (word) => {
        await redis.zadd(
          `room:${topicName}`,
          { incr: true }, // increment the score if the word already exists
          { member: word.text, score: word.value }
        )
      })
    )

    await redis.incr("served-requests")

    await redis.publish(`room:${topicName}`, words) // * publish the words to the room

    return comment
  } catch (error) {
    console.error(error);
  }
}


type WordProps = {
  text: string;
  value: number
}

// TODO: This wordFreq fc was taken from airbnb/visx docs example

function wordFreq(text: string): WordProps[] {
  const words: string[] = text.replace(/\./g, "").split(/\s/) // * remove dots and split by spaces
  //  hello -> 1
  //  world -> 2

  const freqMap: Record<string, number> = {} // { hello: 1, world: 2 }

  for (const w of words) {
    if (!freqMap[w]) freqMap[w] = 0 // if the word is not in the map, add it
    freqMap[w] += 1 // increment the word count
  }
  return Object.keys(freqMap).map((word) => ({
    text: word,
    value: freqMap[word],
  }))
}

