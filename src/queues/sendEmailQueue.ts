import { createQueue, EQueueNames } from "~/queues";

export type TSendEmailPayload = {
  to: string
  subject: string
  message: string
}

export const SendEmailQueue = createQueue<TSendEmailPayload>(EQueueNames.SEND_EMAIL)