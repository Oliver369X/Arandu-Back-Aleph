import { z } from "zod";

export const crearScheduleSchema = z.object({
  assignmentId: z.string().uuid("Invalid class assignment ID"),
  dayOfWeek: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], {
    errorMap: () => ({ message: "Day of week must be a valid day" })
  }),
  startTime: z.string().datetime("Start time must be a valid datetime"),
  endTime: z.string().datetime("End time must be a valid datetime"),
  quarter: z.string().min(1, "Quarter is required").max(20, "Quarter must be less than 20 characters")
}).refine((data) => new Date(data.startTime) < new Date(data.endTime), {
  message: "End time must be after start time",
  path: ["endTime"]
});
