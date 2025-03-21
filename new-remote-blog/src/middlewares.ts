import { AnyAction, Middleware, MiddlewareAPI, isRejected, isRejectedWithValue } from "@reduxjs/toolkit"
import { toast } from "react-toastify"

function isPayloadErrorMessage(payload: unknown): payload is {
  status: number
  data: {
    error: string
  }
} {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    typeof (payload as any).data.error === "string"
  )
}

export const rtkQueryErrorLogger: Middleware = (api: MiddlewareAPI) => (next) => (action: AnyAction) => {
  if (isRejected(action)) {
    if (action.error.name === "CustomError") {
      toast.error(action.error.message)
    }
  }

  if (isRejectedWithValue(action)) {
    if (isPayloadErrorMessage(action.payload)) {
      toast.error(action.payload.data.error)
    }
  }
  return next(action)
}
