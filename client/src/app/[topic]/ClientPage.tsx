"use client"

import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import { useEffect, useState } from "react"
import { Wordcloud } from "@visx/wordcloud"
import { scaleLog } from "@visx/scale"
import { Text } from "@visx/text"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"
import { submitComment } from "../actions"
import { io } from "socket.io-client"
import Link from "next/link"

const socket = io("http://localhost:8080") // ? Where the web server socket is running

interface ClientPageProps {
  topicName: string
  initialData: { text: string; value: number }[]
}

const COLORS = ["#143059", "#2F6B9A", "#82a6c2"]

const ClientPage = ({ topicName, initialData }: ClientPageProps) => {
  const [words, setWords] = useState(initialData)
  const [input, setInput] = useState<string>("")

  useEffect(() => {
    socket.emit("join-room", `room:${topicName}`) // ? Join the room with the topic name
  }, [])

  useEffect(() => {
    socket.on("room-update", (message: string) => {
      const data = JSON.parse(message) as {
        text: string
        value: number
      }[]

      data.map((newWord) => {
        const isWordAlreadyIncluded = words.some(
          (word) => word.text === newWord.text
        )

        if (isWordAlreadyIncluded) {
          // increment
          setWords((prev) => {
            const before = prev.find((word) => word.text === newWord.text)
            const rest = prev.filter((word) => word.text !== newWord.text)

            return [
              ...rest,
              { text: before!.text, value: before!.value + newWord.value }, // * newWord.value is always 1 is better than add naively +1 since if the user write 3 times the same word, it will be 3 instead of 1
            ]
          })
        } else if (words.length < 50) {
          // add to state
          setWords((prev) => [...prev, newWord])
        }
      })
    })

    return () => {

      socket.off("room-update")

    }
  }, [words])



  const fontScale = scaleLog({ // determines how large should each word be
    domain: [
      Math.min(...words.map((w) => w.value)),
      Math.max(...words.map((w) => w.value)),
    ],
    range: [10, 100],
  })

  const { mutate: sendComment, isPending } = useMutation({
    mutationFn: submitComment
  })


  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-grid-rose-100/60 pb-20">
      <MaxWidthWrapper className="flex flex-col items-center gap-6 pt-20">
        <h1 className="text-4xl sm:text-5xl font-bold text-center tracking-tight text-balance">
          What people think about{" "}
          <span className="text-blue-600">{topicName}</span>:
        </h1>

        <p className="text-sm">(updated in real-time)</p>

        <div className="aspect-square max-w-xl flex items-center justify-center">
          <Wordcloud
            words={words}
            width={500}
            height={500}
            fontSize={(data) => fontScale(data.value)}
            font={"Impact"}
            padding={2}
            spiral="archimedean"
            rotate={0}
            random={() => 0.5}
          >
            {(cws) => // $ cws = cloud words
              cws.map((w, i) => (
                <Text
                  key={w.text}
                  fill={COLORS[i % COLORS.length]}
                  textAnchor="middle"
                  transform={`translate(${w.x}, ${w.y})`}
                  fontSize={w.size}
                  fontFamily={w.font}
                >
                  {w.text}
                </Text>
              ))
            }
          </Wordcloud>
        </div>

        <div className="max-w-lg w-full">
          <Label className="font-semibold tracking-tight text-lg pb-2">
            Here&apos;s what I think about {topicName}
          </Label>
          <div className="mt-1 flex gap-2 items-center">
            <Input
              className="border border-blue-400"
              value={input}
              onChange={({ target }) => setInput(target.value)}
              placeholder={`${topicName} is absolutely...`}
            />
            <Button
              disabled={isPending}
              onClick={() => sendComment({ comment: input, topicName })}
            >
              Share
            </Button>
          </div>
        </div>
        <Link href="/" className="bg-slate-900 px-3 py-1 rounded-md hover:bg-slate-800">
          <span className="text-gray-200 text-sm">Go back</span>
        </Link>
      </MaxWidthWrapper>
    </div>
  )
}

export default ClientPage