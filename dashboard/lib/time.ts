/**
 * Compare two time ranges in the format `HH:MM:SS`.
 */
export function compareTimeRanges(timeRange1: string, timeRange2: string) {
  const [hours1, minutes1, seconds1] = timeRange1.split(':').map(Number)
  const [hours2, minutes2, seconds2] = timeRange2.split(':').map(Number)

  if (hours1 !== hours2) {
    return hours1 - hours2
  }

  if (minutes1 !== minutes2) {
    return minutes1 - minutes2
  }

  return seconds1 - seconds2
}
