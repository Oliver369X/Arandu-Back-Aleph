import { z } from "zod";

export const actualizarScheduleSchema = z.object({
  id: z.string().uuid("Invalid schedule ID"),
  assignmentId: z.string().uuid("Invalid class assignment ID").optional(),
  dayOfWeek: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], {
    errorMap: () => ({ message: "Day of week must be a valid day" })
  }).optional(),
  startTime: z.string().datetime("Start time must be a valid datetime").optional(),
  endTime: z.string().datetime("End time must be a valid datetime").optional(),
  quarter: z.string().min(1, "Quarter is required").max(20, "Quarter must be less than 20 characters").optional()
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return new Date(data.startTime) < new Date(data.endTime);
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["endTime"]
});
