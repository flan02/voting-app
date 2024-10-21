"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useMutation } from "@tanstack/react-query"
import { createTopic } from "@/app/actions"

const TopicCreator = () => {
  const [input, setInput] = useState<string>("")

  const { mutate: newTopic, error, isPending } = useMutation({
    mutationFn: createTopic
  })

  return (
    <div className="mt-12 flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={({ target }) => setInput(target.value)}
          className="bg-white rounded-lg min-w-64 border border-blue-200 text-muted-foreground"
          placeholder="Enter topic here..."
        />
        <Button
          disabled={isPending}
          onClick={() => newTopic({ topicName: input })}
          className="bg-gradient-to-r from-blue-400 to-pink-300 text-slate-200"
        >
          Create
        </Button>
      </div>

      {error ? <p className="text-sm text-red-600">{error.message}</p> : null}
    </div>
  )
}

export default TopicCreator